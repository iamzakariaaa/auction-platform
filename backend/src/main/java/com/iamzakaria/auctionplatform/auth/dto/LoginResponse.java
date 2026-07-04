package com.iamzakaria.auctionplatform.auth.dto;

import com.iamzakaria.auctionplatform.user.dto.UserResponse;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}
