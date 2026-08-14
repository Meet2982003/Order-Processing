package com.ec.orderProc.payload;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(UUID productId, String productName, BigDecimal priceAtPurchase, Integer quantity) {
}
