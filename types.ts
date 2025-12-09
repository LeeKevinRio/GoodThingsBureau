export interface ProductOption {
  id: string;
  name: string;
  category: string;
  priceEstimate?: string;
}

export interface OrderFormState {
  name: string;
  email: string;
  address: string;
  product: string;
  quantity: number;
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