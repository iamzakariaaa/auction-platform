package com.iamzakaria.auctionplatform.auction.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WonAuctionResponse(
        UUID auctionId,
        String title,
        BigDecimal winningAmount,
        UUID winningBidId,
        Instant endedAt
) {
}
