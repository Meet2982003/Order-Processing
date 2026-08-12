package com.ec.orderProc.exception;

public class GeocodingException extends RuntimeException {
    public GeocodingException(String address) {
        super(address);
    }
}
