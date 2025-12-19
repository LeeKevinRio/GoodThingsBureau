import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, PenTool, ArrowRight, Clock, ClipboardList, Sparkles, ShieldCheck, LogOut } from 'lucide-react';
import { OrderForm } from './components/OrderForm';
import { LiveTicker } from './components/LiveTicker';
import { LeaderView } from './components/LeaderView';
import { GroupList } from './components/GroupList'; 
import { OrderDetailsView } from './components/OrderDetailsView';
import { RecentOrder, ProductOption, GroupSession } from './types';
import { GOOGLE_SHEET_CONFIG, PREDEFINED_PRODUCTS } from './constants';

const App: React.FC = () => {
  // --- Data State ---
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [products, setProducts] = useState<ProductOption[]>(PREDEFINED_PRODUCTS);
  const [groups, setGroups] = useState<GroupSession[]>([]);
  
  // --- UI & Access State ---
  const [activeTab, setActiveTab] = useState<'buyer' | 'leader' | 'orders'>('buyer');
  const [selectedGroup, setSelectedGroup] = useState<GroupSession | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // 管理員判定邏輯
  const [isAdmin, setIsAdmin] = useState(false);

  // 初始化時檢查 URL 參數
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'admin') {
      setIsAdmin(true);
      console.log("🔓 管理員模式已透過網址參數解鎖");
    }
  }, []);

  // 登出處理
  const handleLogout = () => {
    // 1. 隱藏管理權限
    setIsAdmin(false);
    // 2. 切換回跟團頁面
    setActiveTab('buyer');
    setSelectedGroup(null);
    // 3. 清除網址上的管理參數，避免重新整理後又跑回來
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());
  };

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

  const fetchAllData = async () => {
    setIsFetching(true);
    try {
      const orderUrl = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=read&t=${Date.now()}`;
      const orderRes = await fetch(orderUrl, { method: 'GET', redirect: 'follow' });
      const orderData = await orderRes.json();

      if (orderData.result !== 'error' && Array.isArray(orderData)) {
         const formattedOrders: RecentOrder[] = orderData.map((row: any, index: number) => {
          const buyerName = safeGet(row, ['name', 'buyer', '姓名', 'Name']) || '局員';
          const productName = safeGet(row, ['product', 'item', '商品', 'Product']) || '神秘好物';
          const rawQty = safeGet(row, ['quantity', 'qty', 'amount', '數量']);
          const rawTimestamp = safeGet(row, ['timestamp', 'time', 'date', '時間']);
          const email = safeGet(row, ['email', 'mail', '信箱']);
          const address = safeGet(row, ['address', 'addr', '地址', '取貨地點']);
          const notes = safeGet(row, ['notes', 'memo', '備註']);
          const groupId = safeGet(row, ['groupId', 'group_id', '團購ID', 'Group ID']);

          return {
            id: `sheet-${index}`,
            buyer: String(buyerName),
            realName: String(buyerName),
            email: email ? String(email) : undefined,
            address: address ? String(address) : undefined,
            notes: notes ? String(notes) : undefined,
            product: String(productName),
            quantity: parseInt(String(rawQty || 1)) || 1,
            time: timeAgo(rawTimestamp || new Date().toISOString()),
            rawTimestamp: rawTimestamp,
            avatarColor: getAvatarColor(String(buyerName)),
            groupId: groupId ? String(groupId) : undefined
          };
        });
        
        const validOrders = formattedOrders.filter(o => {
           const name = o.realName?.trim();
           return name && name !== '局員';
        }).map(o => ({ ...o, buyer: maskName(o.buyer) }));

        setRecentOrders(validOrders);
      }

      const productUrl = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=getProducts&t=${Date.now()}`;
      const productRes = await fetch(productUrl, { method: 'GET', redirect: 'follow' });
      const productData = await productRes.json();
      if (Array.isArray(productData)) setProducts(productData);

      const groupUrl = `${GOOGLE_SHEET_CONFIG.SCRIPT_URL}?action=getGroups&t=${Date.now()}`;
      const groupRes = await fetch(groupUrl, { method: 'GET', redirect: 'follow' });
      const groupData = await groupRes.json();
      if (Array.isArray(groupData)) {
        const today = new Date();
        const mappedGroups: GroupSession[] = groupData.map((g: any) => {
           let status = g.status || 'closed';
           if (g.endDate) {
             const endDate = new Date(g.endDate);
             if (g.endDate.trim().length <= 10) endDate.setHours(23, 59, 59, 999);
             if (!isNaN(endDate.getTime()) && today.getTime() > endDate.getTime() && status === 'open') status = 'closed';
           }
           return { id: g.id || 'g1', title: g.title || '未命名', description: g.description || '', status: status, image: g.image || '', endDate: g.endDate || '', participantCount: g.participantCount || 0 };
        });
        setGroups(mappedGroups);
      }
      setFetchError(null);
    } catch (error: any) {
      setFetchError("資料同步中...");
    } finally {
      setIsFetching(false);
      setHasLoadedOnce(true);
    }
  };

  useEffect(() => {
    fetchAllData();
    const intervalId = setInterval(fetchAllData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const handleNewOrder = (order: RecentOrder) => {
    setRecentOrders(prev => [order, ...prev]);
    setTimeout(fetchAllData, 2000);
  };

  const displayedProducts = selectedGroup ? products.filter(p => p.groupId === selectedGroup.id) : [];

  return (
    <div className="min-h-screen bg-rose-50/30 font-sans text-slate-900 flex flex-col">
      {/* 頂部導覽列 */}
      <div className="bg-white border-b border-rose-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-2 rounded-lg shadow-md">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">神秘好物發現局</h1>
              </div>

              {/* 權限控制與登出按鈕 */}
              {isAdmin && (
                <div className="flex items-center space-x-4">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => { setActiveTab('buyer'); setSelectedGroup(null); }} className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'buyer' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <Users size={14} className="mr-1.5" />我要跟團
                    </button>
                    <button onClick={() => setActiveTab('leader')} className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'leader' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <PenTool size={14} className="mr-1.5" />我是主購
                    </button>
                    <button onClick={() => setActiveTab('orders')} className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                      <ClipboardList size={14} className="mr-1.5" />詳細統計
                    </button>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors flex items-center text-xs font-bold"
                    title="局長登出"
                  >
                    <LogOut size={16} className="mr-1.5" /> 登出
                  </button>
                </div>
              )}
           </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'leader' && isAdmin ? (
          <LeaderView allProducts={products} groups={groups} onRefresh={fetchAllData} />
        ) : activeTab === 'orders' && isAdmin ? (
          <OrderDetailsView groups={groups} orders={recentOrders} products={products} />
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {!selectedGroup && (
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">
                  神秘好物發現，<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">快快跟團</span>
                </h2>
                <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full mt-4"></div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-8">
                {selectedGroup ? (
                  <OrderForm key={selectedGroup.id} onNewOrder={handleNewOrder} products={displayedProducts} groupInfo={selectedGroup} onBack={() => setSelectedGroup(null)} />
                ) : (
                  <GroupList groups={groups} onSelectGroup={setSelectedGroup} loading={!hasLoadedOnce && isFetching} />
                )}
              </div>

              <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                <LiveTicker orders={recentOrders} loading={!hasLoadedOnce} error={fetchError} />
                {selectedGroup && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <h3 className="font-bold text-slate-700 mb-4 flex items-center">
                      <ShoppingBag className="mr-2 text-rose-500" size={18} /> 其他發現中的好物
                    </h3>
                    <div className="space-y-3">
                      {groups.filter(g => g.status === 'open' && g.id !== selectedGroup.id).map(group => (
                        <div key={group.id} onClick={() => setSelectedGroup(group)} className="flex items-center p-2 rounded-lg cursor-pointer border border-transparent hover:bg-slate-50 hover:border-slate-200 transition-all group">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 mr-3"><img src={group.image} className="w-full h-full object-cover" /></div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate group-hover:text-indigo-600 transition-colors">{group.title}</h4>
                            <div className="text-xs text-slate-400 mt-0.5"><Clock size={10} className="inline mr-1" />{group.endDate || '好評熱銷'}</div>
                          </div>
                          <ArrowRight size={16} className="text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                  <h3 className="font-black text-lg mb-2">📢 局內通知</h3>
                  <ul className="space-y-3 text-sm text-slate-400">
                    <li className="flex items-start"><span className="mr-2 text-indigo-400">•</span>到貨後將透過 Gmail 通知，請留意信箱。</li>
                    <li className="flex items-start"><span className="mr-2 text-indigo-400">•</span>如有商品問題請私訊局長。</li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        )}
      </div>

      <footer className="bg-white border-t border-rose-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-medium">© 2024 神秘好物發現局. 讓跟團成為一種快樂。</p>
          
          {!isAdmin && (
            <button 
              onClick={() => {
                setIsAdmin(true);
                // 同步更新網址，讓重新整理後依然保持管理模式
                const url = new URL(window.location.href);
                url.searchParams.set('mode', 'admin');
                window.history.replaceState({}, '', url.toString());
              }}
              className="mt-4 text-[10px] text-slate-200 hover:text-indigo-400 transition-colors flex items-center justify-center mx-auto"
            >
              <ShieldCheck size={10} className="mr-1" /> 局長登入 (管理後台)
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;