package com.iamzakaria.auctionplatform.auction.exception;

import java.util.UUID;

public class AuctionNotEditableException extends RuntimeException {

    public AuctionNotEditableException(UUID auctionId) {
        super(
                "Auction " + auctionId +
                        " cannot be edited in its current state."
        );
    }
}
