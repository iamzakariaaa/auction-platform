package com.iamzakaria.auctionplatform.user.dto;

import com.iamzakaria.auctionplatform.user.entity.Role;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Role role,
        boolean enabled
) {
}
