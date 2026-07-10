package com.iamzakaria.auctionplatform.auction.exception;

public class AuctionImageStorageException
        extends RuntimeException {

    public AuctionImageStorageException(
            String message
    ) {
        super(message);
    }

    public AuctionImageStorageException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}