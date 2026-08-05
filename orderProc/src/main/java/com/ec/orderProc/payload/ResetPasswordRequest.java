package com.ec.orderProc.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotNull @Email String email,
        @NotNull String otp,
        @NotNull @Size(min = 8) String newPassword) {

}
