package com.ec.orderProc.payload;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
                @NotNull String currentPassword,
                @NotNull @Size(min = 8) String newPassword) {

}
