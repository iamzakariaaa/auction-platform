package com.iamzakaria.auctionplatform.auction.controller;

import com.iamzakaria.auctionplatform.auction.dto.WonAuctionResponse;
import com.iamzakaria.auctionplatform.auction.service.AuctionQueryService;
import com.iamzakaria.auctionplatform.security.SecurityUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class CustomerAuctionController {

    private final AuctionQueryService auctionQueryService;

    public CustomerAuctionController(
            AuctionQueryService auctionQueryService
    ) {
        this.auctionQueryService = auctionQueryService;
    }

    @GetMapping("/won-auctions")
    public Page<WonAuctionResponse> getWonAuctions(
            Authentication authentication,

            @PageableDefault(
                    size = 20,
                    sort = "endTime",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        SecurityUser securityUser =
                getSecurityUser(authentication);

        return auctionQueryService.getWonAuctions(
                securityUser.getId(),
                pageable
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