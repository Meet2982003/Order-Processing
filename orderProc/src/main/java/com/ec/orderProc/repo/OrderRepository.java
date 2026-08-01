package com.ec.orderProc.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ec.orderProc.model.Order;

public interface OrderRepository extends JpaRepository<Order, UUID> {

}
