package com.ec.orderProc.service;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ec.orderProc.exception.EmailAlreadyExistsException;
import com.ec.orderProc.exception.InvalidCredentialException;
import com.ec.orderProc.model.User;
import com.ec.orderProc.payload.LoginRequest;
import com.ec.orderProc.payload.LoginResponse;
import com.ec.orderProc.payload.RegisterRequest;
import com.ec.orderProc.payload.RegisterResponse;
import com.ec.orderProc.repo.UserRepository;
import com.ec.orderProc.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialException();
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new LoginResponse(token, user.getId(), user.getEmail());
    }

}
