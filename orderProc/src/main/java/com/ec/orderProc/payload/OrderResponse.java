package com.ec.orderProc.payload;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.ec.orderProc.model.Order;
import com.ec.orderProc.enums.OrderStatus;

public record OrderResponse(
        UUID id, String customerEmail, BigDecimal totalAmount, OrderStatus status, Instant createdAt,
        String deliveryAddress, Double deliveryLat, Double deliveryLng,
        Double pickupLat, Double pickupLng, String pickupCity,
        List<OrderItemResponse> items) {
    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(i.getProduct().getId(), i.getProductName(), i.getPriceAtPurchase(),
                        i.getQuantity()))
                .toList();

        return new OrderResponse(
                order.getId(), order.getCustomerEmail(), order.getTotalAmount(), order.getStatus(),
                order.getCreatedAt(),
                order.getDeliveryAddress(), order.getDeliveryLat(), order.getDeliveryLng(),
                order.getPickupLat(), order.getPickupLng(), order.getPickupCity(),
                items);
    }
}