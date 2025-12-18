package com.example.banking.accounts.account;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountRepository repo;

    public AccountController(AccountRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public Account create(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        String accountNumber = "SAV-" + UUID.randomUUID().toString().substring(0, 8);
        return repo.save(new Account(userId, accountNumber));
    }

    @GetMapping
    public List<Account> list(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return repo.findByUserId(userId);
    }
}
