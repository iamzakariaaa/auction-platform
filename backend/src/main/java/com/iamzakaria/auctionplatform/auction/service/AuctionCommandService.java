package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.dto.CreateAuctionRequest;
import com.iamzakaria.auctionplatform.auction.dto.UpdateAuctionRequest;
import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotEditableException;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotFoundException;
import com.iamzakaria.auctionplatform.auction.exception.InvalidAuctionScheduleException;
import com.iamzakaria.auctionplatform.auction.mapper.AuctionMapper;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
public class AuctionCommandService {

    private final AuctionRepository auctionRepository;
    private final Clock clock;

    public AuctionCommandService(
            AuctionRepository auctionRepository,
            Clock clock
    ) {
        this.auctionRepository = auctionRepository;
        this.clock = clock;
    }

    @Transactional
    public AuctionResponse create(
            CreateAuctionRequest request
    ) {
        validateSchedule(
                request.startTime(),
                request.endTime()
        );

        Instant now = Instant.now(clock);

        Auction auction = new Auction();
        auction.setTitle(request.title().trim());
        auction.setDescription(request.description().trim());
        auction.setStartingPrice(request.startingPrice());
        auction.setCurrentPrice(request.startingPrice());
        auction.setMinimumBidIncrement(
                request.minimumBidIncrement()
        );
        auction.setStatus(
                determineStatus(
                        request.startTime(),
                        request.endTime(),
                        now
                )
        );
        auction.setStartTime(request.startTime());
        auction.setEndTime(request.endTime());
        auction.setCreatedAt(now);
        auction.setUpdatedAt(now);

        Auction savedAuction =
                auctionRepository.save(auction);

        return AuctionMapper.toResponse(savedAuction);
    }

    @Transactional
    public AuctionResponse update(
            UUID auctionId,
            UpdateAuctionRequest request
    ) {
        validateSchedule(
                request.startTime(),
                request.endTime()
        );

        Auction auction = getAuction(auctionId);
        Instant now = Instant.now(clock);

        validateEditable(auction, now);

        auction.setTitle(request.title().trim());
        auction.setDescription(request.description().trim());
        auction.setStartingPrice(request.startingPrice());
        auction.setCurrentPrice(request.startingPrice());
        auction.setMinimumBidIncrement(
                request.minimumBidIncrement()
        );
        auction.setStartTime(request.startTime());
        auction.setEndTime(request.endTime());
        auction.setStatus(
                determineStatus(
                        request.startTime(),
                        request.endTime(),
                        now
                )
        );
        auction.setUpdatedAt(now);

        return AuctionMapper.toResponse(auction);
    }

    @Transactional
    public void delete(UUID auctionId) {
        Auction auction = getAuction(auctionId);
        Instant now = Instant.now(clock);

        validateEditable(auction, now);

        auctionRepository.delete(auction);
    }

    private Auction getAuction(UUID auctionId) {
        return auctionRepository
                .findById(auctionId)
                .orElseThrow(
                        () -> new AuctionNotFoundException(
                                auctionId
                        )
                );
    }

    private AuctionStatus determineStatus(
            Instant startTime,
            Instant endTime,
            Instant now
    ) {
        if (!endTime.isAfter(now)) {
            return AuctionStatus.ENDED;
        }

        if (!startTime.isAfter(now)) {
            return AuctionStatus.ACTIVE;
        }

        return AuctionStatus.SCHEDULED;
    }

    private void validateEditable(
            Auction auction,
            Instant now
    ) {
        boolean draft =
                auction.getStatus() == AuctionStatus.DRAFT;

        boolean scheduledAndNotStarted =
                auction.getStatus() == AuctionStatus.SCHEDULED
                        && now.isBefore(
                        auction.getStartTime()
                );

        if (!draft && !scheduledAndNotStarted) {
            throw new AuctionNotEditableException(
                    auction.getId()
            );
        }
    }

    private void validateSchedule(
            Instant startTime,
            Instant endTime
    ) {
        if (!endTime.isAfter(startTime)) {
            throw new InvalidAuctionScheduleException(
                    "End time must be after start time."
            );
        }
    }
}