CREATE TABLE bids (
    id UUID PRIMARY KEY,
    auction_id UUID NOT NULL,
    bidder_id UUID NOT NULL,
    amount NUMERIC(19, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

        CONSTRAINT fk_bids_auction
            FOREIGN KEY (auction_id)
                REFERENCES auctions(id),

        CONSTRAINT fk_bids_bidder
            FOREIGN KEY (bidder_id)
                REFERENCES users(id),

        CONSTRAINT chk_bids_amount_positive
            CHECK (amount > 0)
);

CREATE INDEX idx_bids_auction
    ON bids(auction_id);

CREATE INDEX idx_bids_bidder
    ON bids(bidder_id);

CREATE INDEX idx_bids_auction_amount
    ON bids(auction_id, amount DESC);

CREATE INDEX idx_bids_auction_created_at
    ON bids(auction_id, created_at DESC);