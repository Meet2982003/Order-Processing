package com.ec.orderProc.service;

import com.ec.orderProc.repo.CartRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.ec.orderProc.enums.OrderStatus;
import com.ec.orderProc.exception.EmptyCartException;
import com.ec.orderProc.exception.InsufficientStockException;
import com.ec.orderProc.exception.OrderNotFoundException;
import com.ec.orderProc.model.CartItem;
import com.ec.orderProc.model.Carts;
import com.ec.orderProc.model.Order;
import com.ec.orderProc.model.OrderItem;
import com.ec.orderProc.model.Products;
import com.ec.orderProc.model.User;
import com.ec.orderProc.model.Warehouse;
import com.ec.orderProc.payload.CreateOrderRequest;
import com.ec.orderProc.payload.OrderCreatedEvent;
import com.ec.orderProc.payload.OrderResponse;
import com.ec.orderProc.repo.OrderRepository;
import com.ec.orderProc.repo.UserRepository;

@Service
public class OrderService {

    private final CartRepository cartRepository;
    private static final String TOPIC = "order.created";
    private final OrderRepository orderRepository;
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;
    private final GeocodingService geocodingService;
    private final WarehouseService warehouseService;
    private final UserRepository userRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository, KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate,
            GeocodingService geocodingService, WarehouseService warehouseService, CartService cartService,
            CartRepository cartRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.geocodingService = geocodingService;
        this.warehouseService = warehouseService;
        this.cartService = cartService;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    public OrderResponse createOrder(CreateOrderRequest request, UUID userId) {
        Carts cart = cartService.getOrCreateCart(userId);

        if (cart.getItems().isEmpty()) {
            throw new EmptyCartException();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Products product = cartItem.getProduct();

            if (cartItem.getQuantity() > product.getStock()) {
                throw new InsufficientStockException(product.getName(), product.getStock());
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(lineTotal);

            orderItems.add(OrderItem.builder()
                    .id(UUID.randomUUID())
                    .product(product)
                    .productName(product.getName())
                    .priceAtPurchase(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build());

            product.setStock(product.getStock() - cartItem.getQuantity());
        }

        Order order = Order.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .customerEmail(user.getEmail())
                .totalAmount(total)
                .status(OrderStatus.PENDING_PAYMENT)
                .deliveryAddress(request.deliveryAddress())
                .createdAt(Instant.now())
                .build();

        orderItems.forEach(item -> item.setOrder(order));
        order.setItems(orderItems);

        Order saved = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

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

    public Order getOrderEntity(UUID id) {
        return orderRepository.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    }
}
