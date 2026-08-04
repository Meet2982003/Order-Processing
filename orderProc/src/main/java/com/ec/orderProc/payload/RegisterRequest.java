package com.ec.orderProc.payload;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(@NotNull @Email String email,
        @NotNull @Size(min = 8, message = "Password must be 8 characters") String password) {

}
