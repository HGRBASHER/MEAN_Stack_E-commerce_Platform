export interface StockIssue {
  productId: string;
  productName: string;
  available: number;
  requested: number;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentMethod: 'cash';
  notes?: string;
}

export interface OrderSubmitData {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  address: string;
  phone: string;
  paymentMethod: 'cash' | 'card';
}
