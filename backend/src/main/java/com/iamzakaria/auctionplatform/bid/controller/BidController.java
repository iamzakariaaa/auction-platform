package com.iamzakaria.auctionplatform.bid.controller;

import com.iamzakaria.auctionplatform.bid.dto.BidResponse;
import com.iamzakaria.auctionplatform.bid.dto.PlaceBidRequest;
import com.iamzakaria.auctionplatform.bid.service.BidService;
import com.iamzakaria.auctionplatform.security.SecurityUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @PostMapping("/auctions/{auctionId}/bids")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable UUID auctionId,
            @Valid @RequestBody PlaceBidRequest request,
            Authentication authentication
    ) {
        SecurityUser securityUser = getSecurityUser(authentication);

        BidResponse response = bidService.placeBid(
                auctionId,
                securityUser.getId(),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/auctions/{auctionId}/bids")
    public ResponseEntity<List<BidResponse>> getAuctionBids(
            @PathVariable UUID auctionId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(
                bidService.getAuctionBids(auctionId, limit)
        );
    }

    @GetMapping("/users/me/bids")
    public ResponseEntity<List<BidResponse>> getMyBids(
            @RequestParam(defaultValue = "20") int limit,
            Authentication authentication
    ) {
        SecurityUser securityUser = getSecurityUser(authentication);

        return ResponseEntity.ok(
                bidService.getUserBids(
                        securityUser.getId(),
                        limit
                )
        );
    }

    private SecurityUser getSecurityUser(
            Authentication authentication
    ) {
        Object principal = authentication.getPrincipal();

        if (!(principal instanceof SecurityUser securityUser)) {
            throw new IllegalStateException(
                    "Authenticated principal has an unexpected type."
            );
        }

        return securityUser;
    }
}