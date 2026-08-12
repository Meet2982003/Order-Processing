export type OrderStatus = "CREATED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order{
    id: string;
    customerEmail: string;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
}