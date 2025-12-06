export interface IOrder {
  _id: string;
  user: string;
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    price: number;
    quantity: number;
  }[];
  address: string;
  phone: string;
  totalPrice: number;
  paymentMethod: 'cash' ;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  deleted?: boolean;
  deletedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockIssue {
  productId: string;
  productName: string;
  available: number;
  requested: number;
}
