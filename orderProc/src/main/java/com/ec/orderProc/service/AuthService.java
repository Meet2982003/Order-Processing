package com.ec.orderProc.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ec.orderProc.exception.EmailAlreadyExistsException;
import com.ec.orderProc.model.User;
import com.ec.orderProc.payload.RegisterRequest;
import com.ec.orderProc.payload.RegisterResponse;
import com.ec.orderProc.repo.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyExistsException(request.email());
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .createdAt(Instant.now())
                .build();
        User saved = userRepository.save(user);
        return new RegisterResponse(saved.getId(), saved.getEmail());
    }
}
