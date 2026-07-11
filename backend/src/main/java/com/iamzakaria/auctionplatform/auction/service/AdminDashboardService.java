package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.dto.AdminDashboardResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionSummaryResponse;
import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.mapper.AuctionMapper;
import com.iamzakaria.auctionplatform.auction.repository.AuctionImageRepository;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final AuctionRepository auctionRepository;
    private final AuctionImageRepository imageRepository;

    public AdminDashboardService(
            AuctionRepository auctionRepository,
            AuctionImageRepository imageRepository
    ) {
        this.auctionRepository = auctionRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalAuctions =
                auctionRepository.count();

        long scheduledAuctions =
                auctionRepository.countByStatus(
                        AuctionStatus.SCHEDULED
                );

        long activeAuctions =
                auctionRepository.countByStatus(
                        AuctionStatus.ACTIVE
                );

        long endedAuctions =
                auctionRepository.countByStatus(
                        AuctionStatus.ENDED
                );

        long cancelledAuctions =
                auctionRepository.countByStatus(
                        AuctionStatus.CANCELLED
                );

        List<Auction> recentAuctionEntities =
                auctionRepository
                        .findAllByOrderByCreatedAtDesc(
                                Limit.of(5)
                        );

        List<UUID> auctionIds =
                recentAuctionEntities
                        .stream()
                        .map(Auction::getId)
                        .toList();

        Map<UUID, String> primaryImageUrls;

        if (auctionIds.isEmpty()) {
            primaryImageUrls = Map.of();
        } else {
            primaryImageUrls =
                    imageRepository
                            .findByAuctionIdInAndPrimaryImageTrue(
                                    auctionIds
                            )
                            .stream()
                            .collect(
                                    Collectors.toMap(
                                            image ->
                                                    image.getAuction()
                                                            .getId(),
                                            image ->
                                                    "/api/auction-images/"
                                                            + image.getId()
                                    )
                            );
        }

        List<AuctionSummaryResponse> recentAuctions =
                recentAuctionEntities
                        .stream()
                        .map(auction ->
                                AuctionMapper.toSummary(
                                        auction,
                                        primaryImageUrls.get(
                                                auction.getId()
                                        )
                                )
                        )
                        .toList();

        return new AdminDashboardResponse(
                totalAuctions,
                scheduledAuctions,
                activeAuctions,
                endedAuctions,
                cancelledAuctions,
                recentAuctions
        );
    }
}