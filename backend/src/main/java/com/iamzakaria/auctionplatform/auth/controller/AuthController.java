package com.iamzakaria.auctionplatform.auth.controller;


import com.iamzakaria.auctionplatform.auth.dto.LoginRequest;
import com.iamzakaria.auctionplatform.auth.dto.LoginResponse;
import com.iamzakaria.auctionplatform.auth.dto.RegisterRequest;
import com.iamzakaria.auctionplatform.auth.service.AuthService;
import com.iamzakaria.auctionplatform.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.iamzakaria.auctionplatform.security.SecurityUser;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        UserResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication
    ) {
        Object principal = authentication.getPrincipal();

        if (!(principal instanceof SecurityUser securityUser)) {
            throw new IllegalStateException(
                    "Authenticated principal has an unexpected type."
            );
        }

        return ResponseEntity.ok(
                authService.getCurrentUser(securityUser.getId())
        );
    }
}
