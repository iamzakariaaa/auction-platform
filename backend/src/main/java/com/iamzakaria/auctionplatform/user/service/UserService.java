package com.iamzakaria.auctionplatform.user.service;

import com.iamzakaria.auctionplatform.user.dto.UserResponse;
import com.iamzakaria.auctionplatform.user.exception.UserNotFoundException;
import com.iamzakaria.auctionplatform.user.mapper.UserMapper;
import com.iamzakaria.auctionplatform.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public UserResponse getById(UUID userId) {
        return userRepository.findById(userId)
                .map(UserMapper::toResponse)
                .orElseThrow(() -> new UserNotFoundException(userId));
    }
}
