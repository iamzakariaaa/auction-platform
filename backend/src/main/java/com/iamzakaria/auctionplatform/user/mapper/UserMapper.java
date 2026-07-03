package com.iamzakaria.auctionplatform.user.mapper;

import com.iamzakaria.auctionplatform.user.dto.UserResponse;
import com.iamzakaria.auctionplatform.user.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled()
        );
    }
}
