package com.iamzakaria.auctionplatform.auction.controller;

import com.iamzakaria.auctionplatform.auction.dto.AuctionImageResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.dto.CreateAuctionRequest;
import com.iamzakaria.auctionplatform.auction.dto.UpdateAuctionRequest;
import com.iamzakaria.auctionplatform.auction.service.AuctionCommandService;
import com.iamzakaria.auctionplatform.auction.service.AuctionImageService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/auctions")
public class AdminAuctionController {

    private final AuctionCommandService commandService;
    private final AuctionImageService imageService;

    public AdminAuctionController(
            AuctionCommandService commandService,
            AuctionImageService imageService
    ) {
        this.commandService = commandService;
        this.imageService = imageService;
    }

    @PostMapping
    public ResponseEntity<AuctionResponse> create(
            @Valid
            @RequestBody
            CreateAuctionRequest request
    ) {
        AuctionResponse response =
                commandService.create(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{auctionId}")
    public AuctionResponse update(
            @PathVariable UUID auctionId,
            @Valid
            @RequestBody
            UpdateAuctionRequest request
    ) {
        return commandService.update(
                auctionId,
                request
        );
    }

    @PatchMapping("/{auctionId}/cancel")
    public AuctionResponse cancel(
            @PathVariable UUID auctionId
    ) {
        return commandService.cancel(
                auctionId
        );
    }

    @PostMapping(
            path = "/{auctionId}/images",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<AuctionImageResponse>
    uploadImage(
            @PathVariable UUID auctionId,

            @RequestPart("file")
            MultipartFile file
    ) {
        AuctionImageResponse response =
                imageService.upload(
                        auctionId,
                        file
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{auctionId}/images")
    public List<AuctionImageResponse> getImages(
            @PathVariable UUID auctionId
    ) {
        return imageService
                .getAuctionImages(
                        auctionId
                );
    }

    @PatchMapping(
            "/{auctionId}/images/{imageId}/primary"
    )
    public AuctionImageResponse setPrimaryImage(
            @PathVariable UUID auctionId,
            @PathVariable UUID imageId
    ) {
        return imageService.setPrimary(
                auctionId,
                imageId
        );
    }

    @DeleteMapping(
            "/{auctionId}/images/{imageId}"
    )
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID auctionId,
            @PathVariable UUID imageId
    ) {
        imageService.delete(
                auctionId,
                imageId
        );

        return ResponseEntity
                .noContent()
                .build();
    }

    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID auctionId
    ) {
        commandService.delete(auctionId);

        return ResponseEntity
                .noContent()
                .build();
    }
}