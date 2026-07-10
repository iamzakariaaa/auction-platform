package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.dto.AuctionImageResponse;
import com.iamzakaria.auctionplatform.auction.entity.Auction;
import com.iamzakaria.auctionplatform.auction.entity.AuctionImage;
import com.iamzakaria.auctionplatform.auction.exception.AuctionImageLimitException;
import com.iamzakaria.auctionplatform.auction.exception.AuctionImageNotFoundException;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotFoundException;
import com.iamzakaria.auctionplatform.auction.exception.InvalidAuctionImageException;
import com.iamzakaria.auctionplatform.auction.repository.AuctionImageRepository;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import com.iamzakaria.auctionplatform.auction.storage.AuctionImageStorage;
import com.iamzakaria.auctionplatform.auction.storage.StoredAuctionImage;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class AuctionImageService {

    private static final long MAX_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final long MAX_IMAGES =
            8L;

    private static final Set<String>
            ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private final AuctionRepository auctionRepository;
    private final AuctionImageRepository imageRepository;
    private final AuctionImageStorage imageStorage;
    private final Clock clock;

    public AuctionImageService(
            AuctionRepository auctionRepository,
            AuctionImageRepository imageRepository,
            AuctionImageStorage imageStorage,
            Clock clock
    ) {
        this.auctionRepository = auctionRepository;
        this.imageRepository = imageRepository;
        this.imageStorage = imageStorage;
        this.clock = clock;
    }

    @Transactional
    public AuctionImageResponse upload(
            UUID auctionId,
            MultipartFile file
    ) {
        Auction auction = auctionRepository
                .findById(auctionId)
                .orElseThrow(
                        () -> new AuctionNotFoundException(
                                auctionId
                        )
                );

        validateImageLimit(auctionId);
        validateFile(file);

        StoredAuctionImage storedImage =
                imageStorage.store(
                        auctionId,
                        file
                );

        try {
            long existingImageCount =
                    imageRepository
                            .countByAuctionId(
                                    auctionId
                            );

            int displayOrder =
                    imageRepository
                            .findMaximumDisplayOrder(
                                    auctionId
                            )
                            + 1;

            AuctionImage image =
                    new AuctionImage();

            image.setAuction(auction);
            image.setStorageKey(
                    storedImage.storageKey()
            );
            image.setOriginalFilename(
                    sanitizeOriginalFilename(
                            file.getOriginalFilename()
                    )
            );
            image.setContentType(
                    normalizeContentType(
                            file.getContentType()
                    )
            );
            image.setFileSize(file.getSize());
            image.setDisplayOrder(displayOrder);
            image.setPrimaryImage(
                    existingImageCount == 0
            );
            image.setCreatedAt(
                    Instant.now(clock)
            );

            AuctionImage savedImage =
                    imageRepository.save(image);

            return toResponse(savedImage);
        } catch (RuntimeException exception) {
            imageStorage.delete(
                    storedImage.storageKey()
            );

            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public List<AuctionImageResponse>
    getAuctionImages(UUID auctionId) {
        if (!auctionRepository.existsById(auctionId)) {
            throw new AuctionNotFoundException(
                    auctionId
            );
        }

        return imageRepository
                .findByAuctionIdOrderByDisplayOrderAsc(
                        auctionId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void delete(
            UUID auctionId,
            UUID imageId
    ) {
        AuctionImage image = imageRepository
                .findByIdAndAuctionId(
                        imageId,
                        auctionId
                )
                .orElseThrow(
                        () ->
                                new AuctionImageNotFoundException(
                                        imageId
                                )
                );

        boolean deletedPrimary =
                image.isPrimaryImage();

        String storageKey =
                image.getStorageKey();

        imageRepository.delete(image);
        imageRepository.flush();

        imageStorage.delete(storageKey);

        if (deletedPrimary) {
            assignFirstImageAsPrimary(
                    auctionId
            );
        }
    }

    @Transactional
    public AuctionImageResponse setPrimary(
            UUID auctionId,
            UUID imageId
    ) {
        AuctionImage selectedImage =
                imageRepository
                        .findByIdAndAuctionId(
                                imageId,
                                auctionId
                        )
                        .orElseThrow(
                                () ->
                                        new AuctionImageNotFoundException(
                                                imageId
                                        )
                        );

        imageRepository
                .findByAuctionIdAndPrimaryImageTrue(
                        auctionId
                )
                .ifPresent(currentPrimary -> {
                    if (
                            !currentPrimary
                                    .getId()
                                    .equals(imageId)
                    ) {
                        currentPrimary
                                .setPrimaryImage(
                                        false
                                );

                        imageRepository.flush();
                    }
                });

        selectedImage.setPrimaryImage(true);

        return toResponse(selectedImage);
    }

    private void validateImageLimit(
            UUID auctionId
    ) {
        long currentCount =
                imageRepository
                        .countByAuctionId(
                                auctionId
                        );

        if (currentCount >= MAX_IMAGES) {
            throw new AuctionImageLimitException();
        }
    }

    private void validateFile(
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAuctionImageException(
                    "Please select an image to upload."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidAuctionImageException(
                    "The image cannot be larger than 5 MB."
            );
        }

        String contentType =
                normalizeContentType(
                        file.getContentType()
                );

        if (
                !ALLOWED_CONTENT_TYPES.contains(
                        contentType
                )
        ) {
            throw new InvalidAuctionImageException(
                    "Only JPEG, PNG, and WebP images are allowed."
            );
        }

        validateImageSignature(
                file,
                contentType
        );
    }

    private void validateImageSignature(
            MultipartFile file,
            String contentType
    ) {
        byte[] header = new byte[12];

        try (
                InputStream inputStream =
                        file.getInputStream()
        ) {
            int bytesRead =
                    inputStream.read(header);

            if (bytesRead < 12) {
                throw new InvalidAuctionImageException(
                        "The uploaded image is invalid."
                );
            }
        } catch (IOException exception) {
            throw new InvalidAuctionImageException(
                    "Unable to read the uploaded image."
            );
        }

        boolean valid = switch (contentType) {
            case "image/jpeg" ->
                    isJpeg(header);

            case "image/png" ->
                    isPng(header);

            case "image/webp" ->
                    isWebp(header);

            default -> false;
        };

        if (!valid) {
            throw new InvalidAuctionImageException(
                    "The uploaded file does not match its declared image type."
            );
        }
    }

    private boolean isJpeg(byte[] header) {
        return unsigned(header[0]) == 0xFF
                && unsigned(header[1]) == 0xD8
                && unsigned(header[2]) == 0xFF;
    }

    private boolean isPng(byte[] header) {
        return unsigned(header[0]) == 0x89
                && unsigned(header[1]) == 0x50
                && unsigned(header[2]) == 0x4E
                && unsigned(header[3]) == 0x47
                && unsigned(header[4]) == 0x0D
                && unsigned(header[5]) == 0x0A
                && unsigned(header[6]) == 0x1A
                && unsigned(header[7]) == 0x0A;
    }

    private boolean isWebp(byte[] header) {
        return header[0] == 'R'
                && header[1] == 'I'
                && header[2] == 'F'
                && header[3] == 'F'
                && header[8] == 'W'
                && header[9] == 'E'
                && header[10] == 'B'
                && header[11] == 'P';
    }

    private int unsigned(byte value) {
        return Byte.toUnsignedInt(value);
    }

    private String normalizeContentType(
            String contentType
    ) {
        if (contentType == null) {
            return "";
        }

        return contentType
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String sanitizeOriginalFilename(
            String originalFilename
    ) {
        if (
                originalFilename == null
                        || originalFilename.isBlank()
        ) {
            return "image";
        }

        String normalized =
                originalFilename
                        .replace("\\", "/");

        int finalSlash =
                normalized.lastIndexOf('/');

        String filename =
                finalSlash >= 0
                        ? normalized.substring(
                        finalSlash + 1
                )
                        : normalized;

        if (filename.length() > 255) {
            return filename.substring(
                    filename.length() - 255
            );
        }

        return filename;
    }

    private void assignFirstImageAsPrimary(
            UUID auctionId
    ) {
        List<AuctionImage> remainingImages =
                imageRepository
                        .findByAuctionIdOrderByDisplayOrderAsc(
                                auctionId
                        );

        if (!remainingImages.isEmpty()) {
            remainingImages
                    .getFirst()
                    .setPrimaryImage(true);
        }
    }

    private AuctionImageResponse toResponse(
            AuctionImage image
    ) {
        return new AuctionImageResponse(
                image.getId(),
                image.getAuction().getId(),
                "/api/auction-images/"
                        + image.getId(),
                image.getOriginalFilename(),
                image.getContentType(),
                image.getFileSize(),
                image.getDisplayOrder(),
                image.isPrimaryImage(),
                image.getCreatedAt()
        );
    }
}