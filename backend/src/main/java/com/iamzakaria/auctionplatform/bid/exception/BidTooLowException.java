package com.iamzakaria.auctionplatform.bid.exception;

import java.math.BigDecimal;

public class BidTooLowException extends RuntimeException {

    public BidTooLowException(
            BigDecimal submittedAmount,
            BigDecimal minimumAmount
    ) {
        super(
                "Bid amount "
                        + submittedAmount
                        + " must be at least "
                        + minimumAmount
                        + "."
        );
    }
}
