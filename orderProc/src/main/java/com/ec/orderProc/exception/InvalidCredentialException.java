package com.ec.orderProc.exception;

public class InvalidCredentialException extends RuntimeException {
    public InvalidCredentialException() {
        super("Invalid Credential");
    }
}
