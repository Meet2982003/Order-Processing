package com.ec.notification_service.listener;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.ec.notification_service.event.PasswordResetEvent;
import com.ec.notification_service.service.MailService;

@Component
public class PasswordResetListener {

    private final MailService mailService;

    public PasswordResetListener(MailService mailService) {
        this.mailService = mailService;
    }

    @KafkaListener(topics = "password.reset.requested", groupId = "notification-service")
    public void handlePasswordReset(PasswordResetEvent event) {
        mailService.sendOtpEmail(event.email(), event.otp());
    }
}
