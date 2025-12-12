
export interface ProductOption {
  id: string;
  name: string;
  category: string;
  priceEstimate: string;
  image: string;
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  priceEstimate: string; // Keep as string for display, parse for calculation if needed
}

export interface OrderFormState {
  name: string;
  email: string;
  address: string;
  // product and quantity in state are now derived from cart for submission compatibility
  notes: string;
}

export interface SubmissionStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export interface ChartData {
  name: string;
  value: number;
}

// The UI view model for the ticker
export interface RecentOrder {
  id: string;
  buyer: string;
  product: string;
  quantity: number;
  time: string;
  avatarColor: string;
}

// The raw data structure coming from Google Sheets (7 Columns)
export interface SheetRow {
  timestamp: string; // Column 1
  name: string;      // Column 2
  email: string;     // Column 3
  address: string;   // Column 4
  product: string;   // Column 5
  quantity: string | number; // Column 6
  notes: string;     // Column 7
  [key: string]: any; // Allow loose matching if extra columns exist
}
