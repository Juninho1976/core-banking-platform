package com.example.banking.accounts.txn;

public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String msg) { super(msg); }
}
