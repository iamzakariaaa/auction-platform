package com.iamzakaria.auctionplatform.bid.entity;

import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bids")
@Getter
@Setter
@NoArgsConstructor
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "auction_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_bids_auction")
    )
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "bidder_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_bids_bidder")
    )
    private User bidder;

    @Column(
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal amount;

    @Column(
            name = "created_at",
            nullable = false
    )
    private Instant createdAt;
}
