import React, { useState } from 'react';
import { GroupSession, RecentOrder, ProductOption } from '../types';
import { ArrowLeft, Calendar, Package, MapPin, MessageSquare, Mail, User, Download, Search, ShoppingCart, ListChecks, CheckCircle2 } from 'lucide-react';

interface OrderDetailsViewProps {
  groups: GroupSession[];
  orders: RecentOrder[];
  products: ProductOption[];
}

/**
 * 訂單詳細資訊檢視元件 (管理員專用)
 */
export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({ groups, orders, products }) => {
  const [selectedGroup, setSelectedGroup] = useState<GroupSession | null>(null);
  const [viewMode, setViewMode] = useState<'orders' | 'summary'>('orders');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 取得目前選定團購的相關訂單 (精確比對)
  const getGroupOrders = (group: GroupSession) => {
    // 優先使用 groupId 關聯
    const strictOrders = orders.filter(order => order.groupId === group.id);
    if (strictOrders.length > 0) return strictOrders;

    // 備援方案：根據該團購下的商品名稱進行內容搜尋 (針對舊格式資料)
    const groupProductNames = products
      .filter(p => p.groupId === group.id)
      .map(p => p.name);
    
    return orders.filter(order => 
      groupProductNames.some(pName => order.product.includes(pName))
    );
  };

  const currentOrders = selectedGroup ? getGroupOrders(selectedGroup) : [];
  
  // 2. 核心彙總邏輯 (專門針對所選團購)
  const getPurchasingSummary = () => {
    if (!selectedGroup) return [];

    const summaryMap = new Map<string, { name: string, category: string, image: string, price: string, total: number }>();

    // 先帶入該團購定義的所有商品
    const groupProducts = products.filter(p => p.groupId === selectedGroup.id);
    groupProducts.forEach(p => {
      summaryMap.set(p.name, {
        name: p.name,
        category: p.category,
        image: p.image,
        price: p.priceEstimate,
        total: 0
      });
    });

    // 解析選定訂單中的內容
    currentOrders.forEach(order => {
      const parts = order.product.split(',').map(s => s.trim());
      parts.forEach(part => {
        const lastXIndex = part.lastIndexOf(' x');
        if (lastXIndex !== -1) {
          const name = part.substring(0, lastXIndex).trim();
          const qty = parseInt(part.substring(lastXIndex + 2)) || 0;

          if (summaryMap.has(name)) {
            const item = summaryMap.get(name)!;
            item.total += qty;
          } else if (name) {
            // 不在清單內但出現在訂單中的商品 (如手動輸入)
            summaryMap.set(name, {
              name: name,
              category: '額外項目',
              image: 'https://placehold.co/100x100?text=?',
              price: '-',
              total: qty
            });
          }
        }
      });
    });

    return Array.from(summaryMap.values()).filter(item => item.total > 0);
  };

  const purchasingSummary = selectedGroup ? getPurchasingSummary() : [];

  const filteredOrders = currentOrders.filter(order => 
    (order.realName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = () => {
    if (!selectedGroup) return;
    let headers = [];
    let csvRows = [];
    if (viewMode === 'orders') {
      headers = ['時間', '姓名', 'Email', '地址', '商品內容', '總數量', '備註'];
      csvRows = filteredOrders.map(o => [`"${o.time}"`, `"${o.realName || o.buyer}"`, `"${o.email || ''}"`, `"${o.address || ''}"`, `"${o.product}"`, `"${o.quantity}"`, `"${o.notes || ''}"`].join(','));
    } else {
      headers = ['分類', '商品名稱', '單價', '採購總量'];
      csvRows = purchasingSummary.map(p => [`"${p.category}"`, `"${p.name}"`, `"${p.price}"`, `"${p.total}"`].join(','));
    }
    const csvContent = ['\ufeff' + headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedGroup.title}_${viewMode === 'orders' ? '名單' : '採購'}.csv`;
    link.click();
  };

  if (!selectedGroup) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-3xl font-black text-slate-900 mb-2">好物數據整理</h2>
        <p className="text-slate-500 mb-8">請選擇一個團購場次來查看採購明細</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} onClick={() => setSelectedGroup(group)} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all hover:border-indigo-400 group">
              <div className="h-40 overflow-hidden relative">
                <img src={group.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                <div className="absolute top-3 right-3">
                   <span className={`px-2 py-1 rounded text-[10px] font-black text-white ${group.status === 'open' ? 'bg-green-500' : 'bg-slate-500'}`}>{group.status === 'open' ? '進行中' : '已結束'}</span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-black text-slate-800 text-lg mb-1">{group.title}</h3>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center font-bold text-indigo-600">
                  <div className="flex items-center"><Package size={16} className="mr-2" /> {getGroupOrders(group).length} 筆訂單</div>
                  <ArrowLeft size={18} className="rotate-180 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 pt-4 shadow-sm">
        <div className="max-w-7xl auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center">
              <button onClick={() => { setSelectedGroup(null); setViewMode('orders'); }} className="mr-4 p-2 hover:bg-slate-100 rounded-full text-slate-500"><ArrowLeft size={20} /></button>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedGroup.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">專屬採購清單彙總</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {viewMode === 'orders' && (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="搜尋姓名..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none w-64 focus:ring-2 focus:ring-indigo-500" />
                </div>
              )}
              <button onClick={downloadCSV} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center shadow-lg transition-all"><Download size={16} className="mr-2" /> 匯出 CSV</button>
            </div>
          </div>
          <div className="flex space-x-8">
            <button onClick={() => setViewMode('summary')} className={`pb-3 text-sm font-black border-b-4 transition-all flex items-center ${viewMode === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><ShoppingCart size={18} className="mr-2" /> 採購總表 (一鍵點貨)</button>
            <button onClick={() => setViewMode('orders')} className={`pb-3 text-sm font-black border-b-4 transition-all flex items-center ${viewMode === 'orders' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}><User size={18} className="mr-2" /> 訂單名單 (人員明細)</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'summary' ? (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black mb-2 flex items-center"><ListChecks className="mr-3 text-indigo-400" /> 採購數量彙總</h3>
                <p className="text-slate-400 text-sm">此數據已將「{selectedGroup.title}」場次的所有訂單加總。</p>
              </div>
              <div className="bg-indigo-600 p-4 rounded-2xl text-center min-w-[120px]">
                <p className="text-xs font-bold uppercase opacity-80 mb-1">採購種類</p>
                <p className="text-4xl font-black">{purchasingSummary.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasingSummary.map((p, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:border-indigo-500 transition-colors">
                   <div className="h-44 relative">
                      <img src={p.image} className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Item'} />
                      <div className="absolute bottom-3 left-3"><span className="bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded shadow-sm">{p.category}</span></div>
                   </div>
                   <div className="p-6 flex-1 flex flex-col">
                      <h4 className="font-black text-slate-800 text-lg mb-4">{p.name}</h4>
                      <div className="mt-auto flex justify-between items-end pt-4 border-t border-slate-50">
                         <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">預估價格</p>
                            <p className="font-bold text-slate-600">{p.price}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">採購總數</p>
                            <div className="flex items-center justify-end"><span className="text-5xl font-black text-indigo-600 mr-1">{p.total}</span><span className="text-sm font-black text-slate-400">份</span></div>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
              {purchasingSummary.length === 0 && (
                <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
                  <ShoppingCart size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">目前無任何採購數據紀錄</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black">
                  <tr>
                    <th className="px-6 py-4 uppercase">訂購人</th>
                    <th className="px-6 py-4 uppercase">商品內容</th>
                    <th className="px-6 py-4 uppercase">聯繫管道</th>
                    <th className="px-6 py-4 uppercase">局員備註</th>
                    <th className="px-6 py-4 text-right uppercase">登記時間</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">目前還沒有訂單資料喔！</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center">
                             <div className={`w-10 h-10 rounded-xl ${order.avatarColor} text-white flex items-center justify-center text-sm font-black mr-3 shadow-md`}>{(order.realName || order.buyer).charAt(0)}</div>
                             <div>
                               <div className="font-black text-slate-800 text-base">{order.realName || order.buyer}</div>
                               <div className="text-xs text-indigo-600 font-bold">選購 {order.quantity} 件</div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top font-bold text-slate-700 whitespace-pre-wrap">{order.product}</td>
                        <td className="px-6 py-5 align-top space-y-1.5">
                           {order.email && <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center"><Mail size={12} className="mr-2" /> {order.email}</div>}
                           {order.address && <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center"><MapPin size={12} className="mr-2" /> {order.address}</div>}
                        </td>
                        <td className="px-6 py-5 align-top max-w-xs">
                          {order.notes ? <div className="text-xs bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-100 font-bold">{order.notes}</div> : <span className="text-slate-200">-</span>}
                        </td>
                        <td className="px-6 py-5 align-top text-right text-xs font-bold text-slate-400">{order.time}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};