package com.iamzakaria.auctionplatform.bid.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PlaceBidRequest(

        @NotNull(message = "Bid amount is required.")
        @DecimalMin(
                value = "0.01",
                message = "Bid amount must be greater than zero."
        )
        BigDecimal amount
) {
}
