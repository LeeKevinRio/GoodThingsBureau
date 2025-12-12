
export interface ProductOption {
  id: string;
  name: string;
  category: string;
  priceEstimate: string;
  image: string;
  description?: string;
  groupId?: string; // New: Link this product to a specific Group ID (e.g., 'g1')
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  priceEstimate: string;
}

export interface OrderFormState {
  name: string;
  email: string;
  address: string;
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

export interface RecentOrder {
  id: string;
  buyer: string;
  product: string;
  quantity: number;
  time: string;
  avatarColor: string;
}

// Ensure this matches the columns in your new 'Groups' sheet
export interface GroupSession {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'coming_soon';
  image: string;
  endDate?: string;
  participantCount?: number;
}

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
