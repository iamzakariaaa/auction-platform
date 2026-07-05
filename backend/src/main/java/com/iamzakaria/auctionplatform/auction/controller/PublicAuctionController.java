package com.iamzakaria.auctionplatform.auction.controller;

import com.iamzakaria.auctionplatform.auction.dto.AuctionDetailsResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionSummaryResponse;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.service.AuctionQueryService;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auctions")
public class PublicAuctionController {

    private final AuctionQueryService queryService;

    public PublicAuctionController(
            AuctionQueryService queryService
    ) {
        this.queryService = queryService;
    }

    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionDetailsResponse> getAuctionDetails(
            @PathVariable UUID auctionId
    ) {
        return ResponseEntity.ok(
                queryService.getAuctionDetails(auctionId)
        );
    }
    @GetMapping
    public Page<AuctionSummaryResponse> getAll(
            @RequestParam(required = false)
            AuctionStatus status,

            @PageableDefault(
                    size = 20,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            )
            Pageable pageable
    ) {
        if (status == null) {
            return queryService.getAll(pageable);
        }

        return queryService.getByStatus(status, pageable);
    }
}
