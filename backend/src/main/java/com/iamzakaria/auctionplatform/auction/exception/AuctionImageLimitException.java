package com.iamzakaria.auctionplatform.auction.exception;

public class AuctionImageLimitException
        extends RuntimeException {

    public AuctionImageLimitException() {
        super(
                "An auction cannot contain more than 8 images."
        );
    }
}