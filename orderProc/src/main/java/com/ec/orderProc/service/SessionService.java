package com.ec.orderProc.service;

import java.time.Duration;
import java.util.UUID;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    private final StringRedisTemplate redisTemplate;

    public SessionService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void registerSession(UUID userId, String tokenId, long expirationMs) {
        redisTemplate.opsForValue().set(
                "active_session:" + userId,
                tokenId,
                Duration.ofMillis(expirationMs));
    }

    public boolean isActiveSession(UUID userId, String tokenId) {
        String activeTokenId = redisTemplate.opsForValue().get("active_session:" + userId);
        return tokenId.equals(activeTokenId);
    }

}
