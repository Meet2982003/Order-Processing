package com.ec.orderProc.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.stripe.Stripe;

import jakarta.annotation.PostConstruct;

@Component
public class StripeConfig {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }
}
