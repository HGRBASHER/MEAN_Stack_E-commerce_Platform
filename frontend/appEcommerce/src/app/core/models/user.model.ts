export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt?: string;
  updatedAt?: string;

  // Calculated fields
  orderCount?: number;
  totalSpent?: number;
  testimonialsCount?: number;
}

export interface IUsersResponse {
  status: string;
  message?: string;
  results?: number;
  data: IUser[];
}

export interface IUserOrdersResponse {
  status: string;
  results: number;
  data: IOrder[];
}

export interface IOrder {
  _id: string;
  user: string;
  items: IOrderItem[];
  address: string;
  phone: string;
  totalPrice: number;
  paymentMethod: 'cash' | 'card';
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  deleted?: boolean;
  deletedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  price: number;
}

export interface IUserTestimonialsResponse {
  status: string;
  results: number;
  data: ITestimonial[];
}

export interface ITestimonial {
  _id: string;
  user: IUser | string;
  order: IOrder | string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITestimonialsResponse {
  status: string;
  results: number;
  data: ITestimonial[];
}

export interface IUpdateOrderStatusRequest {
  status: string;
}

export interface IApproveTestimonialRequest {
  adminNotes?: string;
}
