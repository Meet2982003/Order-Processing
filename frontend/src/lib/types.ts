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