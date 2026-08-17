package com.ec.orderProc.payload;

import java.time.Instant;
import java.util.UUID;

import com.ec.orderProc.enums.Role;
import com.ec.orderProc.model.User;

public record AccountResponse(
        UUID id, String email, String fullName, String phoneNumber,
        Role role, Instant createdAt, boolean hasProfilePicture) {
    public static AccountResponse from(User user) {
        return new AccountResponse(
                user.getId(), user.getEmail(), user.getFullName(), user.getPhoneNumber(),
                user.getRole(), user.getCreatedAt(), user.getProfilePicture() != null);
    }
}
