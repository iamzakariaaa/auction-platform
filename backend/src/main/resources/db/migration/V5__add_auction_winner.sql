ALTER TABLE auctions
    ADD COLUMN winning_bid_id UUID,
    ADD COLUMN winner_id UUID;

ALTER TABLE auctions
    ADD CONSTRAINT fk_auctions_winning_bid
        FOREIGN KEY (winning_bid_id)
            REFERENCES bids(id);

ALTER TABLE auctions
    ADD CONSTRAINT fk_auctions_winner
        FOREIGN KEY (winner_id)
            REFERENCES users(id);

CREATE INDEX idx_auctions_winner
    ON auctions(winner_id);