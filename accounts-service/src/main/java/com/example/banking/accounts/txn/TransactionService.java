package com.example.banking.accounts.txn;

import com.example.banking.accounts.account.Account;
import com.example.banking.accounts.account.AccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
public class TransactionService {

    private static final BigDecimal ZERO = new BigDecimal("0.00");
    private static final int SCALE = 2;

    private final AccountRepository accountRepo;
    private final TransactionRepository txnRepo;

    public TransactionService(AccountRepository accountRepo, TransactionRepository txnRepo) {
        this.accountRepo = accountRepo;
        this.txnRepo = txnRepo;
    }

    @Transactional
    public TransactionResponse deposit(UUID userId, UUID accountId, BigDecimal amount, String idempotencyKey) {
        return apply(userId, accountId, TransactionType.DEPOSIT, amount, idempotencyKey);
    }

    @Transactional
    public TransactionResponse withdraw(UUID userId, UUID accountId, BigDecimal amount, String idempotencyKey) {
        return apply(userId, accountId, TransactionType.WITHDRAWAL, amount, idempotencyKey);
    }

    private TransactionResponse apply(UUID userId,
                                      UUID accountId,
                                      TransactionType type,
                                      BigDecimal rawAmount,
                                      String idempotencyKey) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            throw new IllegalArgumentException("Missing Idempotency-Key header");
        }
        if (rawAmount == null) {
            throw new IllegalArgumentException("Missing amount");
        }

        // Normalise amount to pounds/pence using banker’s rounding
        BigDecimal amount = normaliseAmount(rawAmount);

        if (amount.compareTo(ZERO) <= 0) {
            throw new IllegalArgumentException("amount must be > 0");
        }

        // Idempotency: if we’ve already processed this key for this account, return previous transaction id
        // plus the account’s current balance (good enough for MVP)
        var existing = txnRepo.findByAccountIdAndIdempotencyKey(accountId, idempotencyKey);
        if (existing.isPresent()) {
            Transaction t = existing.get();

            Account acctNow = accountRepo.findById(accountId)
                    .orElseThrow(() -> new NotFoundException("Account not found"));

            // Optional: enforce ownership even for idempotent replays
            if (!acctNow.getUserId().equals(userId)) {
                throw new ForbiddenException("Account does not belong to user");
            }

            return new TransactionResponse(
                    t.getId(),
                    t.getAccountId(),
                    t.getType().name(),
                    t.getAmount(),
                    acctNow.getBalance(),
                    t.getCreatedAt()
            );
        }

        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));

        if (!account.getUserId().equals(userId)) {
            throw new ForbiddenException("Account does not belong to user");
        }

        BigDecimal currentBalance = normaliseMoney(account.getBalance());
        BigDecimal newBalance;

        if (type == TransactionType.DEPOSIT) {
            newBalance = safeAdd(currentBalance, amount);
        } else {
            // WITHDRAWAL
            newBalance = currentBalance.subtract(amount);
            if (newBalance.compareTo(ZERO) < 0) {
                throw new BusinessRuleException("Insufficient funds");
            }
        }

        account.setBalance(newBalance);
        accountRepo.save(account);

        Transaction txn = txnRepo.save(new Transaction(accountId, userId, type, amount, idempotencyKey));

        return new TransactionResponse(
                txn.getId(),
                accountId,
                type.name(),
                amount,
                newBalance,
                txn.getCreatedAt()
        );
    }

    private BigDecimal normaliseAmount(BigDecimal amount) {
        // 2dp, banker’s rounding. This ensures 10, 10.0, 10.00 all become 10.00
        return amount.setScale(SCALE, RoundingMode.HALF_EVEN);
    }

    private BigDecimal normaliseMoney(BigDecimal money) {
        if (money == null) return ZERO;
        return money.setScale(SCALE, RoundingMode.HALF_EVEN);
    }

    private BigDecimal safeAdd(BigDecimal a, BigDecimal b) {
        // BigDecimal doesn’t overflow like long, but we still enforce “sane” values
        BigDecimal result = a.add(b).setScale(SCALE, RoundingMode.HALF_EVEN);

        // Optional guardrail (prevents ridiculous balances during dev)
        // if (result.compareTo(new BigDecimal("1000000000.00")) > 0) throw new BusinessRuleException("Balance too large");

        return result;
    }
}
