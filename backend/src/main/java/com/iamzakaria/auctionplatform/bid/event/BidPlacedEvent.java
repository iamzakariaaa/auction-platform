package com.iamzakaria.auctionplatform.bid.event;

import java.util.UUID;

public record BidPlacedEvent(
        UUID bidId
) {
}