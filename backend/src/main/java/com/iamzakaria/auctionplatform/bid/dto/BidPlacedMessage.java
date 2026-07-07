package com.iamzakaria.auctionplatform.bid.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BidPlacedMessage(
        UUID bidId,
        UUID auctionId,
        BigDecimal amount,
        String bidderName,
        long bidCount,
        Instant placedAt
) {
}