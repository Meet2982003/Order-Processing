package com.ec.orderProc.repo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ec.orderProc.model.Carts;

public interface CartRepository extends JpaRepository<Carts, UUID> {
    Optional<Carts> findByUserId(UUID userId);
}
