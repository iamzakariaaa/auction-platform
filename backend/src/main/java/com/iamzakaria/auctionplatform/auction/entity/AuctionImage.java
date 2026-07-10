package com.iamzakaria.auctionplatform.auction.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(
        name = "auction_images",
        indexes = {
                @Index(
                        name = "idx_auction_images_auction",
                        columnList = "auction_id"
                ),
                @Index(
                        name = "idx_auction_images_auction_order",
                        columnList =
                                "auction_id, display_order"
                )
        }
)
public class AuctionImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "auction_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name =
                            "fk_auction_images_auction"
            )
    )
    private Auction auction;

    @Column(
            name = "storage_key",
            nullable = false,
            unique = true,
            length = 500
    )
    private String storageKey;

    @Column(
            name = "original_filename",
            nullable = false,
            length = 255
    )
    private String originalFilename;

    @Column(
            name = "content_type",
            nullable = false,
            length = 100
    )
    private String contentType;

    @Column(
            name = "file_size",
            nullable = false
    )
    private long fileSize;

    @Column(
            name = "display_order",
            nullable = false
    )
    private int displayOrder;

    @Column(
            name = "primary_image",
            nullable = false
    )
    private boolean primaryImage;

    @Column(
            name = "created_at",
            nullable = false
    )
    private Instant createdAt;
}