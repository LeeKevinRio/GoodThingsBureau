import React, { useState } from 'react';
import { Sparkles, Loader2, PlusCircle, Search } from 'lucide-react';
import { getProductRecommendations } from '../services/geminiService';

interface AIAssistantProps {
  onSelectProduct: (productName: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onSelectProduct }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const results = await getProductRecommendations(query);
      if (results.length === 0) {
        setError("找不到相關的具體建議，請嘗試更換關鍵字。");
      } else {
        setRecommendations(results);
      }
    } catch (err) {
      setError("AI 服務目前無法使用。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-secondary-500 rounded-lg text-white">
          <Sparkles size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">AI 智慧選品</h2>
      </div>
      
      <p className="text-sm text-slate-500 mb-6">
        不確定該買什麼嗎？描述您的需求（例如：「2024 日本必買零食」或「適合男生的生日禮物」）。
      </p>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="描述您想找的商品..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3">
        {recommendations.length > 0 && (
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            AI 推薦清單
          </div>
        )}
        
        {recommendations.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectProduct(item)}
            className="w-full text-left p-3 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl transition-all group flex items-center justify-between shadow-sm"
          >
            <span className="text-slate-700 font-medium">{item}</span>
            <PlusCircle size={18} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}

        {!isLoading && recommendations.length === 0 && !error && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
            <Sparkles size={48} className="mb-3 opacity-20" />
            <p className="text-sm">輸入主題開始搜尋</p>
          </div>
        )}
      </div>
    </div>
  );
};