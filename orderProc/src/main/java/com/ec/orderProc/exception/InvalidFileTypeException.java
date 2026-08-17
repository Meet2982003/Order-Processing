package com.ec.orderProc.exception;

public class InvalidFileTypeException extends RuntimeException {
    public InvalidFileTypeException() {
        super("File must be an image");
    }

}
