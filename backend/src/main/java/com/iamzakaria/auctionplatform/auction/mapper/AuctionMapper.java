package com.iamzakaria.auctionplatform.auction.mapper;

import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionSummaryResponse;
import com.iamzakaria.auctionplatform.auction.entity.Auction;

public final class AuctionMapper {

    private AuctionMapper() {
    }

    public static AuctionResponse toResponse(
            Auction auction
    ) {
        return new AuctionResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getDescription(),
                auction.getStartingPrice(),
                auction.getCurrentPrice(),
                auction.getMinimumBidIncrement(),
                auction.getStatus(),
                auction.getStartTime(),
                auction.getEndTime(),
                auction.getCreatedAt(),
                auction.getUpdatedAt()
        );
    }

    public static AuctionSummaryResponse toSummary(
            Auction auction
    ) {
        return toSummary(auction, null);
    }

    public static AuctionSummaryResponse toSummary(
            Auction auction,
            String primaryImageUrl
    ) {
        return new AuctionSummaryResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getCurrentPrice(),
                auction.getStatus(),
                auction.getStartTime(),
                auction.getEndTime(),
                primaryImageUrl
        );
    }
}