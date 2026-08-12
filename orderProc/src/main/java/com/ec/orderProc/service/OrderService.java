package com.ec.orderProc.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.ec.orderProc.exception.OrderNotFoundException;
import com.ec.orderProc.model.Order;
import com.ec.orderProc.model.OrderStatus;
import com.ec.orderProc.model.Warehouse;
import com.ec.orderProc.payload.CreateOrderRequest;
import com.ec.orderProc.payload.OrderCreatedEvent;
import com.ec.orderProc.payload.OrderResponse;
import com.ec.orderProc.repo.OrderRepository;

@Service
public class OrderService {

    private static final String TOPIC = "order.created";
    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    private final GeocodingService geocodingService;
    private final WarehouseService warehouseService;

    public OrderService(OrderRepository orderRepository, KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate,
            GeocodingService geocodingService, WarehouseService warehouseService) {
        this.orderRepository = orderRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.geocodingService = geocodingService;
        this.warehouseService = warehouseService;
    }

    public OrderResponse createOrder(CreateOrderRequest request, UUID userId) {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .customerEmail(request.customerEmail())
                .totalAmount(request.totalAmount())
                .status(OrderStatus.CREATED)
                .deliveryAddress(request.deliveryAddress())
                .createdAt(Instant.now())
                .build();

        Order saved = orderRepository.save(order);

        OrderCreatedEvent event = new OrderCreatedEvent(
                saved.getId(), saved.getCustomerEmail(), saved.getTotalAmount(), saved.getCreatedAt());
        kafkaTemplate.send(TOPIC, saved.getId().toString(), event);

        resolveOrderLocation(saved.getId(), request.deliveryAddress()); // fire-and-forget

        return OrderResponse.from(saved);
    }

    @Async
    public void resolveOrderLocation(UUID orderId, String deliveryAddress) {
        try {
            GeocodingService.Coordinates delivery = geocodingService.geocode(deliveryAddress);
            Warehouse warehouse = warehouseService.findNearest(delivery.lat(), delivery.lng());

            Order order = orderRepository.findById(orderId).orElseThrow();
            order.setDeliveryLat(delivery.lat());
            order.setDeliveryLng(delivery.lng());
            order.setPickupLat(warehouse.getLat());
            order.setPickupLng(warehouse.getLng());
            order.setPickupCity(warehouse.getCity());
            orderRepository.save(order);
        } catch (Exception e) {
            System.out
                    .println("[OrderService] Failed to resolve location for order " + orderId + ": " + e.getMessage());
        }
    }

    public OrderResponse getOrder(UUID id, UUID requestingUserId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));

        if (!order.getUserId().equals(requestingUserId)) {
            throw new OrderNotFoundException(id);
        }
        return OrderResponse.from(order);
    }

    public List<OrderResponse> getOrdersForUser(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(OrderResponse::from)
                .toList();
    }

}
