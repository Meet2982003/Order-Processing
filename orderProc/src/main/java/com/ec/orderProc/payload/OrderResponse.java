package com.ec.orderProc.payload;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import com.ec.orderProc.model.Order;
import com.ec.orderProc.model.OrderStatus;

public record OrderResponse(
        UUID id,
        String customerEmail,
        BigDecimal totalAmount,
        OrderStatus status,
        Instant createdAt,
        String deliveryAddress,
        Double deliveryLat,
        Double deliveryLng,
        Double pickupLat,
        Double pickupLng,
        String pickupCity) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCustomerEmail(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getDeliveryAddress(),
                order.getDeliveryLat(),
                order.getDeliveryLng(),
                order.getPickupLat(),
                order.getPickupLng(),
                order.getPickupCity());
    }

}
