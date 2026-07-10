package com.iamzakaria.auctionplatform.auction.exception;

import java.util.UUID;

public class AuctionImageNotFoundException
        extends RuntimeException {

    public AuctionImageNotFoundException(
            UUID imageId
    ) {
        super(
                "Auction image "
                        + imageId
                        + " was not found."
        );
    }
}