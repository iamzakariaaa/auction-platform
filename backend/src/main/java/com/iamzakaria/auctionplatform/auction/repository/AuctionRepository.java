package com.iamzakaria.auctionplatform.auction.repository;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuctionRepository
        extends JpaRepository<Auction, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT auction
        FROM Auction auction
        WHERE auction.id = :auctionId
        """)
    Optional<Auction> findByIdForUpdate(
            @Param("auctionId") UUID auctionId
    );

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
            @Param("scheduledStatus")
            AuctionStatus scheduledStatus,

            @Param("activeStatus")
            AuctionStatus activeStatus,

            @Param("now")
            Instant now
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT auction
        FROM Auction auction
        WHERE auction.status IN :statuses
          AND auction.endTime <= :now
        ORDER BY auction.endTime
        """)
    List<Auction> findExpiredAuctionsForUpdate(
            @Param("statuses")
            Collection<AuctionStatus> statuses,

            @Param("now")
            Instant now
    );

    Page<Auction> findByWinnerIdOrderByEndTimeDesc(
            UUID winnerId,
            Pageable pageable
    );

    Page<Auction> findByStatus(
            AuctionStatus status,
            Pageable pageable
    );

    @Query("""
    SELECT auction
    FROM Auction auction
    WHERE (
        :search = ''
        OR LOWER(auction.title)
            LIKE CONCAT(
                '%',
                LOWER(:search),
                '%'
            )
    )
    AND (
        :status IS NULL
        OR auction.status = :status
    )
    AND (
        :minimumPrice IS NULL
        OR auction.currentPrice >= :minimumPrice
    )
    AND (
        :maximumPrice IS NULL
        OR auction.currentPrice <= :maximumPrice
    )
    """)
    Page<Auction> searchAuctions(
            @Param("search")
            String search,

            @Param("status")
            AuctionStatus status,

            @Param("minimumPrice")
            BigDecimal minimumPrice,

            @Param("maximumPrice")
            BigDecimal maximumPrice,

            Pageable pageable
    );

    long countByStatus(AuctionStatus status);

    List<Auction> findAllByOrderByCreatedAtDesc(
            Limit limit
    );
}