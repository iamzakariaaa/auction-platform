package com.iamzakaria.auctionplatform.auction.repository;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    Page<Auction> findByStatus(
            AuctionStatus status,
            Pageable pageable
    );
}
