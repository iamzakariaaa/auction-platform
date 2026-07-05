package com.iamzakaria.auctionplatform.auction.entity;

import com.iamzakaria.auctionplatform.bid.entity.Bid;
import com.iamzakaria.auctionplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Entity
@Table(
        name = "auctions",
        indexes = {
                @Index(
                        name = "idx_auctions_status",
                        columnList = "status"
                ),
                @Index(
                        name = "idx_auctions_status_end_time",
                        columnList = "status, end_time"
                )
        }
)
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 5000)
    private String description;

    @Column(
            name = "starting_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal startingPrice;

    @Column(
            name = "current_price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal currentPrice;

    @Column(
            name = "minimum_bid_increment",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal minimumBidIncrement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuctionStatus status;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(name = "end_time", nullable = false)
    private Instant endTime;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "winning_bid_id",
            foreignKey = @ForeignKey(
                    name = "fk_auctions_winning_bid"
            )
    )
    private Bid winningBid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "winner_id",
            foreignKey = @ForeignKey(
                    name = "fk_auctions_winner"
            )
    )
    private User winner;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Version
    private Long version;

}
