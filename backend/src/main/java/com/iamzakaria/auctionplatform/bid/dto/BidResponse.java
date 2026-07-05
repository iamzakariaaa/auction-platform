package com.iamzakaria.auctionplatform.bid.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BidResponse(
        UUID id,
        UUID auctionId,
        UUID bidderId,
        String bidderName,
        BigDecimal amount,
        Instant createdAt
) {
}