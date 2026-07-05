package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Service
public class AuctionLifecycleService {

    private final AuctionRepository auctionRepository;
    private final Clock clock;

    public AuctionLifecycleService(
            AuctionRepository auctionRepository,
            Clock clock
    ) {
        this.auctionRepository = auctionRepository;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${auction.lifecycle.interval:30000}")
    @Transactional
    public void updateAuctionStatuses() {
        Instant now = Instant.now(clock);

        auctionRepository.endExpiredAuctions(
                List.of(
                        AuctionStatus.SCHEDULED,
                        AuctionStatus.ACTIVE
                ),
                AuctionStatus.ENDED,
                now
        );

        auctionRepository.activateScheduledAuctions(
                AuctionStatus.SCHEDULED,
                AuctionStatus.ACTIVE,
                now
        );
    }
}