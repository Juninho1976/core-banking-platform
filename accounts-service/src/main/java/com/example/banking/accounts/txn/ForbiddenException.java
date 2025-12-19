package com.example.banking.accounts.txn;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String msg) { super(msg); }
}
