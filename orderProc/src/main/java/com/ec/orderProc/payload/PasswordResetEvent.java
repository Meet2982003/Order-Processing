package com.ec.orderProc.payload;

public record PasswordResetEvent(String email, String otp) {

}
