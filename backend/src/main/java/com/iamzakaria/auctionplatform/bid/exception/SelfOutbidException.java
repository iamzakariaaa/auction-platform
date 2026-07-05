package com.iamzakaria.auctionplatform.bid.exception;

public class SelfOutbidException extends RuntimeException {

    public SelfOutbidException() {
        super(
                "You already have the highest bid."
        );
    }
}