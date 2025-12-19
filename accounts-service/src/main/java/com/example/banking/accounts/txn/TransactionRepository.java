package com.example.banking.accounts.txn;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Optional<Transaction> findByAccountIdAndIdempotencyKey(UUID accountId, String idempotencyKey);

    List<Transaction> findTop50ByAccountIdOrderByCreatedAtDesc(UUID accountId);
}
