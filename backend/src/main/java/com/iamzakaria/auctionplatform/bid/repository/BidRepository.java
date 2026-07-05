package com.iamzakaria.auctionplatform.bid.repository;

import com.iamzakaria.auctionplatform.bid.entity.Bid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BidRepository extends JpaRepository<Bid, UUID> {

    Optional<Bid> findTopByAuctionIdOrderByAmountDescCreatedAtAsc(
            UUID auctionId
    );

    List<Bid> findByAuctionIdOrderByAmountDescCreatedAtAsc(
            UUID auctionId,
            Pageable pageable
    );

    List<Bid> findByBidderIdOrderByCreatedAtDesc(
            UUID bidderId,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(bid) AS bidCount,
               MAX(bid.amount) AS highestBid
        FROM Bid bid
        WHERE bid.auction.id = :auctionId
        """)
    AuctionBidSummary getAuctionBidSummary(
            @Param("auctionId") UUID auctionId
    );

    long countByAuctionId(UUID auctionId);
}
