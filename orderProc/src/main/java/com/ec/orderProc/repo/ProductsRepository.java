package com.ec.orderProc.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ec.orderProc.model.Products;

public interface ProductsRepository extends JpaRepository<Products, UUID> {

}
