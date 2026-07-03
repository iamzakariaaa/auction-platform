package com.iamzakaria.auctionplatform.auction.controller;

import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.dto.CreateAuctionRequest;
import com.iamzakaria.auctionplatform.auction.dto.UpdateAuctionRequest;
import com.iamzakaria.auctionplatform.auction.service.AuctionCommandService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/auctions")
public class AdminAuctionController {

    private final AuctionCommandService commandService;

    public AdminAuctionController(
            AuctionCommandService commandService
    ) {
        this.commandService = commandService;
    }

    @PostMapping
    public ResponseEntity<AuctionResponse> create(
            @Valid @RequestBody CreateAuctionRequest request
    ) {
        AuctionResponse response = commandService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{auctionId}")
    public AuctionResponse update(
            @PathVariable UUID auctionId,
            @Valid @RequestBody UpdateAuctionRequest request
    ) {
        return commandService.update(auctionId, request);
    }

    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID auctionId
    ) {
        commandService.delete(auctionId);
        return ResponseEntity.noContent().build();
    }
}
