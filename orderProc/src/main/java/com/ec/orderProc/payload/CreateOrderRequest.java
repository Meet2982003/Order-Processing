package com.ec.orderProc.payload;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(@NotNull @Email String customerEmail, @NotNull @NotBlank String deliveryAddress,
                @NotNull @DecimalMin(value = "0.01") BigDecimal totalAmount) {

}
