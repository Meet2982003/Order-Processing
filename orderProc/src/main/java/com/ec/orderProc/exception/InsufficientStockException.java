package com.ec.orderProc.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String productName, int available) {
        super("Insufficient stock for " + productName + ". Only " + available + " available.");
    }
}