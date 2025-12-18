package com.example.banking.auth.api;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {}
