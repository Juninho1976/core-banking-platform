package com.example.banking.accounts.txn;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
public class TransactionController {

    private final TransactionService service;
    private final TransactionRepository txnRepo;

    public TransactionController(TransactionService service, TransactionRepository txnRepo) {
        this.service = service;
        this.txnRepo = txnRepo;
    }

    @PostMapping("/{accountId}/deposit")
    public TransactionResponse deposit(
            Authentication auth,
            @PathVariable UUID accountId,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody TransactionRequest request
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        return service.deposit(userId, accountId, request.amount(), idempotencyKey);
    }

    @PostMapping("/{accountId}/withdraw")
    public TransactionResponse withdraw(
            Authentication auth,
            @PathVariable UUID accountId,
            @RequestHeader(name = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody TransactionRequest request
    ) {
        UUID userId = (UUID) auth.getPrincipal();
        return service.withdraw(userId, accountId, request.amount(), idempotencyKey);
    }

    @GetMapping("/{accountId}/transactions")
    public List<Transaction> list(@PathVariable UUID accountId) {
        return txnRepo.findTop50ByAccountIdOrderByCreatedAtDesc(accountId);
    }
}
