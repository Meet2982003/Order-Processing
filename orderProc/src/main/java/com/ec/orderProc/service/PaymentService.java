package com.ec.orderProc.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ec.orderProc.enums.PaymentStatus;
import com.ec.orderProc.model.Order;
import com.ec.orderProc.model.Payment;
import com.ec.orderProc.repo.PaymentRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Value("${stripe.success-url}")
    private String successUrl;

    @Value("${stripe.cancel-url}")
    private String cancelUrl;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public String createCheckoutSession(Order order) throws StripeException {

        SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                .setQuantity(1L)
                .setPriceData(
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount(order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue())
                                .setProductData(
                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                .setName("Order #" + order.getId().toString().substring(0, 8))
                                                .build())
                                .build())
                .build();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .addLineItem(lineItem)
                .setSuccessUrl(successUrl + "?orderId=" + order.getId())
                .setCancelUrl(cancelUrl + "?orderId=" + order.getId())
                .putMetadata("orderId", order.getId().toString())
                .build();

        Session session = Session.create(params);

        Payment payment = Payment.builder()
                .id(UUID.randomUUID())
                .orderId(order.getId())
                .stripeSessionId(session.getId())
                .amount(order.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        paymentRepository.save(payment);

        return session.getUrl();
    }

}
