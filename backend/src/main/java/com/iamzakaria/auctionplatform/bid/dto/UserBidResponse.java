package com.iamzakaria.auctionplatform.bid.dto;

import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record UserBidResponse(
        UUID bidId,
        UUID auctionId,
        String auctionTitle,
        BigDecimal bidAmount,
        BigDecimal currentPrice,
        boolean leading,
        AuctionStatus auctionStatus,
        Instant auctionEndTime,
        Instant createdAt
) {
}