package com.iamzakaria.auctionplatform.auction.controller;

import com.iamzakaria.auctionplatform.auction.entity.AuctionImage;
import com.iamzakaria.auctionplatform.auction.exception.AuctionImageNotFoundException;
import com.iamzakaria.auctionplatform.auction.repository.AuctionImageRepository;
import com.iamzakaria.auctionplatform.auction.storage.AuctionImageStorage;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/auction-images")
public class PublicAuctionImageController {

    private final AuctionImageRepository imageRepository;
    private final AuctionImageStorage imageStorage;

    public PublicAuctionImageController(
            AuctionImageRepository imageRepository,
            AuctionImageStorage imageStorage
    ) {
        this.imageRepository = imageRepository;
        this.imageStorage = imageStorage;
    }

    @GetMapping("/{imageId}")
    public ResponseEntity<Resource> getImage(
            @PathVariable UUID imageId
    ) {
        AuctionImage image =
                imageRepository
                        .findById(imageId)
                        .orElseThrow(
                                () ->
                                        new AuctionImageNotFoundException(
                                                imageId
                                        )
                        );

        Path imagePath =
                imageStorage.resolve(
                        image.getStorageKey()
                );

        try {
            Resource resource =
                    new UrlResource(
                            imagePath.toUri()
                    );

            if (
                    !resource.exists()
                            || !resource.isReadable()
            ) {
                throw new AuctionImageNotFoundException(
                        imageId
                );
            }

            MediaType mediaType =
                    MediaType.parseMediaType(
                            image.getContentType()
                    );

            return ResponseEntity
                    .ok()
                    .contentType(mediaType)
                    .cacheControl(
                            CacheControl
                                    .maxAge(
                                            java.time.Duration
                                                    .ofDays(30)
                                    )
                                    .cachePublic()
                    )
                    .body(resource);
        } catch (
                MalformedURLException exception
        ) {
            throw new AuctionImageNotFoundException(
                    imageId
            );
        }
    }
}