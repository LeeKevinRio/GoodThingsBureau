import { ProductOption, ChartData, RecentOrder } from './types';

/**
 * 預設商品列表 (當 API 尚未載入或失敗時使用)
 * Initial data for products before fetching from Google Sheets.
 */
export const PREDEFINED_PRODUCTS: ProductOption[] = [
  { 
    id: 'p1', 
    name: '宜蘭爆漿蔥油餅 (10片/包)', 
    category: '冷凍美食', 
    priceEstimate: '$120',
    image: 'https://images.unsplash.com/photo-1626809713600-c97b29330a10?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'p2', 
    name: '韓國厚切海苔 (原味/辣味)', 
    category: '異國零食', 
    priceEstimate: '$89',
    image: 'https://images.unsplash.com/photo-1606923829579-0cb9d4acd246?auto=format&fit=crop&w=800&q=80'
  },
  // ... (省略其他預設商品以保持簡潔)
  { 
    id: 'p8', 
    name: '辦公室療癒多肉植物', 
    category: '居家生活', 
    priceEstimate: '$150',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80'
  },
];

/**
 * 模擬圖表數據 (用於開發階段或無數據時)
 */
export const MOCK_TRENDS: ChartData[] = [
  { name: '冷凍美食', value: 40 },
  { name: '異國零食', value: 25 },
  { name: '生活用品', value: 20 },
  { name: '在地小農', value: 10 },
  { name: '其他', value: 5 },
];

/**
 * 模擬近期訂單 (用於開發階段或無數據時)
 */
export const MOCK_RECENT_ORDERS: RecentOrder[] = [
  { id: 'r1', buyer: '陳*華', product: '宜蘭爆漿蔥油餅', quantity: 3, time: '2分鐘前', avatarColor: 'bg-blue-500' },
  { id: 'r2', buyer: 'Amy L.', product: '韓國厚切海苔', quantity: 5, time: '5分鐘前', avatarColor: 'bg-pink-500' },
  // ...
];

/**
 * Google Sheet API 設定
 * Configuration for the connection to the Google Apps Script Web App.
 */
export const GOOGLE_SHEET_CONFIG = {
  // IMPORTANT: Deploy the Apps Script provided in the instructions and paste the Web App URL here.
  // 這是 Google Apps Script 部署後的 Web App URL，負責處理 GET/POST 請求
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxh5v0iCjz9mO5LMtrQjWxREtnEZSJdiTsDt9iI9cnL_x87QZpJZaJ4BA75wczZu91T/exec',
  
  // 僅供參考的 Sheet ID (實際操作由 Apps Script 內部綁定)
  SHEET_ID: '1hAsI2Vd8dY7ACKdBycXw0xu7FcmV9TgMV8KQEbkfDy0'
};