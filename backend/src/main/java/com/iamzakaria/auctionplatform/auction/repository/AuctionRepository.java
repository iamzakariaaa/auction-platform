package com.iamzakaria.auctionplatform.auction.repository;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface AuctionRepository extends JpaRepository<Auction, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT auction
        FROM Auction auction
        WHERE auction.id = :auctionId
        """)
    Optional<Auction> findByIdForUpdate(
            @Param("auctionId") UUID auctionId
    );

    //This changes auctions status from SCHEDULED to ACTIVE
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Auction auction
            SET auction.status = :activeStatus,
                auction.updatedAt = :now
            WHERE auction.status = :scheduledStatus
              AND auction.startTime <= :now
              AND auction.endTime > :now
            """)
    int activateScheduledAuctions(
            @Param("scheduledStatus") AuctionStatus scheduledStatus,
            @Param("activeStatus") AuctionStatus activeStatus,
            @Param("now") Instant now
    );

    //This changes expired auctions status to ENDED.
    @Modifying(clearAutomatically = true)
    @Query("""
            UPDATE Auction auction
            SET auction.status = :endedStatus,
                auction.updatedAt = :now
            WHERE auction.status IN :statuses
              AND auction.endTime <= :now
            """)
    int endExpiredAuctions(
            @Param("statuses") Iterable<AuctionStatus> statuses,
            @Param("endedStatus") AuctionStatus endedStatus,
            @Param("now") Instant now
    );

    Page<Auction> findByStatus(
            AuctionStatus status,
            Pageable pageable
    );
}
