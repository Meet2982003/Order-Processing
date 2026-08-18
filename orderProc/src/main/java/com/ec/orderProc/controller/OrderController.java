package com.ec.orderProc.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ec.orderProc.model.Order;
import com.ec.orderProc.payload.CreateOrderRequest;
import com.ec.orderProc.payload.OrderResponse;
import com.ec.orderProc.service.OrderService;
import com.ec.orderProc.service.PaymentService;
import com.stripe.exception.StripeException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final PaymentService paymentService;

    private final OrderService orderService;

    public OrderController(OrderService orderService, PaymentService paymentService) {
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createOrder(@Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) throws StripeException {
        UUID userId = UUID.fromString(authentication.getName());
        OrderResponse response = orderService.createOrder(request, userId);

        Order order = orderService.getOrderEntity(response.id());
        String checkoutUrl = paymentService.createCheckoutSession(order);
        return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl, "orderId", response.id().toString()));
    }

    @GetMapping("/for-user")
    public ResponseEntity<List<OrderResponse>> getOrders(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(orderService.getOrdersForUser(userId));
    }

    @GetMapping("/get-order-by-id/{id}")
    public ResponseEntity<OrderResponse> getOrderByid(@PathVariable UUID id, Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(orderService.getOrder(id, userId));
    }
}
