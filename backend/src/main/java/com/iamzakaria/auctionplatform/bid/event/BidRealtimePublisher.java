package com.iamzakaria.auctionplatform.bid.event;

import com.iamzakaria.auctionplatform.bid.dto.BidPlacedMessage;
import com.iamzakaria.auctionplatform.bid.entity.Bid;
import com.iamzakaria.auctionplatform.bid.repository.BidRepository;
import jakarta.transaction.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class BidRealtimePublisher {

    private final BidRepository bidRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public BidRealtimePublisher(
            BidRepository bidRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.bidRepository = bidRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    @TransactionalEventListener(
            phase = TransactionPhase.AFTER_COMMIT
    )
    public void handleBidPlaced(BidPlacedEvent event) {
        Bid bid = bidRepository
                .findById(event.bidId())
                .orElse(null);

        if (bid == null) {
            return;
        }

        long bidCount = bidRepository.countByAuctionId(
                bid.getAuction().getId()
        );

        BidPlacedMessage message =
                new BidPlacedMessage(
                        bid.getId(),
                        bid.getAuction().getId(),
                        bid.getAmount(),
                        maskBidderName(bid),
                        bidCount,
                        bid.getCreatedAt()
                );

        messagingTemplate.convertAndSend(
                "/topic/auctions/"
                        + bid.getAuction().getId()
                        + "/bids",
                message
        );
    }

    private String maskBidderName(Bid bid) {
        return maskNamePart(
                bid.getBidder().getFirstName()
        ) + " " + maskNamePart(
                bid.getBidder().getLastName()
        );
    }

    private String maskNamePart(String value) {
        if (value == null || value.isBlank()) {
            return "***";
        }

        return value.substring(0, 1).toUpperCase()
                + "***";
    }
}