import React, { useState, useEffect } from 'react';
import { ShoppingBag, Gift, Truck, Tag, Settings, Users, PenTool } from 'lucide-react';
import { OrderForm } from './components/OrderForm';
import { StatsChart } from './components/StatsChart';
import { LiveTicker } from './components/LiveTicker';
import { LeaderView } from './components/LeaderView';
import { GroupList } from './components/GroupList'; 
import { RecentOrder, ProductOption, GroupSession } from './types';
import { GOOGLE_SHEET_CONFIG, PREDEFINED_PRODUCTS } from './constants';

const App: React.FC = () => {
  // --- Data State ---
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [products, setProducts] = useState<ProductOption[]>(PREDEFINED_PRODUCTS);
  const [groups, setGroups] = useState<GroupSession[]>([]);
  
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<'buyer' | 'leader'>('buyer');
  const [selectedGroup, setSelectedGroup] = useState<GroupSession | null>(null); 
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

  const safeGet = (row: any, keys: string[]) => {
    if (!row) return undefined;
    for (const key of keys) {
      if (row[key] !== undefined && row[key] !== "") return row[key];
    }
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const foundKey = rowKeys.find(k => k.toLowerCase() === key.toLowerCase());
      if (foundKey && row[foundKey] !== undefined && row[foundKey] !== "") return row[foundKey];
    }
    return undefined;
  };

  // --- Fetch Data ---
  const fetchAllData = async () => {
    setIsFetching(true);
    try {
      // 1. Fetch Orders
      const orderUrl = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=read&t=${Date.now()}`;
      const orderRes = await fetch(orderUrl, { method: 'GET', redirect: 'follow' });
      if (!orderRes.ok) throw new Error("API Connect Error");
      const orderData = await orderRes.json();

      if (orderData.result !== 'error' && Array.isArray(orderData)) {
         const formattedOrders: RecentOrder[] = orderData.map((row: any, index: number) => {
          const buyerName = safeGet(row, ['name', 'buyer', '姓名', 'Name']) || '快樂團友';
          const productName = safeGet(row, ['product', 'item', '商品', 'Product']) || '神秘好物';
          const rawQty = safeGet(row, ['quantity', 'qty', 'amount', '數量']);
          const rawTimestamp = safeGet(row, ['timestamp', 'time', 'date', '時間']);
          return {
            id: `sheet-${index}`,
            buyer: String(buyerName),
            product: String(productName),
            quantity: parseInt(String(rawQty || 1)) || 1,
            time: timeAgo(rawTimestamp || new Date().toISOString()),
            avatarColor: getAvatarColor(String(buyerName))
          };
        });
        
        const validOrders = formattedOrders.filter(o => {
           const name = o.buyer.trim();
           if (!name || name === '快樂團友' || name === '團友') return false;
           const lowerName = name.toLowerCase();
           if (['name', '姓名', 'buyer', 'user'].includes(lowerName)) return false;
           return true;
        }).map(o => ({ ...o, buyer: maskName(o.buyer) }));
        setRecentOrders(validOrders);
      }

      // 2. Fetch Products
      const productUrl = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=getProducts&t=${Date.now()}`;
      const productRes = await fetch(productUrl, { method: 'GET', redirect: 'follow' });
      const productData = await productRes.json();

      if (Array.isArray(productData) && productData.length > 0) {
        setProducts(productData);
      }

      // 3. Fetch Groups
      console.log("🚀 [App] 開始抓取 Groups (開團列表)...");
      const groupUrl = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=getGroups&t=${Date.now()}`;
      const groupRes = await fetch(groupUrl, { method: 'GET', redirect: 'follow' });
      const groupData = await groupRes.json();
      
      console.log("📦 [App] 收到 Groups 原始資料:", groupData);

      // --- Enhanced Debugging ---
      if (groupData && groupData.result === 'error') {
         console.error("❌ [App] 後端回傳錯誤:", groupData.error);
         console.error("💡 [提示] 這通常是因為 Google Apps Script 沒有發布「新版本」。請到 GAS 編輯器 -> 部署 -> 管理部署 -> 編輯 -> 選擇「建立新版本」 -> 部署。");
      } 
      else if (Array.isArray(groupData)) {
         if (groupData.length === 0) {
            console.warn("⚠️ [App] Google Script 回傳空陣列 []。請檢查 Google Sheet 的 'Groups' 分頁是否有資料 (第一列必須是標題，資料從第二列開始)。");
         }

        // Map to ensure shape matches interface
        const mappedGroups: GroupSession[] = groupData.map((g: any) => ({
           id: g.id || 'g1',
           title: g.title || '未命名團購',
           description: g.description || '',
           status: g.status || 'closed',
           image: g.image || '',
           endDate: g.endDate || '',
           participantCount: g.participantCount || 0
        }));
        console.log("✅ [App] 格式化後的 Groups:", mappedGroups);
        setGroups(mappedGroups);
      } else {
        console.warn("⚠️ [App] Groups 格式不正確 (既不是陣列也不是標準錯誤格式)", groupData);
      }
      
      setFetchError(null);

    } catch (error: any) {
      console.error("❌ Fetch Error:", error);
      setFetchError("連線異常，顯示舊資料");
    } finally {
      setIsFetching(false);
      setHasLoadedOnce(true);
    }
  };

  useEffect(() => {
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleNewOrder = (order: RecentOrder) => {
    setRecentOrders(prev => [order, ...prev]);
    setTimeout(fetchAllData, 2000);
  };

  // Filter products based on selected group
  const displayedProducts = selectedGroup 
    ? products.filter(p => p.groupId === selectedGroup.id)
    : [];

  return (
    <div className="min-h-screen bg-rose-50/50 font-sans text-slate-900 pb-20">
      
      {/* Top Tab Navigation */}
      <div className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-2 rounded-lg shadow-md shadow-rose-200">
                  <ShoppingBag className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden md:block">HappyGroup 快樂團購</h1>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 md:hidden">HappyGroup</h1>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => { setActiveTab('buyer'); setSelectedGroup(null); }}
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'buyer' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Users size={16} className="mr-2" />
                  我要跟團
                </button>
                <button 
                  onClick={() => setActiveTab('leader')}
                  className={`flex items-center px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'leader' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <PenTool size={16} className="mr-2" />
                  我是主購
                </button>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'leader' ? (
        <LeaderView 
          allProducts={products}
          groups={groups}
          onRefresh={fetchAllData}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {/* Hero Section (Only show on Group List) */}
          {!selectedGroup && (
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                發現好物，一起 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">快樂跟團</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                嚴選在地美食、異國零食與生活好物。選擇您喜歡的團購活動，滿額享免運優惠！
              </p>
            </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form or List (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {selectedGroup ? (
                // 2. View: Order Form (Specific Group)
                <OrderForm 
                  onNewOrder={handleNewOrder} 
                  products={displayedProducts} 
                  groupInfo={selectedGroup}
                  onBack={() => setSelectedGroup(null)}
                />
              ) : (
                // 1. View: Group List (Lobby)
                <GroupList 
                   groups={groups}
                   onSelectGroup={setSelectedGroup} 
                   loading={!hasLoadedOnce && isFetching}
                />
              )}
              
              {!selectedGroup && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
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
              )}
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
      )}
    </div>
  );
};

export default App;