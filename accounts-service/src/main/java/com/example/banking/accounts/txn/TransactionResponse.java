package com.example.banking.accounts.txn;

import java.time.Instant;
import java.util.UUID;
import java.math.BigDecimal;
// ...
public record TransactionResponse(
        UUID transactionId,
        UUID accountId,
        String type,
        BigDecimal amount,
        BigDecimal newBalance,
        Instant createdAt
) {}

