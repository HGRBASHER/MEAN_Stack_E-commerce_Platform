export interface IUser {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  totalAmount?: number;
  status?: string;
}

export interface ITestimonial {
  _id?: string;
  user: IUser | string;
  order: IOrder | string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isApproved: boolean;
  adminNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Helper functions for handling user/order objects
export function getUserName(user: IUser | string): string {
  if (!user) return '';
  if (typeof user === 'string') return user;
  return user.name || '';
}

export function getOrderNumber(order: IOrder | string): string {
  if (!order) return '';
  if (typeof order === 'string') return order;
  return order.orderNumber || '';
}

// Response interfaces
export interface ITestimonialResponse {
  status: string;
  data: ITestimonial;
  message?: string;
}

export interface ITestimonialsResponse {
  status: string;
  results?: number;
  data: ITestimonial[];
}

// Request interfaces
export interface ICreateTestimonialRequest {
  orderId: string;
  rating: number;
  comment: string;
}

export interface IUpdateTestimonialRequest {
  rating?: number;
  comment?: string;
}

export interface IAdminActionRequest {
  adminNotes?: string;
}

// Filter interfaces
export interface ITestimonialFilters {
  status?: 'pending' | 'approved' | 'rejected';
  minRating?: number;
  maxRating?: number;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}

export interface ITestimonialStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  averageRating: number;
}
