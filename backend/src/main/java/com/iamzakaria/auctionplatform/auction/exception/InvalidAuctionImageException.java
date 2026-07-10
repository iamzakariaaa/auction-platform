package com.iamzakaria.auctionplatform.auction.exception;

public class InvalidAuctionImageException
        extends RuntimeException {

    public InvalidAuctionImageException(
            String message
    ) {
        super(message);
    }
}