import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, ShoppingCart, User, Mail, MapPin, Check, Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';
import { OrderFormState, SubmissionStatus, CartItem, ProductOption, RecentOrder, GroupSession } from '../types';
import { GOOGLE_SHEET_CONFIG } from '../constants';

interface OrderFormProps {
  onNewOrder: (order: RecentOrder) => void;
  products: ProductOption[];
  groupInfo?: GroupSession; // Optional context about which group we are in
  onBack: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ onNewOrder, products, groupInfo, onBack }) => {
  const [formData, setFormData] = useState<OrderFormState>({
    name: '',
    email: '',
    address: '',
    notes: ''
  });
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<SubmissionStatus>({ type: 'idle' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cart Management
  const addToCart = (product: ProductOption) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, quantity: 1, priceEstimate: product.priceEstimate }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => {
      const price = parseInt(item.priceEstimate.replace(/[^0-9]/g, '')) || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const validate = () => {
    if (!formData.name.trim()) return "請輸入姓名";
    if (!formData.email.trim() || !formData.email.includes('@')) return "請輸入有效的 Email";
    if (cart.length === 0) return "請至少選擇一個團購商品";
    if (!formData.address.trim()) return "請輸入取貨地點或寄送地址";
    return null;
  };

  // Helper to get random color
  const getRandomColor = () => {
    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Helper to mask name (e.g. 王小明 -> 王*明)
  const maskName = (name: string) => {
    if (name.length <= 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*' + name.slice(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    const productSummary = cart.map(item => `${item.name} x${item.quantity}`).join(', ');
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Prepare visual update for Ticker
    const newTickerOrder: RecentOrder = {
      id: Date.now().toString(),
      buyer: maskName(formData.name), // Mask the name for privacy in ticker
      product: cart.length > 1 ? `${cart[0].name} 等${cart.length}樣` : cart[0].name,
      quantity: totalQuantity,
      time: '剛剛', // Just now
      avatarColor: getRandomColor()
    };

    setStatus({ type: 'loading' });

    const payload = {
      action: 'newOrder', // Explicitly state action for backend
      ...formData,
      product: productSummary,
      quantity: totalQuantity,
    };

    try {
      await fetch(GOOGLE_SHEET_CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      });
      
      setStatus({ type: 'success' });
      // Add to ticker!
      onNewOrder(newTickerOrder);

      setCart([]);
      setFormData({ name: '', email: '', address: '', notes: '' });
    } catch (err) {
      console.error("❌ Submission Error:", err);
      setStatus({ type: 'error', message: '提交失敗，請檢查網路連線。' });
    }
  };

  if (status.type === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100 relative">
         <button onClick={onBack} className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} />
         </button>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">團購單已送出！</h3>
        <p className="text-slate-500 mb-6">
          您的訂單已成功登記，請看右側即時動態！
        </p>
        <div className="flex justify-center space-x-4">
           <button 
             onClick={onBack}
             className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
           >
             返回活動列表
           </button>
           <button 
             onClick={() => setStatus({ type: 'idle' })}
             className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
           >
             填寫下一筆
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden">
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-4 text-white">
        <div className="flex items-center">
          <button 
             onClick={onBack} 
             className="mr-3 p-1.5 hover:bg-white/20 rounded-full transition-colors"
             title="返回活動列表"
          >
             <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-lg font-bold flex items-center">
              <ShoppingCart className="mr-2" size={20} />
              {groupInfo ? groupInfo.title : '填寫團購單'}
            </h2>
            <p className="text-rose-100 text-xs mt-0.5 opacity-90">您可以選擇多樣商品，最後再一次結算。</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-b border-rose-100">
        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center">
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs mr-2">1</span>
          點擊圖片加入購物車
        </label>
        
        {/* Visual Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p) => {
            const inCart = cart.find(item => item.id === p.id);
            const qty = inCart ? inCart.quantity : 0;
            
            return (
              <div 
                key={p.id}
                className={`
                  relative group rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white flex flex-col
                  ${qty > 0 ? 'border-rose-500 ring-2 ring-rose-200 shadow-md' : 'border-white hover:border-rose-200 shadow-sm'}
                `}
              >
                {/* Image */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-200 relative">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image'; }}
                  />
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {p.category}
                  </div>
                  
                  {/* Overlay for clicking (Mobile friendly) */}
                  {!qty && (
                    <div 
                      onClick={() => addToCart(p)}
                      className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <div className="bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity transform scale-90 group-hover:scale-100 shadow-lg">
                        <Plus className="text-rose-600" size={24} />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-semibold text-slate-800 text-sm line-clamp-1 mb-1" title={p.name}>
                    {p.name}
                  </h3>
                  
                  {/* Display Description if available */}
                  {p.description && (
                     <p className="text-xs text-slate-500 line-clamp-2 mb-2 bg-slate-50 p-1 rounded">
                        {p.description}
                     </p>
                  )}

                  <div className="flex justify-between items-end mt-auto pt-2">
                    <span className="text-rose-600 font-bold text-sm">{p.priceEstimate}</span>
                    
                    {qty > 0 ? (
                      <div className="flex items-center bg-rose-50 rounded-lg p-0.5 border border-rose-200">
                        <button 
                          onClick={() => qty === 1 ? removeFromCart(p.id) : updateQuantity(p.id, -1)}
                          className="p-1 hover:bg-rose-200 rounded-md text-rose-700 transition-colors"
                        >
                          {qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-rose-800">{qty}</span>
                        <button 
                          onClick={() => updateQuantity(p.id, 1)}
                          className="p-1 hover:bg-rose-200 rounded-md text-rose-700 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button 
                         onClick={() => addToCart(p)}
                         className="text-xs bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-600 px-2 py-1 rounded-md transition-colors"
                      >
                        加入
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fallback Empty state */}
        {products.length === 0 && (
           <div className="text-center p-8 bg-slate-50 rounded-xl">
             <p className="text-slate-500">目前沒有開團商品，請稍後再試。</p>
           </div>
        )}
        
        {/* Fallback Error message */}
        {cart.length === 0 && status.type === 'error' && (
          <p className="text-red-500 text-sm mt-4 font-medium flex items-center justify-center bg-red-50 p-2 rounded-lg">
             <AlertCircle size={16} className="mr-2" />
             請點擊圖片，至少選擇一樣商品。
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
             <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
               <h3 className="font-bold text-slate-700 flex items-center">
                 <ShoppingCart size={18} className="mr-2" />
                 已選商品清單
               </h3>
               <span className="text-xs text-slate-500">共 {cart.reduce((a, b) => a + b.quantity, 0)} 件</span>
             </div>
             <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-700 truncate mr-2">
                       <span className="w-5 h-5 bg-white border border-slate-300 rounded-full flex items-center justify-center text-xs mr-2 font-medium shrink-0">
                         {item.quantity}
                       </span>
                       <span className="truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                       <span className="text-slate-500 mr-3 text-xs">{item.priceEstimate}/個</span>
                       <button type="button" onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500">
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                ))}
             </div>
             <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">預估總金額</span>
                <span className="text-lg font-bold text-rose-600">${calculateTotal()}</span>
             </div>
          </div>
        )}

        <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center">
          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs mr-2">2</span>
          填寫訂購資料
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">團員姓名 / 暱稱</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="怎麼稱呼您？"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gmail 信箱</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="用於接收到貨通知"
              />
            </div>
          </div>
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">取貨方式 / 地址</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-slate-400">
              <MapPin size={18} />
            </span>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="例如：店面自取 或 台北市信義區..."
            />
          </div>
        </div>

        {/* Notes */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">備註 (口味/款式/許願)</label>
           <textarea
             name="notes"
             value={formData.notes}
             onChange={handleChange}
             rows={2}
             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
             placeholder="例如：微糖少冰、這款想要紅色..."
           />
        </div>

        {/* Status Message */}
        {status.type === 'error' && (
          <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            {status.message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.type === 'loading'}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-rose-500/30 flex items-center justify-center transition-all transform active:scale-95
            ${status.type === 'loading' ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700'}
          `}
        >
          {status.type === 'loading' ? (
            <span className="flex items-center">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></span>
              登記中...
            </span>
          ) : (
            <span className="flex items-center">
              確認跟團 (共 {cart.reduce((a,b)=>a+b.quantity,0)} 件) <Send size={20} className="ml-2" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
