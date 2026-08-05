package com.ec.orderProc.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record VerifyOtpRequest(@NotNull @Email String email, @NotNull String otp) {

}
