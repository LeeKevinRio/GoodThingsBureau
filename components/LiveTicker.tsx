import React, { useEffect, useState } from 'react';
import { RecentOrder } from '../types';
import { Zap, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';

interface LiveTickerProps {
  orders: RecentOrder[];
  loading?: boolean;
  error?: string | null;
}

export const LiveTicker: React.FC<LiveTickerProps> = ({ orders, loading = false, error = null }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // DEBUG: 監控傳入的 props 資料
  // 請按 F12 開啟瀏覽器 Console 查看這些資訊
  console.log('🔍 [LiveTicker 狀態]', { 
    訂單數量: orders.length, 
    讀取中: loading, 
    錯誤訊息: error,
    第一筆訂單資料: orders[0] || '無'
  });

  useEffect(() => {
    // 當訂單長度改變時，重置或更新 Interval
    if (orders.length > 0) {
      console.log('✅ [LiveTicker] 訂單列表已更新，目前共', orders.length, '筆');
    }

    const interval = setInterval(() => {
      if (orders.length > 0) {
        setActiveIndex((prev) => (prev + 1) % orders.length);
      }
    }, 3000); 

    return () => clearInterval(interval);
  }, [orders.length]);

  // We display up to 4 items at a time
  const getVisibleItems = () => {
    if (orders.length === 0) return [];
    
    const items = [];
    const count = Math.min(orders.length, 4); 
    
    for (let i = 0; i < count; i++) {
      const index = (activeIndex + i) % orders.length;
      items.push(orders[index]);
    }
    return items;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-400 to-rose-500 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-bold flex items-center text-sm">
          <Zap size={16} className="mr-2 fill-yellow-200 text-yellow-200" />
          即時跟團動態
        </h3>
        <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">LIVE</span>
      </div>
      
      <div className="p-2 bg-slate-50 h-[240px] relative overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <Loader2 className="animate-spin text-rose-400" size={24} />
            <span className="text-xs">連線 Sheet 資料庫中...</span>
          </div>
        ) : error ? (
           <div className="flex flex-col items-center justify-center h-full text-red-500 space-y-2 px-4 text-center">
            <AlertCircle size={28} className="opacity-80" />
            <span className="text-sm font-bold">讀取失敗</span>
            <span className="text-xs text-red-400">{error}</span>
          </div>
        ) : (
          <div className="space-y-2 transition-all duration-500 ease-in-out">
            {getVisibleItems().map((order, idx) => (
              <div 
                key={`${order.id}-${activeIndex}-${idx}`}
                className={`flex items-center p-3 bg-white rounded-lg border border-slate-100 shadow-sm transition-all duration-500 ${idx === 0 ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}
              >
                <div className={`w-8 h-8 rounded-full ${order.avatarColor} flex items-center justify-center text-white text-xs font-bold mr-3 flex-shrink-0`}>
                  {order.buyer.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-sm font-bold text-slate-800 truncate mr-2">{order.buyer}</span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{order.time}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center truncate">
                     <ShoppingBag size={10} className="mr-1 text-rose-400" />
                     購買了 <span className="font-medium text-rose-600 mx-1">{order.product}</span> x{order.quantity}
                  </div>
                </div>
              </div>
            ))}
            
            {orders.length === 0 && !loading && !error && (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                  <ShoppingBag size={32} className="mb-2 opacity-20" />
                  目前尚無訂單資料
                  <span className="text-xs text-slate-300 mt-1">快來成為第一個團購的人吧！</span>
               </div>
            )}
          </div>
        )}
        
        {/* Gradient Overlay for bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};