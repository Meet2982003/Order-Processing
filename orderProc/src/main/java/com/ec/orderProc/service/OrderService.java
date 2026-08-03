package com.ec.orderProc.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ec.orderProc.exception.OrderNotFoundException;
import com.ec.orderProc.model.Order;
import com.ec.orderProc.model.OrderStatus;
import com.ec.orderProc.payload.CreateOrderRequest;
import com.ec.orderProc.payload.OrderResponse;
import com.ec.orderProc.repo.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = Order.builder()
                .id(UUID.randomUUID())
                .customerEmail(request.customerEmail())
                .totalAmount(request.totalAmount())
                .status(OrderStatus.CREATED)
                .createdAt(Instant.now())
                .build();

        Order saved = orderRepository.save(order);
        return OrderResponse.from(saved);
    }

    public OrderResponse getOrder(UUID id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException(id));
        return OrderResponse.from(order);
    }

}
