package com.iamzakaria.auctionplatform.bid.service;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotFoundException;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import com.iamzakaria.auctionplatform.bid.dto.BidResponse;
import com.iamzakaria.auctionplatform.bid.dto.PlaceBidRequest;
import com.iamzakaria.auctionplatform.bid.dto.UserBidResponse;
import com.iamzakaria.auctionplatform.bid.entity.Bid;
import com.iamzakaria.auctionplatform.bid.event.BidPlacedEvent;
import com.iamzakaria.auctionplatform.bid.exception.AuctionNotActiveException;
import com.iamzakaria.auctionplatform.bid.exception.BidTooLowException;
import com.iamzakaria.auctionplatform.bid.exception.SelfOutbidException;
import com.iamzakaria.auctionplatform.bid.mapper.BidMapper;
import com.iamzakaria.auctionplatform.bid.repository.BidRepository;
import com.iamzakaria.auctionplatform.user.entity.User;
import com.iamzakaria.auctionplatform.user.exception.UserNotFoundException;
import com.iamzakaria.auctionplatform.user.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final AuctionRepository auctionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserRepository userRepository;
    private final Clock clock;

    public BidService(
            BidRepository bidRepository,
            AuctionRepository auctionRepository,
            UserRepository userRepository,
            Clock clock,
            ApplicationEventPublisher eventPublisher
    ) {
        this.bidRepository = bidRepository;
        this.auctionRepository = auctionRepository;
        this.userRepository = userRepository;
        this.clock = clock;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public BidResponse placeBid(
            UUID auctionId,
            UUID bidderId,
            PlaceBidRequest request
    ) {
        Auction auction = auctionRepository
                .findByIdForUpdate(auctionId)
                .orElseThrow(
                        () -> new AuctionNotFoundException(auctionId)
                );

        User bidder = userRepository
                .findById(bidderId)
                .orElseThrow(
                        () -> new UserNotFoundException(bidderId)
                );

        Instant now = Instant.now(clock);

        validateAuctionIsActive(auction, now);

        Bid highestBid = bidRepository
                .findTopByAuctionIdOrderByAmountDescCreatedAtAsc(auctionId)
                .orElse(null);

        if (highestBid != null
                && highestBid.getBidder()
                .getId()
                .equals(bidderId)) {
            throw new SelfOutbidException();
        }

        BigDecimal minimumBid =
                calculateMinimumBid(auction, highestBid);

        if (request.amount().compareTo(minimumBid) < 0) {
            throw new BidTooLowException(
                    request.amount(),
                    minimumBid
            );
        }

        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setAmount(request.amount());
        bid.setCreatedAt(now);

        auction.setCurrentPrice(request.amount());
        auction.setUpdatedAt(now);

        Bid savedBid = bidRepository.save(bid);

        eventPublisher.publishEvent(
                new BidPlacedEvent(savedBid.getId())
        );

        return BidMapper.toResponse(savedBid);
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getAuctionBids(
            UUID auctionId,
            int limit
    ) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new AuctionNotFoundException(auctionId);
        }

        int safeLimit = normalizeLimit(limit);

        return bidRepository
                .findByAuctionIdOrderByAmountDescCreatedAtAsc(
                        auctionId,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(BidMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserBidResponse> getUserBids(
            UUID bidderId,
            int limit
    ) {
        if (!userRepository.existsById(bidderId)) {
            throw new UserNotFoundException(bidderId);
        }

        int safeLimit = normalizeLimit(limit);

        return bidRepository
                .findUserBidsWithAuction(
                        bidderId,
                        PageRequest.of(0, safeLimit)
                )
                .stream()
                .map(BidMapper::toUserBidResponse)
                .toList();
    }

    private void validateAuctionIsActive(
            Auction auction,
            Instant now
    ) {
        boolean hasActiveStatus =
                auction.getStatus() == AuctionStatus.ACTIVE;

        boolean hasStarted =
                !now.isBefore(auction.getStartTime());

        boolean hasNotEnded =
                now.isBefore(auction.getEndTime());

        if (!hasActiveStatus || !hasStarted || !hasNotEnded) {
            throw new AuctionNotActiveException(
                    auction.getId()
            );
        }
    }

    private BigDecimal calculateMinimumBid(
            Auction auction,
            Bid highestBid
    ) {
        if (highestBid == null) {
            return auction.getStartingPrice();
        }

        return auction
                .getCurrentPrice()
                .add(auction.getMinimumBidIncrement());
    }

    private int normalizeLimit(int limit) {
        return Math.clamp(limit, 1,
                100
        );
    }
}