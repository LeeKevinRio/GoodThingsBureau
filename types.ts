/**
 * 商品選項介面
 * Represents a product available for purchase in a group buy.
 */
export interface ProductOption {
  id: string;             // 商品唯一識別碼
  name: string;           // 商品名稱
  category: string;       // 商品分類 (如: 冷凍美食, 生活用品)
  priceEstimate: string;  // 預估價格字串 (如: "$120")
  image: string;          // 商品圖片網址
  description?: string;   // 商品描述 (可選)
  groupId?: string;       // 關聯的團購活動 ID (用來區分商品屬於哪個團購)
}

/**
 * 購物車項目
 * Represents an item currently inside the user's shopping cart.
 */
export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  priceEstimate: string;
}

/**
 * 訂購表單狀態
 * State for the user input form.
 */
export interface OrderFormState {
  name: string;    // 購買人姓名
  email: string;   // 聯絡 Email
  address: string; // 取貨地址
  notes: string;   // 備註 (口味、款式等)
}

/**
 * 表單提交狀態
 * Used to track the UI state during API submission.
 */
export interface SubmissionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

/**
 * 圖表數據格式
 * Used for Recharts visualization.
 */
export interface ChartData {
  name: string;
  value: number;
}

/**
 * 近期訂單 (用於跑馬燈與後台列表)
 * Represents a completed order fetched from Google Sheets.
 */
export interface RecentOrder {
  id: string;
  buyer: string;       // 顯示名稱 (前台顯示時會隱碼，如: 王*明)
  realName?: string;   // 真實姓名 (後台管理員可見)
  email?: string;      // 聯絡 Email (後台可見)
  address?: string;    // 地址 (後台可見)
  notes?: string;      // 備註 (後台可見)
  product: string;     // 購買商品摘要字串
  quantity: number;    // 總數量
  time: string;        // 相對時間字串 (如: "5分鐘前")
  rawTimestamp?: string; // 原始 ISO 時間格式 (用於排序或匯出)
  avatarColor: string; // 頭像背景色 Class
  groupId?: string;    // 關聯的團購 ID (New)
  groupTitle?: string; // 關聯的團購標題 (New)
}

/**
 * 團購活動場次
 * Represents a specific group buy session.
 * Matches the columns in the 'Groups' sheet.
 */
export interface GroupSession {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'coming_soon'; // 活動狀態
  image: string;          // 封面圖片
  endDate?: string;       // 截止日期 (YYYY/MM/DD)
  participantCount?: number; // 參與人數統計
}

/**
 * Google Sheet 原始資料列
 * Loose typing for raw data coming from the Apps Script API.
 */
export interface SheetRow {
  timestamp: string;
  name: string;
  email: string;
  address: string;
  product: string;
  quantity: string | number;
  notes: string;
  [key: string]: any;
}