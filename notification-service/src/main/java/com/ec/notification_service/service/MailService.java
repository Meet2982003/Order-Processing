package com.ec.notification_service.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class MailService {

  private final JavaMailSender mailSender;

  public MailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  // @Async
  public void sendOrderConfirmation(String toEmail, String orderId) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(toEmail);
    message.setSubject("Order Confirmation - " + orderId);
    message.setText("Thanks for your order! Your orrder Id is: " + orderId);
    mailSender.send(message);
  }
}
