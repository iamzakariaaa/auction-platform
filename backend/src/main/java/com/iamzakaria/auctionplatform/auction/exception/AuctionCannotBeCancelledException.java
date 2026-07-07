package com.iamzakaria.auctionplatform.auction.exception;

import java.util.UUID;

public class AuctionCannotBeCancelledException
        extends RuntimeException {

    public AuctionCannotBeCancelledException(
            UUID auctionId
    ) {
        super(
                "Auction "
                        + auctionId
                        + " cannot be cancelled."
        );
    }
}