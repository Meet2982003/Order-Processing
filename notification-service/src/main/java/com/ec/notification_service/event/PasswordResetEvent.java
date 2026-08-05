package com.ec.notification_service.event;

public record PasswordResetEvent(String email, String otp) {

}
