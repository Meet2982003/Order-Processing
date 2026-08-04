package com.ec.orderProc.payload;

import java.util.UUID;

public record LoginResponse(String token, UUID userId, String email) {

}
