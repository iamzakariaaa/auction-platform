CREATE TABLE auction_images
(
    id                UUID PRIMARY KEY,
    auction_id        UUID         NOT NULL,
    storage_key       VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type      VARCHAR(100) NOT NULL,
    file_size         BIGINT       NOT NULL,
    display_order     INTEGER      NOT NULL DEFAULT 0,
    primary_image     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ  NOT NULL,

    CONSTRAINT fk_auction_images_auction
        FOREIGN KEY (auction_id)
            REFERENCES auctions (id)
            ON DELETE CASCADE,

    CONSTRAINT uk_auction_images_storage_key
        UNIQUE (storage_key),

    CONSTRAINT chk_auction_images_file_size
        CHECK (file_size > 0),

    CONSTRAINT chk_auction_images_display_order
        CHECK (display_order >= 0)
);

CREATE INDEX idx_auction_images_auction
    ON auction_images (auction_id);

CREATE INDEX idx_auction_images_auction_order
    ON auction_images (
                       auction_id,
                       display_order
        );

CREATE UNIQUE INDEX uk_auction_images_primary
    ON auction_images (auction_id)
    WHERE primary_image = TRUE;