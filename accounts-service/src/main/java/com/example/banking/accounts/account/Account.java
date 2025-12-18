package com.example.banking.accounts.account;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "accounts")
public class Account {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private long balanceInCents = 0;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Account() {}

    public Account(UUID userId, String accountNumber) {
        this.userId = userId;
        this.accountNumber = accountNumber;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getAccountNumber() { return accountNumber; }
    public long getBalanceInCents() { return balanceInCents; }
    public Instant getCreatedAt() { return createdAt; }
}
