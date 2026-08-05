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

  @Async
  public void sendOtpEmail(String email, String otp) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setTo(email);
    message.setSubject("Your password reset code");
    message.setText("Your one-time password (OTP) is: " + otp +
        "\n\nThis code is valid for 10 minutes. If you didn't request a password reset, You can safely ignore this email");
    mailSender.send(message);
  }
}
