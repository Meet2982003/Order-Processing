package com.ec.notification_service.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.ec.notification_service.event.OrderCreatedEvent;

@Component
public class OrderEventListener {

    @KafkaListener(topics = "order.created", groupId = "notification-service")
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Received order.created event: " + event);

        // TODO: actually sends mail here
    }
}
