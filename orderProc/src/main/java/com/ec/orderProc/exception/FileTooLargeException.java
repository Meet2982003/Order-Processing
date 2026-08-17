package com.ec.orderProc.exception;

public class FileTooLargeException extends RuntimeException {
    public FileTooLargeException() {
        super("File size should not exceed 5MB");
    }

}
