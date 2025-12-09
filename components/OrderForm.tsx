import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, ShoppingBag, User, Mail, Hash, MapPin } from 'lucide-react';
import { OrderFormState, SubmissionStatus } from '../types';
import { PREDEFINED_PRODUCTS, GOOGLE_SHEET_CONFIG } from '../constants';
import { analyzeOrderTrend } from '../services/geminiService';

interface OrderFormProps {
  initialProduct?: string;
  onClearInitialProduct: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialProduct, onClearInitialProduct }) => {
  const [formData, setFormData] = useState<OrderFormState>({
    name: '',
    email: '',
    address: '',
    product: '',
    quantity: 1,
    notes: ''
  });
  const [status, setStatus] = useState<SubmissionStatus>({ type: 'idle' });
  const [aiTip, setAiTip] = useState<string>('');

  // Update product when selected from AI Assistant
  useEffect(() => {
    if (initialProduct) {
      setFormData(prev => ({ ...prev, product: initialProduct }));
      onClearInitialProduct(); 
      
      // Get a quick AI tip for the selected product
      analyzeOrderTrend(initialProduct).then(setAiTip);
    }
  }, [initialProduct, onClearInitialProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "請輸入姓名";
    if (!formData.email.trim() || !formData.email.includes('@')) return "請輸入有效的 Email";
    if (!formData.address.trim()) return "請輸入收件地址";
    if (!formData.product) return "請選擇或輸入商品名稱";
    if (formData.quantity < 1) return "數量至少為 1";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validate();
    if (error) {
      setStatus({ type: 'error', message: error });
      return;
    }

    // Check if user has configured the URL
    if (GOOGLE_SHEET_CONFIG.SCRIPT_URL.includes('REPLACE_WITH')) {
       const isDemo = window.confirm(
         "⚠️ 設定尚未完成\n\n" + 
         "您尚未在 constants.ts 中更新 'SCRIPT_URL' 為您的 Google Apps Script 網址。\n\n" +
         "點擊 [確定] 進入演示模式 (Demo Mode - 資料不會儲存)。\n" +
         "點擊 [取消] 返回並修正程式碼。"
       );

       if (isDemo) {
         console.log("%c[DEMO MODE] Form Data:", "color: #0ea5e9; font-weight: bold;", formData);
         setStatus({ type: 'loading' });
         await new Promise(r => setTimeout(r, 1500)); // Fake delay
         setStatus({ type: 'success' });
         setFormData({ name: '', email: '', address: '', product: '', quantity: 1, notes: '' });
         setAiTip('');
       }
       return;
    }

    setStatus({ type: 'loading' });

    // Debug Log
    console.log("🚀 Submitting to Google Sheets...");
    console.log("URL:", GOOGLE_SHEET_CONFIG.SCRIPT_URL);
    console.log("Payload:", JSON.stringify(formData));

    try {
      // Send data to Google Apps Script Web App
      // We use 'no-cors' mode because Apps Script redirects can cause CORS errors in strict browsers.
      // The script will still receive and process the data.
      await fetch(GOOGLE_SHEET_CONFIG.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain', // Use text/plain to avoid preflight options request
        },
        body: JSON.stringify(formData)
      });
      
      console.log("✅ Request sent (Note: 'no-cors' mode hides the actual response status from the browser)");

      // Since we used no-cors, we can't read the response status, 
      // but if no network error occurred, we assume success.
      setStatus({ type: 'success' });
      setFormData({ name: '', email: '', address: '', product: '', quantity: 1, notes: '' });
      setAiTip('');
    } catch (err) {
      console.error("❌ Submission Error:", err);
      setStatus({ type: 'error', message: '提交失敗，請檢查網路連線。' });
    }
  };

  if (status.type === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">委託單已收到！</h3>
        <p className="text-slate-500 mb-6">
          我們已將您的需求記錄在案，稍後將透過 <strong>{formData.email}</strong> 與您聯繫。
        </p>
        <button 
          onClick={() => setStatus({ type: 'idle' })}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          提交另一筆委託
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 p-6 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <ShoppingBag className="mr-2" size={24} />
          新增代購委託
        </h2>
        <p className="text-slate-400 text-sm mt-1">請填寫以下資訊，我們將為您處理後續事宜。</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
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
              placeholder="請輸入您的真實姓名"
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
              placeholder="example@gmail.com"
            />
          </div>
        </div>

        {/* Address Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">收件地址 (台灣)</label>
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
              placeholder="請輸入完整地址 (包含縣市/區/路/號/樓層)"
            />
          </div>
        </div>

        {/* Product Selection (Dropdown with Search) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">商品名稱</label>
            <div className="relative">
              <input
                list="predefined-products"
                type="text"
                name="product"
                value={formData.product}
                onChange={handleChange}
                className="w-full pl-4 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="選擇或輸入商品名稱..."
                autoComplete="off"
              />
              <datalist id="predefined-products">
                {PREDEFINED_PRODUCTS.map(p => (
                  <option key={p.id} value={p.name}>{p.category} - {p.priceEstimate}</option>
                ))}
              </datalist>
            </div>
            {aiTip && (
              <p className="text-xs text-indigo-600 mt-2 flex items-start bg-indigo-50 p-2 rounded">
                <span className="font-bold mr-1">AI 建議:</span> {aiTip}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">數量</label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400">
                <Hash size={18} />
              </span>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">其他備註 (選填)</label>
           <textarea
             name="notes"
             value={formData.notes}
             onChange={handleChange}
             rows={2}
             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
             placeholder="顏色、尺寸、網址連結..."
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
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg shadow-primary-500/30 flex items-center justify-center transition-all transform active:scale-95
            ${status.type === 'loading' ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400'}
          `}
        >
          {status.type === 'loading' ? (
            <span className="flex items-center">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></span>
              處理中...
            </span>
          ) : (
            <span className="flex items-center">
              送出委託 <Send size={20} className="ml-2" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
};