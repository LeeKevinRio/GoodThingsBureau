import { ProductOption, ChartData, RecentOrder } from './types';

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
  { 
    id: 'p3', 
    name: '屏東枋山愛文芒果 (5斤/箱)', 
    category: '在地小農', 
    priceEstimate: '$650',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'p4', 
    name: '超濃縮洗衣球 (50顆/盒)', 
    category: '生活用品', 
    priceEstimate: '$199',
    image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0b6b?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'p5', 
    name: '基隆老店手工天婦羅', 
    category: '冷凍美食', 
    priceEstimate: '$150',
    image: 'https://images.unsplash.com/photo-1585501399727-466d79a2955f?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'p6', 
    name: '日本青森蘋果汁 (1000ml)', 
    category: '進口飲品', 
    priceEstimate: '$180',
    image: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'p7', 
    name: '法式舒肥雞胸肉組合包', 
    category: '健康飲食', 
    priceEstimate: '$890',
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: 'p8', 
    name: '辦公室療癒多肉植物', 
    category: '居家生活', 
    priceEstimate: '$150',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80'
  },
];

export const MOCK_TRENDS: ChartData[] = [
  { name: '冷凍美食', value: 40 },
  { name: '異國零食', value: 25 },
  { name: '生活用品', value: 20 },
  { name: '在地小農', value: 10 },
  { name: '其他', value: 5 },
];

export const MOCK_RECENT_ORDERS: RecentOrder[] = [
  { id: 'r1', buyer: '陳*華', product: '宜蘭爆漿蔥油餅', quantity: 3, time: '2分鐘前', avatarColor: 'bg-blue-500' },
  { id: 'r2', buyer: 'Amy L.', product: '韓國厚切海苔', quantity: 5, time: '5分鐘前', avatarColor: 'bg-pink-500' },
  { id: 'r3', buyer: '王*明', product: '屏東枋山愛文芒果', quantity: 1, time: '8分鐘前', avatarColor: 'bg-green-500' },
  { id: 'r4', buyer: 'Jessica', product: '超濃縮洗衣球', quantity: 2, time: '12分鐘前', avatarColor: 'bg-purple-500' },
  { id: 'r5', buyer: '林*豪', product: '法式舒肥雞胸肉組合包', quantity: 1, time: '15分鐘前', avatarColor: 'bg-yellow-500' },
  { id: 'r6', buyer: 'Kevi*', product: '宜蘭爆漿蔥油餅', quantity: 10, time: '20分鐘前', avatarColor: 'bg-indigo-500' },
  { id: 'r7', buyer: '張*美', product: '日本青森蘋果汁', quantity: 2, time: '22分鐘前', avatarColor: 'bg-red-500' },
];

// CONFIGURATION FOR GOOGLE SHEETS INTEGRATION
export const GOOGLE_SHEET_CONFIG = {
  // IMPORTANT: Deploy the Apps Script provided in the instructions and paste the Web App URL here.
  // Example format: 'https://script.google.com/macros/s/AKfycbx.../exec'
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxh5v0iCjz9mO5LMtrQjWxREtnEZSJdiTsDt9iI9cnL_x87QZpJZaJ4BA75wczZu91T/exec',
  
  // Your provided Sheet ID (for reference)
  SHEET_ID: '1hAsI2Vd8dY7ACKdBycXw0xu7FcmV9TgMV8KQEbkfDy0'
};