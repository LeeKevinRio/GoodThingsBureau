import { ProductOption, ChartData } from './types';

export const PREDEFINED_PRODUCTS: ProductOption[] = [
  { id: 'p1', name: '日本專櫃化妝品組', category: '美妝保養', priceEstimate: '$1,500-2,500' },
  { id: 'p2', name: '限量款球鞋', category: '時尚潮流', priceEstimate: '$6,000+' },
  { id: 'p3', name: '韓國人氣零食箱', category: '異國美食', priceEstimate: '$900-1,500' },
  { id: 'p4', name: '遊戲主機 (PS5/Xbox)', category: '3C 電子', priceEstimate: '$15,000' },
  { id: 'p5', name: '精品手提包', category: '時尚潮流', priceEstimate: '$30,000+' },
  { id: 'p6', name: '綜合維他命', category: '健康保健', priceEstimate: '$600-1,200' },
  { id: 'p7', name: '機械式鍵盤', category: '3C 電子', priceEstimate: '$3,000-6,000' },
];

export const MOCK_TRENDS: ChartData[] = [
  { name: '美妝保養', value: 35 },
  { name: '3C 電子', value: 25 },
  { name: '時尚潮流', value: 20 },
  { name: '異國美食', value: 15 },
  { name: '其他', value: 5 },
];

// CONFIGURATION FOR GOOGLE SHEETS INTEGRATION
export const GOOGLE_SHEET_CONFIG = {
  // IMPORTANT: Deploy the Apps Script provided in the instructions and paste the Web App URL here.
  // Example format: 'https://script.google.com/macros/s/AKfycbx.../exec'
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwMpLYt2mer3751rofV_rIIPVPvkXkRRTz7Sqwbdl8Djnbxwmkkl_Kz9vOgdkCd2sI0/exec',
  
  // Your provided Sheet ID (for reference)
  SHEET_ID: '1hAsI2Vd8dY7ACKdBycXw0xu7FcmV9TgMV8KQEbkfDy0'
};