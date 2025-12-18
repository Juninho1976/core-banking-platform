package com.example.banking.auth.api;

import java.util.UUID;

public record RegisterResponse(UUID userId, String email) {}
