package com.iamzakaria.auctionplatform.auction.dto;


import java.util.List;

public record AdminDashboardResponse(
        long totalAuctions,
        long scheduledAuctions,
        long activeAuctions,
        long endedAuctions,
        long cancelledAuctions,
        List<AuctionSummaryResponse> recentAuctions
) {
}