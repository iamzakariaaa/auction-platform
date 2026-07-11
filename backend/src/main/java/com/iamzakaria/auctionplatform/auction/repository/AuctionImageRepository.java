package com.iamzakaria.auctionplatform.auction.repository;

import com.iamzakaria.auctionplatform.auction.entity.AuctionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuctionImageRepository
        extends JpaRepository<AuctionImage, UUID> {

    List<AuctionImage>
    findByAuctionIdOrderByDisplayOrderAsc(
            UUID auctionId
    );

    Optional<AuctionImage>
    findByIdAndAuctionId(
            UUID imageId,
            UUID auctionId
    );

    Optional<AuctionImage>
    findByAuctionIdAndPrimaryImageTrue(
            UUID auctionId
    );

    List<AuctionImage>
    findByAuctionIdInAndPrimaryImageTrue(
            Collection<UUID> auctionIds
    );

    long countByAuctionId(UUID auctionId);

    @Query("""
        SELECT COALESCE(
            MAX(image.displayOrder),
            -1
        )
        FROM AuctionImage image
        WHERE image.auction.id = :auctionId
        """)
    int findMaximumDisplayOrder(
            @Param("auctionId")
            UUID auctionId
    );
}