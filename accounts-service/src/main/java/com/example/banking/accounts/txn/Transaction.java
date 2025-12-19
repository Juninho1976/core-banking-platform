package com.example.banking.accounts.txn;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import java.math.BigDecimal;

@Entity
@Table(name = "transactions",
       indexes = {
           @Index(name = "idx_txn_account", columnList = "accountId"),
           @Index(name = "idx_txn_idem", columnList = "accountId,idempotencyKey", unique = true)
       })
public class Transaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID accountId;

    @Column(nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private String idempotencyKey;

    protected Transaction() {}

    public Transaction(UUID accountId, UUID userId, TransactionType type, BigDecimal amount, String idempotencyKey) {
        this.accountId = accountId;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.idempotencyKey = idempotencyKey;
    }

    public UUID getId() { return id; }
    public UUID getAccountId() { return accountId; }
    public UUID getUserId() { return userId; }
    public TransactionType getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public Instant getCreatedAt() { return createdAt; }
    public String getIdempotencyKey() { return idempotencyKey; }
}
