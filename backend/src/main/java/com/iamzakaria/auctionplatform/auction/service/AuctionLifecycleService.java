package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import com.iamzakaria.auctionplatform.bid.entity.Bid;
import com.iamzakaria.auctionplatform.bid.repository.BidRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@Service
public class AuctionLifecycleService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final Clock clock;

    public AuctionLifecycleService(
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            Clock clock
    ) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.clock = clock;
    }

    @Scheduled(
            fixedDelayString =
                    "${auction.lifecycle.interval:30000}"
    )
    @Transactional
    public void updateAuctionStatuses() {
        Instant now = Instant.now(clock);

        endExpiredAuctions(now);
        activateScheduledAuctions(now);
    }

    private void endExpiredAuctions(Instant now) {
        List<Auction> expiredAuctions =
                auctionRepository.findExpiredAuctionsForUpdate(
                        List.of(
                                AuctionStatus.SCHEDULED,
                                AuctionStatus.ACTIVE
                        ),
                        now
                );

        for (Auction auction : expiredAuctions) {
            Bid winningBid = bidRepository
                    .findTopByAuctionIdOrderByAmountDescCreatedAtAsc(
                            auction.getId()
                    )
                    .orElse(null);

            auction.setStatus(AuctionStatus.ENDED);
            auction.setUpdatedAt(now);

            if (winningBid != null) {
                auction.setWinningBid(winningBid);
                auction.setWinner(winningBid.getBidder());
                auction.setCurrentPrice(winningBid.getAmount());
            } else {
                auction.setWinningBid(null);
                auction.setWinner(null);
            }
        }
    }

    private void activateScheduledAuctions(Instant now) {
        auctionRepository.activateScheduledAuctions(
                AuctionStatus.SCHEDULED,
                AuctionStatus.ACTIVE,
                now
        );
    }
}