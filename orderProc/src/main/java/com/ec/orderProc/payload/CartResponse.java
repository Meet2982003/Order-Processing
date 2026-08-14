package com.ec.orderProc.payload;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import com.ec.orderProc.model.Carts;

public record CartResponse(UUID id, List<CartItemResponse> items, BigDecimal total) {
    public static CartResponse from(Carts cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(i -> new CartItemResponse(
                        i.getId(), i.getProduct().getId(), i.getProduct().getName(),
                        i.getProduct().getPrice(), i.getQuantity()))
                .toList();

        BigDecimal total = items.stream()
                .map(i -> i.price().multiply(BigDecimal.valueOf(i.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cart.getId(), items, total);
    }
}
