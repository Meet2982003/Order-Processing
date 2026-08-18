package com.ec.orderProc.repo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ec.orderProc.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    Optional<Payment> findByOrderId(UUID orderId);

}
