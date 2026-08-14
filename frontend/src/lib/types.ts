export type OrderStatus = "CREATED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: string;
  customerEmail: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  pickupLat: number | null;
  pickupLng: number | null;
  pickupCity: string | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface CartItemType {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Cart {
  id: string;
  items: CartItemType[];
  total: number;
}