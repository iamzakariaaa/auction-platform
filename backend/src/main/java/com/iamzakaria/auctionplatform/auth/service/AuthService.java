package com.iamzakaria.auctionplatform.auth.service;

import com.iamzakaria.auctionplatform.auth.dto.LoginRequest;
import com.iamzakaria.auctionplatform.auth.dto.LoginResponse;
import com.iamzakaria.auctionplatform.auth.dto.RegisterRequest;
import com.iamzakaria.auctionplatform.security.SecurityUser;
import com.iamzakaria.auctionplatform.user.dto.UserResponse;
import com.iamzakaria.auctionplatform.user.entity.Role;
import com.iamzakaria.auctionplatform.user.entity.User;
import com.iamzakaria.auctionplatform.user.exception.EmailAlreadyExistsException;
import com.iamzakaria.auctionplatform.user.exception.UserNotFoundException;
import com.iamzakaria.auctionplatform.user.mapper.UserMapper;
import com.iamzakaria.auctionplatform.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final Clock clock;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.clock = clock;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String normalizedEmail =
                normalizeEmail(request.email());

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException(
                    normalizedEmail
            );
        }

        Instant now = Instant.now(clock);

        User user = new User();
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        user.setRole(Role.CUSTOMER);
        user.setEnabled(true);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User savedUser = userRepository.save(user);

        return UserMapper.toResponse(savedUser);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String normalizedEmail =
                normalizeEmail(request.email());

        Authentication authentication =
                authenticationManager.authenticate(
                        UsernamePasswordAuthenticationToken
                                .unauthenticated(
                                        normalizedEmail,
                                        request.password()
                                )
                );

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof SecurityUser securityUser)) {
            throw new IllegalStateException(
                    "Authenticated principal has an unexpected type."
            );
        }

        User user = userRepository
                .findById(securityUser.getId())
                .orElseThrow(
                        () -> new UserNotFoundException(
                                securityUser.getId()
                        )
                );

        return new LoginResponse(
                "Login successful.",
                UserMapper.toResponse(user)
        );
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}