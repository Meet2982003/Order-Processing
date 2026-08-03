package com.ec.orderProc.payload;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OrderCreatedEvent(
                UUID orderId,
                String customerEmail,
                BigDecimal totalAmount,
                Instant createdAt) {

}
