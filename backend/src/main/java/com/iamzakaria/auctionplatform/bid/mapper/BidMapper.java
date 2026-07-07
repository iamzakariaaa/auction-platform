package com.iamzakaria.auctionplatform.bid.mapper;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.bid.dto.BidResponse;
import com.iamzakaria.auctionplatform.bid.dto.UserBidResponse;
import com.iamzakaria.auctionplatform.bid.entity.Bid;

public final class BidMapper {

    private BidMapper() {
    }

    public static BidResponse toResponse(Bid bid) {
        String bidderName =
                bid.getBidder().getFirstName()
                        + " "
                        + bid.getBidder().getLastName();

        return new BidResponse(
                bid.getId(),
                bid.getAuction().getId(),
                bid.getBidder().getId(),
                bidderName,
                bid.getAmount(),
                bid.getCreatedAt()
        );
    }

    public static UserBidResponse toUserBidResponse(
            Bid bid
    ) {
        Auction auction = bid.getAuction();

        boolean leading =
                bid.getAmount().compareTo(
                        auction.getCurrentPrice()
                ) == 0;

        return new UserBidResponse(
                bid.getId(),
                auction.getId(),
                auction.getTitle(),
                bid.getAmount(),
                auction.getCurrentPrice(),
                leading,
                auction.getStatus(),
                auction.getEndTime(),
                bid.getCreatedAt()
        );
    }
}