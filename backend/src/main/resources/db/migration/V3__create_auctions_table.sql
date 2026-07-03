CREATE TABLE auctions
(
    id                    UUID PRIMARY KEY,
    title                 VARCHAR(200) NOT NULL,
    description           VARCHAR(5000) NOT NULL,
    starting_price        NUMERIC(12, 2) NOT NULL,
    current_price         NUMERIC(12, 2) NOT NULL,
    minimum_bid_increment NUMERIC(12, 2) NOT NULL,
    status                VARCHAR(20) NOT NULL,
    start_time             TIMESTAMPTZ NOT NULL,
    end_time               TIMESTAMPTZ NOT NULL,
    created_at             TIMESTAMPTZ NOT NULL,
    updated_at             TIMESTAMPTZ,
    version                BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT chk_auctions_starting_price
        CHECK (starting_price > 0),

    CONSTRAINT chk_auctions_current_price
        CHECK (current_price > 0),

    CONSTRAINT chk_auctions_minimum_increment
        CHECK (minimum_bid_increment > 0),

    CONSTRAINT chk_auctions_schedule
        CHECK (end_time > start_time),

    CONSTRAINT chk_auctions_status
        CHECK (
            status IN (
                       'DRAFT',
                       'SCHEDULED',
                       'ACTIVE',
                       'ENDED',
                       'CANCELLED'
                )
            )
);

CREATE INDEX idx_auctions_status
    ON auctions(status);

CREATE INDEX idx_auctions_status_end_time
    ON auctions(status, end_time);