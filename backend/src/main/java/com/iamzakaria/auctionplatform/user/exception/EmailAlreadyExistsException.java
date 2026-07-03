package com.iamzakaria.auctionplatform.user.exception;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("A user already exists with email: " + email);
    }
}
