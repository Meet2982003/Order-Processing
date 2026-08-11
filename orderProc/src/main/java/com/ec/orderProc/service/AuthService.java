package com.ec.orderProc.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ec.orderProc.exception.EmailAlreadyExistsException;
import com.ec.orderProc.exception.InvalidCredentialException;
import com.ec.orderProc.exception.InvalidOtpException;
import com.ec.orderProc.model.ResetPasswordToken;
import com.ec.orderProc.model.User;
import com.ec.orderProc.payload.ChangePasswordRequest;
import com.ec.orderProc.payload.ForgotPasswordRequest;
import com.ec.orderProc.payload.LoginRequest;
import com.ec.orderProc.payload.LoginResponse;
import com.ec.orderProc.payload.PasswordResetEvent;
import com.ec.orderProc.payload.RegisterRequest;
import com.ec.orderProc.payload.RegisterResponse;
import com.ec.orderProc.payload.ResetPasswordRequest;
import com.ec.orderProc.repo.ResetPasswordTokenRepository;
import com.ec.orderProc.repo.UserRepository;
import com.ec.orderProc.security.JwtService;

import io.jsonwebtoken.Claims;

@Service
public class AuthService {

    private final SessionService sessionService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ResetPasswordTokenRepository resetPasswordTokenRepository;
    private final KafkaTemplate<String, PasswordResetEvent> kafkaTemplate;

    private static final String OTP_TOPIC = "password.reset.requested";
    private static final long OTP_VALIDITY_MINUTES = 10;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
            ResetPasswordTokenRepository resetPasswordTokenRepository,
            KafkaTemplate<String, PasswordResetEvent> kafkaTemplate, SessionService sessionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.resetPasswordTokenRepository = resetPasswordTokenRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.sessionService = sessionService;
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

        try {
            User saved = userRepository.save(user);
            return new RegisterResponse(saved.getId(), saved.getEmail());
        } catch (DataIntegrityViolationException e) {
            throw new EmailAlreadyExistsException(request.email());
        }
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialException::new);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialException();
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());
        Claims claims = jwtService.parseClaims(token);
        sessionService.registerSession(user.getId(), claims.getId(), jwtService.getExpirationMs());
        return new LoginResponse(token, user.getId(), user.getEmail());
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email()).orElse(null);

        if (user == null)
            return;

        String otp = generateOtp();

        ResetPasswordToken token = ResetPasswordToken.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(Instant.now().plus(OTP_VALIDITY_MINUTES, ChronoUnit.MINUTES))
                .used(false)
                .build();
        resetPasswordTokenRepository.save(token);

        kafkaTemplate.send(OTP_TOPIC, user.getId().toString(),
                new PasswordResetEvent(user.getEmail(), otp));
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialException::new);

        ResetPasswordToken token = resetPasswordTokenRepository
                .findTopByUserIdAndUsedFalseOrderByExpiresAtDesc(user.getId())
                .orElseThrow(InvalidOtpException::new);

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidOtpException();
        }

        if (!passwordEncoder.matches(request.otp(), token.getOtpHash())) {
            throw new InvalidOtpException();
        }

        token.setUsed(true);
        resetPasswordTokenRepository.save(token);

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

    }

    private String generateOtp() {
        return String.valueOf(100000 + new SecureRandom().nextInt(900000));
    }

    public void changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialException();
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public void logout(UUID userId) {
        sessionService.clearSession(userId);
    }

}
