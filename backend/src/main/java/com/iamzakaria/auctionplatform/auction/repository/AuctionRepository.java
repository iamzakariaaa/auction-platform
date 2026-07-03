package com.iamzakaria.auctionplatform.auction.repository;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuctionRepository
        extends JpaRepository<Auction, UUID> {

    Page<Auction> findByStatus(
            AuctionStatus status,
            Pageable pageable
    );
}
