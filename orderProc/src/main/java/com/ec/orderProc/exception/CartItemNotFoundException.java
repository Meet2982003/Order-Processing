package com.ec.orderProc.exception;

import java.util.UUID;

public class CartItemNotFoundException extends RuntimeException {
    public CartItemNotFoundException(UUID id) {
        super("Cart item not found with id: " + id);
    }
}