import React, { useState } from 'react';
import { Plane, Package, ExternalLink } from 'lucide-react';
import { OrderForm } from './components/OrderForm';
import { AIAssistant } from './components/AIAssistant';
import { StatsChart } from './components/StatsChart';

const App: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  const handleProductSelect = (productName: string) => {
    setSelectedProduct(productName);
  };

  const handleClearProduct = () => {
    setSelectedProduct('');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Plane className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">GlobalBuy 全球代購</h1>
                <p className="text-xs text-slate-500 font-medium">專業代購服務平台</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-sm font-medium text-slate-900 hover:text-primary-600">首頁</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary-600">流程說明</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary-600">收費標準</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary-600">聯絡我們</a>
            </nav>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
              訂單查詢 <ExternalLink size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            全球好物，為您 <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">代購到府</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            只需填寫表單，我們將為您處理購買、運送及報關事宜。不知道買什麼？詢問我們的 AI 助手。
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <OrderForm 
              initialProduct={selectedProduct} 
              onClearInitialProduct={handleClearProduct} 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Info Cards */}
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">安全包裝</h4>
                    <p className="text-sm text-slate-500 mt-1">我們提供重新包裝服務，確保商品安全並節省運費。</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start space-x-4">
                  <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                    <Plane size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">快速運送</h4>
                    <p className="text-sm text-slate-500 mt-1">提供 EMS、DHL 等多種國際快遞選項，即時追蹤包裹。</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: AI & Stats (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI Assistant - Sticky on desktop */}
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="h-[500px]">
                 <AIAssistant onSelectProduct={handleProductSelect} />
              </div>
              <StatsChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;