package com.iamzakaria.auctionplatform.bid.exception;

import java.util.UUID;

public class AuctionNotActiveException
        extends RuntimeException {

    public AuctionNotActiveException(UUID auctionId) {
        super(
                "Auction "
                        + auctionId
                        + " is not currently active."
        );
    }
}