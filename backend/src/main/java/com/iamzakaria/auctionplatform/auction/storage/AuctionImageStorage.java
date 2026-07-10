package com.iamzakaria.auctionplatform.auction.storage;

import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.UUID;

public interface AuctionImageStorage {

    StoredAuctionImage store(
            UUID auctionId,
            MultipartFile file
    );

    Path resolve(String storageKey);

    void delete(String storageKey);
}