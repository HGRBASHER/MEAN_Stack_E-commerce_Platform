export interface ICartItem {
  productId: string;
  quantity: number;
}

export interface ICartResponse {
  status: string;
  message: string;
  data: {
    productId: string;
    quantity: number;
    cartId: string;
    totalItems: number;
  };
}
