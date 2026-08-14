package com.ec.orderProc.service;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.ec.orderProc.exception.CartItemNotFoundException;
import com.ec.orderProc.exception.InsufficientStockException;
import com.ec.orderProc.exception.ProductNotFoundException;
import com.ec.orderProc.model.CartItem;
import com.ec.orderProc.model.Carts;
import com.ec.orderProc.model.Products;
import com.ec.orderProc.payload.AddCartItemRequest;
import com.ec.orderProc.payload.CartResponse;
import com.ec.orderProc.repo.CartItemRepository;
import com.ec.orderProc.repo.CartRepository;
import com.ec.orderProc.repo.ProductsRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductsRepository productsRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
            ProductsRepository productsRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productsRepository = productsRepository;
    }

    public Carts getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(
                        Carts.builder().id(UUID.randomUUID()).userId(userId).build()));
    }

    public CartResponse addItem(UUID userId, AddCartItemRequest request) {
        Carts cart = getOrCreateCart(userId);
        Products product = productsRepository.findById(request.productId())
                .orElseThrow(() -> new ProductNotFoundException(request.productId()));

        if (request.quantity() > product.getStock()) {
            throw new InsufficientStockException(product.getName(), product.getStock());
        }

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + request.quantity());
        } else {
            CartItem item = CartItem.builder()
                    .id(UUID.randomUUID())
                    .cart(cart)
                    .product(product)
                    .quantity(request.quantity())
                    .build();
            cart.getItems().add(item);
        }

        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    public CartResponse updateQuantity(UUID userId, UUID itemId, int quantity) {
        Carts cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new CartItemNotFoundException(itemId));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            if (quantity > item.getProduct().getStock()) {
                throw new InsufficientStockException(item.getProduct().getName(), item.getProduct().getStock());
            }
            item.setQuantity(quantity);
        }

        cartRepository.save(cart);
        return CartResponse.from(cart);
    }

    public CartResponse removeItem(UUID userId, UUID itemId) {
        return updateQuantity(userId, itemId, 0);
    }

    public CartResponse getCart(UUID userId) {
        return CartResponse.from(getOrCreateCart(userId));
    }
}
