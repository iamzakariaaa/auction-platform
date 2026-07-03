CREATE TABLE application_info (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO application_info (name)
VALUES ('Auction Platform');