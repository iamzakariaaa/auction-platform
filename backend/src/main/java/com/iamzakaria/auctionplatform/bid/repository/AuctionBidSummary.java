package com.iamzakaria.auctionplatform.bid.repository;

import java.math.BigDecimal;

public interface AuctionBidSummary {

    long getBidCount();

    BigDecimal getHighestBid();
}