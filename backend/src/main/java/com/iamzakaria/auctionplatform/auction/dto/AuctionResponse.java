package com.iamzakaria.auctionplatform.auction.dto;

import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AuctionResponse(
        UUID id,
        String title,
        String description,
        BigDecimal startingPrice,
        BigDecimal currentPrice,
        BigDecimal minimumBidIncrement,
        AuctionStatus status,
        Instant startTime,
        Instant endTime,
        Instant createdAt,
        Instant updatedAt
) {
}
