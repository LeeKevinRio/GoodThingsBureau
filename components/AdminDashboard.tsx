import React, { useState } from 'react';
import { ProductOption } from '../types';
import { Save, Plus, Trash2, Image as ImageIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { GOOGLE_SHEET_CONFIG } from '../constants';

interface AdminDashboardProps {
  initialProducts: ProductOption[];
  onBack: () => void;
  onUpdateProducts: (products: ProductOption[]) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialProducts, onBack, onUpdateProducts }) => {
  const [products, setProducts] = useState<ProductOption[]>(initialProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleProductChange = (id: string, field: keyof ProductOption, value: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addProduct = () => {
    const newProduct: ProductOption = {
      id: `p-${Date.now()}`,
      name: '',
      category: '未分類',
      priceEstimate: '$100',
      image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=800&q=80' // Default placeholder
    };
    setProducts([newProduct, ...products]);
  };

  const removeProduct = (id: string) => {
    if (confirm('確定要刪除這個商品嗎？')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMsg('');

    try {
      // Send to Google Sheet
      await fetch(GOOGLE_SHEET_CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'saveProducts',
          products: products
        })
      });

      // Update local app state
      onUpdateProducts(products);
      setStatusMsg('✅ 商品設定已儲存！請重新整理頁面或返回前台查看。');
    } catch (error) {
      console.error(error);
      setStatusMsg('❌ 儲存失敗，請檢查網路');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">團主後台管理</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
          {isSaving ? '儲存中...' : '儲存變更'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        
        {statusMsg && (
          <div className={`p-4 mb-6 rounded-lg text-center font-bold ${statusMsg.includes('失敗') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            {statusMsg}
          </div>
        )}

        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
           <h3 className="font-bold text-slate-800 mb-2">💡 小提示</h3>
           <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
             <li>圖片請使用公開的網址 (例如 Imgur, Facebook 公開圖片連結)。</li>
             <li>修改後記得點擊右上角的「儲存變更」。</li>
             <li>這些設定會即時同步到 Google Sheet 的 "Products" 分頁。</li>
           </ul>
        </div>

        <div className="space-y-6">
          <button 
            onClick={addProduct}
            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50 transition-all font-bold"
          >
            <Plus className="mr-2" /> 新增一個商品
          </button>

          {products.map((product, index) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row items-start md:items-stretch">
              {/* Image Preview Area */}
              <div className="w-full md:w-64 h-64 md:h-auto bg-slate-100 relative shrink-0">
                <img 
                  src={product.image} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'; }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center truncate px-2">
                  預覽圖
                </div>
              </div>

              {/* Edit Fields */}
              <div className="flex-1 p-6 space-y-4 w-full">
                <div className="flex justify-between items-start">
                   <div className="bg-slate-100 text-xs px-2 py-1 rounded text-slate-500">
                      ID: {product.id}
                   </div>
                   <button onClick={() => removeProduct(product.id)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 size={20} />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">商品名稱</label>
                    <input 
                      type="text" 
                      value={product.name}
                      onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="例如：爆漿餐包"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">價格 (含單位)</label>
                    <input 
                      type="text" 
                      value={product.priceEstimate}
                      onChange={(e) => handleProductChange(product.id, 'priceEstimate', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="$100/個"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">分類</label>
                    <select 
                      value={product.category}
                      onChange={(e) => handleProductChange(product.id, 'category', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-rose-500 outline-none"
                    >
                      <option value="冷凍美食">冷凍美食</option>
                      <option value="異國零食">異國零食</option>
                      <option value="在地小農">在地小農</option>
                      <option value="生活用品">生活用品</option>
                      <option value="進口飲品">進口飲品</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">圖片網址</label>
                    <div className="flex items-center">
                      <ImageIcon size={16} className="text-slate-400 mr-2" />
                      <input 
                        type="text" 
                        value={product.image}
                        onChange={(e) => handleProductChange(product.id, 'image', e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-rose-500 outline-none text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};