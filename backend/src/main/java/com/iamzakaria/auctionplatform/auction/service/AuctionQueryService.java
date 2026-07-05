package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionSummaryResponse;
import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotFoundException;
import com.iamzakaria.auctionplatform.auction.mapper.AuctionMapper;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import com.iamzakaria.auctionplatform.bid.repository.BidRepository;
import com.iamzakaria.auctionplatform.auction.dto.AuctionDetailsResponse;
import com.iamzakaria.auctionplatform.bid.entity.Bid;
import com.iamzakaria.auctionplatform.bid.repository.AuctionBidSummary;
import com.iamzakaria.auctionplatform.bid.repository.BidRepository;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.UUID;

@Service
public class AuctionQueryService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final Clock clock;

    public AuctionQueryService(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            Clock clock
    ) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public AuctionResponse getById(UUID auctionId) {
        return auctionRepository.findById(auctionId)
                .map(AuctionMapper::toResponse)
                .orElseThrow(
                        () -> new AuctionNotFoundException(auctionId)
                );
    }

    @Transactional(readOnly = true)
    public Page<AuctionSummaryResponse> getAll(
            Pageable pageable
    ) {
        return auctionRepository.findAll(pageable)
                .map(AuctionMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<AuctionSummaryResponse> getByStatus(
            AuctionStatus status,
            Pageable pageable
    ) {
        return auctionRepository
                .findByStatus(status, pageable)
                .map(AuctionMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public AuctionDetailsResponse getAuctionDetails(
            UUID auctionId
    ) {
        Auction auction = auctionRepository
                .findById(auctionId)
                .orElseThrow(
                        () -> new AuctionNotFoundException(auctionId)
                );

        AuctionBidSummary bidSummary =
                bidRepository.getAuctionBidSummary(auctionId);

        Bid highestBid = bidRepository
                .findTopByAuctionIdOrderByAmountDescCreatedAtAsc(
                        auctionId
                )
                .orElse(null);

        BigDecimal highestBidAmount =
                highestBid == null
                        ? null
                        : highestBid.getAmount();

        String leadingBidderName =
                highestBid == null
                        ? null
                        : maskBidderName(highestBid);

        long timeRemainingSeconds =
                calculateTimeRemainingSeconds(auction);

        return new AuctionDetailsResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getDescription(),
                auction.getStartingPrice(),
                auction.getCurrentPrice(),
                auction.getMinimumBidIncrement(),
                auction.getStatus(),
                auction.getStartTime(),
                auction.getEndTime(),
                auction.getCreatedAt(),
                auction.getUpdatedAt(),
                bidSummary.getBidCount(),
                highestBidAmount,
                leadingBidderName,
                timeRemainingSeconds
        );
    }

    private long calculateTimeRemainingSeconds(
            Auction auction
    ) {
        Instant now = Instant.now(clock);

        if (!now.isBefore(auction.getEndTime())) {
            return 0;
        }

        return Duration.between(
                now,
                auction.getEndTime()
        ).getSeconds();
    }

    private String maskBidderName(Bid bid) {
        String firstName = bid.getBidder().getFirstName();
        String lastName = bid.getBidder().getLastName();

        return maskNamePart(firstName)
                + " "
                + maskNamePart(lastName);
    }

    private String maskNamePart(String value) {
        if (value == null || value.isBlank()) {
            return "***";
        }

        return value.substring(0, 1).toUpperCase()
                + "***";
    }
}
