package com.iamzakaria.auctionplatform.auction.exception;

import java.util.UUID;

public class AuctionNotFoundException extends RuntimeException {

    public AuctionNotFoundException(UUID auctionId) {
        super("Auction not found: " + auctionId);
    }
}
