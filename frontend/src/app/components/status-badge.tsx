import { OrderStatus } from "@/lib/types";

const statusStyles: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-ink/10 text-ink/70",
  PAID: "bg-cobalt/10 text-cobalt",
  PAYMENT_FAILED: "bg-alert/10 text-alert",
  SHIPPED: "bg-amber/10 text-amber",
  DELIVERED: "bg-shipped/10 text-shipped",
  CANCELLED: "bg-alert/10 text-alert",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex item-center px-2.5 py-1 rounded-full text-xs font-medium font-mono ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
