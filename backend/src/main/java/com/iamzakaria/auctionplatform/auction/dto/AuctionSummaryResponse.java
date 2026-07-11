package com.iamzakaria.auctionplatform.auction.dto;

import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AuctionSummaryResponse(
        UUID id,
        String title,
        BigDecimal currentPrice,
        AuctionStatus status,
        Instant startTime,
        Instant endTime,
        String primaryImageUrl
) {
}