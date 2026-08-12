package com.ec.orderProc.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
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

        GeocodingService.Coordinates delivery = geocodingService.geocode(request.deliveryAddress());
        Warehouse warehouse = warehouseService.findNearest(delivery.lat(), delivery.lng());
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .customerEmail(request.customerEmail())
                .totalAmount(request.totalAmount())
                .status(OrderStatus.CREATED)
                .deliveryAddress(request.deliveryAddress())
                .deliveryLat(delivery.lat())
                .deliveryLng(delivery.lng())
                .pickupCity(warehouse.getCity())
                .pickupLat(warehouse.getLat())
                .pickupLng(warehouse.getLng())
                .createdAt(Instant.now())
                .build();

        Order saved = orderRepository.save(order);

        OrderCreatedEvent event = new OrderCreatedEvent(
                saved.getId(), saved.getCustomerEmail(), saved.getTotalAmount(), saved.getCreatedAt());
        kafkaTemplate.send(TOPIC, saved.getId().toString(), event);

        return OrderResponse.from(saved);
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
