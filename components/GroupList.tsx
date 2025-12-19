import React from 'react';
import { GroupSession } from '../types';
import { Users, Clock, ArrowRight, Lock, AlertCircle } from 'lucide-react';

interface GroupListProps {
  groups: GroupSession[];
  onSelectGroup: (group: GroupSession) => void;
  loading: boolean;
}

/**
 * 團購大廳列表 (Lobby)
 * Displays all available group buy sessions (Open, Coming Soon, Closed).
 */
export const GroupList: React.FC<GroupListProps> = ({ groups, onSelectGroup, loading }) => {
  
  // Loading State
  if (loading && groups.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-rose-100 shadow-sm">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500">正在讀取開團列表...</p>
      </div>
    );
  }

  // Empty State
  if (!loading && groups.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">目前沒有開團活動</h3>
        <p className="text-slate-500">請稍後再回來查看最新團購。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">選擇團購活動</h2>
        <p className="text-slate-500">點擊下方「立即跟團」開始選購商品</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div 
            key={group.id}
            className={`
              relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col
              ${group.status === 'open' ? 'border-rose-200 shadow-lg hover:shadow-xl hover:-translate-y-1' : 'border-slate-200 opacity-80'}
            `}
          >
            {/* Image Banner */}
            <div className="h-48 overflow-hidden relative shrink-0">
              <img 
                src={group.image} 
                alt={group.title} 
                className={`w-full h-full object-cover transition-transform duration-700 ${group.status === 'open' ? 'hover:scale-105' : 'grayscale'}`}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/800x400?text=Group+Image'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Status Badge (根據狀態顯示不同標籤) */}
              <div className="absolute top-4 right-4">
                {group.status === 'open' && (
                  <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center animate-pulse">
                    <Clock size={12} className="mr-1" /> 進行中
                  </span>
                )}
                {group.status === 'coming_soon' && (
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    即將開始
                  </span>
                )}
                {group.status === 'closed' && (
                  <span className="bg-slate-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    已結束
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{group.title}</h3>
              <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{group.description}</p>
              
              {/* Meta Data */}
              <div className="mt-auto">
                <div className="flex items-center justify-between text-sm text-slate-400 mb-6">
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    <span>{group.participantCount ? `${group.participantCount} 人參與` : '熱銷中'}</span>
                  </div>
                  {group.endDate && (
                    <span>{group.endDate}</span>
                  )}
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => group.status === 'open' && onSelectGroup(group)}
                  disabled={group.status !== 'open'}
                  className={`
                    w-full py-3 rounded-xl font-bold flex items-center justify-center transition-colors
                    ${group.status === 'open' 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-200' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                  `}
                >
                  {group.status === 'open' ? (
                    <>立即跟團 <ArrowRight size={18} className="ml-2" /></>
                  ) : group.status === 'coming_soon' ? (
                    <><Lock size={18} className="mr-2" /> 尚未開放</>
                  ) : (
                    '已截止'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};