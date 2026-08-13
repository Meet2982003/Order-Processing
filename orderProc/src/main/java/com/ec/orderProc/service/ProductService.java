package com.ec.orderProc.service;

import com.ec.orderProc.exception.ProductNotFoundException;
import com.ec.orderProc.model.Products;
import com.ec.orderProc.payload.CreateProductRequest;
import com.ec.orderProc.payload.ProductResponse;
import com.ec.orderProc.repo.ProductsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductsRepository productRepository;

    public ProductService(ProductsRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream().map(ProductResponse::from).toList();
    }

    public ProductResponse getProduct(UUID id) {
        Products product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
        return ProductResponse.from(product);
    }

    public ProductResponse createProduct(CreateProductRequest request) {
        Products product = Products.builder()
                .id(UUID.randomUUID())
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .stock(request.stock())
                .category(request.category())
                .build();

        return ProductResponse.from(productRepository.save(product));
    }

    public ProductResponse updateProduct(UUID id, CreateProductRequest request) {
        Products product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setCategory(request.category());

        return ProductResponse.from(productRepository.save(product));
    }

    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }
}