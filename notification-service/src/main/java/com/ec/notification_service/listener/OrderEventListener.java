package com.ec.notification_service.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.ec.notification_service.event.OrderCreatedEvent;
import com.ec.notification_service.service.MailService;

@Component
public class OrderEventListener {

    private final MailService mailService;

    public OrderEventListener(MailService mailService) {
        this.mailService = mailService;
    }

    @KafkaListener(topics = "order.created", groupId = "notification-service")
    public void handleOrderCreated(OrderCreatedEvent event) {
        System.out.println("Received order.created event: " + event);
        mailService.sendOrderConfirmation(event.customerEmail(), event.orderId().toString());
        // TODO: actually sends mail here
    }
}
