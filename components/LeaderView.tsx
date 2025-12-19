import React, { useState, useEffect } from 'react';
import { ProductOption, GroupSession } from '../types';
import { Save, Plus, Trash2, Image as ImageIcon, Sparkles, Loader2, LayoutGrid, DollarSign, Type, ArrowLeft, Edit2, Calendar, Lock, Globe, Settings, Tag } from 'lucide-react';
import { GOOGLE_SHEET_CONFIG } from '../constants';
import { generateProductDescription } from '../services/geminiService';

interface LeaderViewProps {
  allProducts: ProductOption[];
  groups: GroupSession[];
  onRefresh: () => void;
}

/**
 * 團主後台管理視圖
 * Allows the group leader to create new groups, edit existing ones, and manage products.
 */
export const LeaderView: React.FC<LeaderViewProps> = ({ allProducts, groups, onRefresh }) => {
  // Mode: 'list' shows all groups. 'edit' shows the form for a single group.
  const [mode, setMode] = useState<'list' | 'edit'>('list');
  
  // 編輯中的暫存資料
  const [editGroup, setEditGroup] = useState<GroupSession | null>(null);
  const [editProducts, setEditProducts] = useState<ProductOption[]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null); // Track which product is generating AI text
  const [statusMsg, setStatusMsg] = useState('');

  // --- Actions ---

  // 建立新團購活動 (初始化預設值)
  const handleCreateGroup = () => {
    const newId = `g-${Date.now()}`;
    const newGroup: GroupSession = {
      id: newId,
      title: '新開團購活動',
      description: '',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
      status: 'coming_soon',
      endDate: '2024/12/31',
      participantCount: 0
    };
    setEditGroup(newGroup);
    setEditProducts([]);
    setStatusMsg('');
    setMode('edit');
  };

  // 編輯現有活動
  const handleEditGroup = (group: GroupSession) => {
    setEditGroup(group);
    // 篩選出屬於該團購的商品
    const groupProducts = allProducts.filter(p => p.groupId === group.id);
    setEditProducts(groupProducts);
    setStatusMsg('');
    setMode('edit');
  };

  const handleGroupFieldChange = (field: keyof GroupSession, value: string) => {
    if (!editGroup) return;
    setEditGroup({ ...editGroup, [field]: value });
  };

  // --- Product Actions inside Editor ---

  const handleAddProduct = () => {
    if (!editGroup) return;
    const newProduct: ProductOption = {
      id: `p-${Date.now()}`,
      name: '',
      category: '未分類',
      priceEstimate: '$100',
      image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=400&q=80',
      description: '',
      groupId: editGroup.id // 自動關聯到當前團購 ID
    };
    setEditProducts([newProduct, ...editProducts]);
  };

  const handleProductChange = (id: string, field: keyof ProductOption, value: string) => {
    setEditProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleRemoveProduct = (id: string) => {
    if (confirm('確定要移除這個商品嗎？')) {
      setEditProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // AI 自動生成文案按鈕處理
  const handleAIGenerate = async (product: ProductOption) => {
    if (!product.name) {
      alert('請先輸入商品名稱');
      return;
    }
    setIsGeneratingAI(product.id);
    const description = await generateProductDescription(product.name, product.priceEstimate);
    handleProductChange(product.id, 'description', description);
    setIsGeneratingAI(null);
  };

  // --- Saving Logic (儲存到 Google Sheets) ---

  const handleSaveAll = async () => {
    if (!editGroup) return;
    setIsSaving(true);
    setStatusMsg('儲存中...');

    try {
      // 1. 儲存團購活動設定 (Group Metadata)
      const groupPayload = {
        action: 'saveGroup',
        group: editGroup
      };
      
      await fetch(GOOGLE_SHEET_CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(groupPayload)
      });

      // 2. 儲存商品列表 (Products)
      // 重要：後端的 'saveProducts' 是覆寫整個 Sheet。
      // 所以我們必須將「當前編輯的商品」與「其他團購的商品」合併，避免遺失其他活動的資料。
      const otherProducts = allProducts.filter(p => p.groupId !== editGroup.id);
      const allProductsToSave = [...editProducts, ...otherProducts];

      const productPayload = {
        action: 'saveProducts',
        products: allProductsToSave
      };

      await fetch(GOOGLE_SHEET_CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(productPayload)
      });

      setStatusMsg('✅ 儲存成功！');
      onRefresh(); // 觸發外層 App 重新抓取資料
      
    } catch (error) {
      console.error(error);
      setStatusMsg('❌ 儲存失敗，請檢查網路');
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render: Group List Mode (活動列表) ---
  if (mode === 'list') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">團購管理後台</h2>
            <p className="text-slate-500 mt-1">管理您的開團活動與商品</p>
          </div>
          <button 
            onClick={handleCreateGroup}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-indigo-200 transition-all"
          >
            <Plus className="mr-2" /> 建立新團購
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="h-40 bg-slate-100 relative">
                <img src={group.image} alt={group.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-slate-700">
                  {group.status === 'open' ? '進行中' : group.status === 'coming_soon' ? '即將開始' : '已結束'}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{group.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 h-10">{group.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                   <span>ID: {group.id}</span>
                   <span>{group.endDate}</span>
                </div>
                <button 
                  onClick={() => handleEditGroup(group)}
                  className="mt-6 w-full py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold rounded-lg transition-colors flex items-center justify-center"
                >
                  <Edit2 size={16} className="mr-2" /> 管理內容與商品
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty State */}
          {groups.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <p className="text-slate-500 mb-4">目前還沒有任何團購活動</p>
               <button onClick={handleCreateGroup} className="text-indigo-600 font-bold hover:underline">
                 立即建立第一個團購
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Render: Edit Mode (編輯器) ---
  if (!editGroup) return null;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button onClick={() => setMode('list')} className="p-2 hover:bg-slate-100 rounded-full mr-2 text-slate-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-slate-800 text-lg flex items-center">
                編輯中：{editGroup.title}
                <span className="ml-3 text-xs font-normal bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                  ID: {editGroup.id}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {statusMsg && <span className={`text-sm font-bold ${statusMsg.includes('失敗') ? 'text-red-500' : 'text-green-600'}`}>{statusMsg}</span>}
            <button 
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold flex items-center shadow-md shadow-rose-200 transition-all disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
              {isSaving ? '儲存中...' : '儲存變更'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Group Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <Settings className="mr-2" size={20} /> 團購基本設定
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">團購標題</label>
                <input 
                  type="text" 
                  value={editGroup.title}
                  onChange={(e) => handleGroupFieldChange('title', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                  placeholder="例如：二月日本連線"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">封面圖片網址</label>
                <div className="mb-2 h-32 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                  <img src={editGroup.image} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x200?text=Image'} />
                </div>
                <input 
                  type="text" 
                  value={editGroup.image}
                  onChange={(e) => handleGroupFieldChange('image', e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">狀態</label>
                   <select 
                     value={editGroup.status}
                     onChange={(e) => handleGroupFieldChange('status', e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                   >
                     <option value="open">🟢 進行中</option>
                     <option value="coming_soon">🔵 即將開始</option>
                     <option value="closed">🔴 已結束</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 mb-1">截止日期</label>
                   <input 
                     type="text"
                     value={editGroup.endDate || ''}
                     onChange={(e) => handleGroupFieldChange('endDate', e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                     placeholder="YYYY/MM/DD"
                   />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">活動描述</label>
                <textarea 
                  value={editGroup.description}
                  onChange={(e) => handleGroupFieldChange('description', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                  placeholder="寫一些吸引人的介紹..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Products */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-xl flex items-center">
              <LayoutGrid className="mr-2" size={24} /> 
              團購商品 ({editProducts.length})
            </h3>
            <button 
              onClick={handleAddProduct}
              className="bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-bold flex items-center transition-colors text-sm shadow-sm"
            >
              <Plus className="mr-1" size={16} /> 新增商品
            </button>
          </div>

          <div className="space-y-4">
            {editProducts.length === 0 && (
              <div className="p-10 bg-white rounded-xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                此團購尚未設定任何商品
              </div>
            )}

            {editProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                {/* Image Preview */}
                <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden relative group">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-white text-xs mb-1">更換圖片連結</span>
                  </div>
                </div>

                {/* Edit Fields */}
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                     <div className="flex-1 mr-4">
                       <input 
                         type="text" 
                         value={product.name} 
                         onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                         className="w-full font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1 py-0.5 transition-colors"
                         placeholder="輸入商品名稱"
                       />
                     </div>
                     <button onClick={() => handleRemoveProduct(product.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                       <Trash2 size={18} />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                       <DollarSign size={14} className="text-slate-400 mr-1" />
                       <input 
                         type="text" 
                         value={product.priceEstimate}
                         onChange={(e) => handleProductChange(product.id, 'priceEstimate', e.target.value)}
                         className="w-full text-sm text-rose-600 font-bold border-b border-transparent hover:border-slate-300 focus:border-rose-500 outline-none px-1"
                         placeholder="價格"
                       />
                    </div>
                    <div className="flex items-center">
                       <Tag size={14} className="text-slate-400 mr-1" />
                       <select 
                         value={product.category}
                         onChange={(e) => handleProductChange(product.id, 'category', e.target.value)}
                         className="w-full text-sm text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1"
                       >
                         <option value="未分類">未分類</option>
                         <option value="冷凍美食">冷凍美食</option>
                         <option value="異國零食">異國零食</option>
                         <option value="在地小農">在地小農</option>
                         <option value="生活用品">生活用品</option>
                         <option value="進口飲品">進口飲品</option>
                         <option value="其他">其他</option>
                       </select>
                    </div>
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      value={product.image}
                      onChange={(e) => handleProductChange(product.id, 'image', e.target.value)}
                      className="w-full text-xs text-slate-400 bg-slate-50 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300"
                      placeholder="圖片網址..."
                    />
                  </div>

                  <div className="relative">
                     <textarea
                       value={product.description || ''}
                       onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                       rows={1}
                       className="w-full text-sm text-slate-600 bg-slate-50 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300 resize-none overflow-hidden"
                       placeholder="商品文案..."
                     />
                     <button 
                       onClick={() => handleAIGenerate(product)}
                       disabled={isGeneratingAI === product.id}
                       className="absolute right-1 bottom-1 p-1 text-indigo-400 hover:text-indigo-600 bg-indigo-50 rounded transition-colors"
                       title="AI 生成文案"
                     >
                        {isGeneratingAI === product.id ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14} />}
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};