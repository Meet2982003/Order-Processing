package com.ec.orderProc.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ec.orderProc.model.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

}
