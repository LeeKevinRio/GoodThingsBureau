import React, { useState, useEffect } from 'react';
import { ShoppingBag, Gift, Truck, Tag } from 'lucide-react';
import { OrderForm } from './components/OrderForm';
import { StatsChart } from './components/StatsChart';
import { LiveTicker } from './components/LiveTicker';
import { RecentOrder, SheetRow } from './types';
import { GOOGLE_SHEET_CONFIG } from './constants';

const App: React.FC = () => {
  // Start with empty array to verify we are loading real data
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Helper function to format relative time
  const timeAgo = (dateString: string) => {
    if (!dateString) return "剛剛";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "剛剛";

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "年前";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "個月前";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "天前";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "小時前";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "分鐘前";
    return "剛剛";
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-red-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const maskName = (name: string) => {
    if (!name) return '團友';
    const cleanName = String(name).trim();
    if (cleanName.length <= 1) return cleanName;
    if (cleanName.length === 2) return cleanName[0] + '*';
    return cleanName[0] + '*' + cleanName.slice(2);
  };

  // Safe getter helper: attempts to find a value using multiple possible keys
  // and handles case-insensitivity
  const safeGet = (row: any, keys: string[]) => {
    if (!row) return undefined;
    
    // 1. Try exact match
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== "") return row[key];
    }

    // 2. Try case-insensitive match
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const foundKey = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== "") return row[foundKey];
    }

    return undefined;
  };

  const fetchOrders = async () => {
    setIsFetching(true);
    
    try {
      const url = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=read&t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow', 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn("Received response is not JSON:", text);
        if (text.includes('Google Docs') || text.includes('drive.google.com')) {
           throw new Error("權限錯誤：請確認 Apps Script 部署設定為「所有人 (Anyone)」");
        }
        return;
      }

      // Handle Script Errors
      if (data && data.result === 'error') {
         console.error("Script Error:", data.error);
         throw new Error(`Script 錯誤: ${data.error}`);
      }

      if (Array.isArray(data)) {
        console.log(`📦 成功讀取 ${data.length} 筆資料`, data[0]);

        const formattedOrders: RecentOrder[] = data.map((row: any, index: number) => {
          // Use the robust safeGet function to handle various column names
          // Priority: defined in script > Chinese header > Common English headers
          const buyerName = safeGet(row, ['name', 'buyer', '姓名', 'Name', 'User']) || '快樂團友';
          const productName = safeGet(row, ['product', 'item', '商品', 'Product', '品項']) || '神秘好物';
          const rawQty = safeGet(row, ['quantity', 'qty', 'amount', '數量', 'Quantity']);
          const rawTimestamp = safeGet(row, ['timestamp', 'time', 'date', '時間', '日期']);
          
          return {
            id: `sheet-${index}-${Date.now()}`, // Generate a temporary unique ID
            buyer: String(buyerName), // Keep raw name for filtering first
            product: String(productName),
            quantity: parseInt(String(rawQty || 1)) || 1,
            time: timeAgo(rawTimestamp || new Date().toISOString()),
            avatarColor: getAvatarColor(String(buyerName))
          };
        });

        // Filter out empty rows AND likely header rows
        const validOrders = formattedOrders.filter(o => {
           const name = o.buyer.trim();
           // 1. Filter empty names
           if (!name || name === '快樂團友' || name === '團友') return false;
           
           // 2. Filter likely header rows (case-insensitive check)
           const lowerName = name.toLowerCase();
           const headerKeywords = ['name', '姓名', 'buyer', 'user', '名稱', '團員姓名'];
           if (headerKeywords.includes(lowerName)) return false;

           return true;
        }).map(o => ({
           ...o,
           buyer: maskName(o.buyer) // Apply masking after filtering
        }));
        
        setRecentOrders(validOrders);
        setFetchError(null); 
      } else {
        console.warn("⚠️ 收到的資料格式不是陣列:", data);
      }
    } catch (error: any) {
      console.error("❌ 連線失敗:", error);
      setFetchError(error.message || "連線失敗");
    } finally {
      setIsFetching(false);
      setHasLoadedOnce(true);
    }
  };

  useEffect(() => {
    fetchOrders(); 
    // Fetch every 10 seconds to keep it lively
    const intervalId = setInterval(fetchOrders, 10000); 
    return () => clearInterval(intervalId);
  }, []);

  const handleNewOrder = (order: RecentOrder) => {
    setRecentOrders(prev => [order, ...prev]);
    // Force refresh after 2 seconds to sync with sheet
    setTimeout(fetchOrders, 2000);
  };

  return (
    <div className="min-h-screen bg-rose-50/50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-lg shadow-md shadow-rose-200">
                <ShoppingBag className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">HappyGroup 快樂團購</h1>
                <p className="text-xs text-rose-500 font-medium">跟著大家買最划算</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-sm font-medium text-slate-900 hover:text-rose-600">本期開團</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-rose-600">到貨進度</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-rose-600">取貨點查詢</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-rose-600">許願池</a>
            </nav>
            <div className="flex items-center space-x-4">
               <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center transition-colors ${fetchError ? 'bg-red-100 text-red-600' : 'bg-rose-100 text-rose-600'}`}>
                 {isFetching && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping mr-2"></span>}
                 {fetchError ? '連線異常' : `目前開團數: ${recentOrders.length + 85}`}
               </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            發現好物，一起 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">快樂跟團</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            嚴選在地美食、異國零食與生活好物。填寫下方表單即可輕鬆加入團購行列，滿額享免運優惠！
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <OrderForm onNewOrder={handleNewOrder} />
            
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-50 flex flex-col items-center text-center">
                  <div className="p-3 bg-rose-50 rounded-full text-rose-500 mb-3">
                    <Tag size={20} />
                  </div>
                  <h4 className="font-bold text-slate-800">批發價格</h4>
                  <p className="text-sm text-slate-500 mt-1">集結眾人之力，爭取最優惠的團購價格。</p>
               </div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-50 flex flex-col items-center text-center">
                  <div className="p-3 bg-orange-50 rounded-full text-orange-500 mb-3">
                    <Truck size={20} />
                  </div>
                  <h4 className="font-bold text-slate-800">省下運費</h4>
                  <p className="text-sm text-slate-500 mt-1">統一寄送至取貨點，省去昂貴的個人運費。</p>
               </div>
               <div className="bg-white p-5 rounded-xl shadow-sm border border-rose-50 flex flex-col items-center text-center">
                  <div className="p-3 bg-green-50 rounded-full text-green-500 mb-3">
                    <Gift size={20} />
                  </div>
                  <h4 className="font-bold text-slate-800">獨家好禮</h4>
                  <p className="text-sm text-slate-500 mt-1">不定期舉辦主購加碼活動，回饋團員。</p>
               </div>
            </div>
          </div>

          {/* Right Column: Stats & Ticker (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <LiveTicker 
               orders={recentOrders} 
               loading={!hasLoadedOnce} 
               error={fetchError}
            />

            <StatsChart />
            
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">📢 團購公告</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start">
                  <span className="mr-2 text-rose-400">•</span>
                  本期冷凍食品預計下週五到貨，請留意冰箱空間。
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-rose-400">•</span>
                  韓國海苔團因船期延誤，預計晚兩天抵達。
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-rose-400">•</span>
                  取貨請自備購物袋，愛護地球。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;