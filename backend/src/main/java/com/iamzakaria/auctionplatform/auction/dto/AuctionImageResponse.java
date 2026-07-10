package com.iamzakaria.auctionplatform.auction.dto;

import java.time.Instant;
import java.util.UUID;

public record AuctionImageResponse(
        UUID id,
        UUID auctionId,
        String url,
        String originalFilename,
        String contentType,
        long fileSize,
        int displayOrder,
        boolean primaryImage,
        Instant createdAt
) {
}