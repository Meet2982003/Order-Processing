package com.ec.orderProc.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(@NotNull @NotBlank String deliveryAddress) {

}
