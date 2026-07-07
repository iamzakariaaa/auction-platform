package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.dto.AdminDashboardResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.mapper.AuctionMapper;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminDashboardService {

    private final AuctionRepository auctionRepository;

    public AdminDashboardService(
            AuctionRepository auctionRepository
    ) {
        this.auctionRepository = auctionRepository;
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

        List<AuctionResponse> recentAuctions =
                auctionRepository
                        .findAllByOrderByCreatedAtDesc(
                                Limit.of(5)
                        )
                        .stream()
                        .map(AuctionMapper::toResponse)
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