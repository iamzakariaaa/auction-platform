package com.iamzakaria.auctionplatform.auction.storage;

import com.iamzakaria.auctionplatform.auction.exception.AuctionImageStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Locale;
import java.util.UUID;

@Service
public class LocalAuctionImageStorage
        implements AuctionImageStorage {

    private final Path rootDirectory;

    public LocalAuctionImageStorage(
            @Value(
                    "${auction.images.storage-location:"
                            + "uploads/auctions}"
            )
            String storageLocation
    ) {
        this.rootDirectory = Path
                .of(storageLocation)
                .toAbsolutePath()
                .normalize();

        createRootDirectory();
    }

    @Override
    public StoredAuctionImage store(
            UUID auctionId,
            MultipartFile file
    ) {
        if (file == null || file.isEmpty()) {
            throw new AuctionImageStorageException(
                    "The uploaded image is empty."
            );
        }

        String extension = extractExtension(
                file.getOriginalFilename()
        );

        String storedFilename =
                UUID.randomUUID()
                        + extension;

        String storageKey =
                auctionId
                        + "/"
                        + storedFilename;

        Path auctionDirectory =
                rootDirectory
                        .resolve(
                                auctionId.toString()
                        )
                        .normalize();

        Path destination =
                auctionDirectory
                        .resolve(storedFilename)
                        .normalize();

        verifyInsideStorage(destination);

        try {
            Files.createDirectories(
                    auctionDirectory
            );

            try (
                    InputStream inputStream =
                            file.getInputStream()
            ) {
                Files.copy(
                        inputStream,
                        destination,
                        StandardCopyOption
                                .REPLACE_EXISTING
                );
            }
        } catch (IOException exception) {
            throw new AuctionImageStorageException(
                    "Unable to store the image.",
                    exception
            );
        }

        return new StoredAuctionImage(
                storageKey,
                storedFilename
        );
    }

    @Override
    public Path resolve(String storageKey) {
        if (
                storageKey == null
                        || storageKey.isBlank()
        ) {
            throw new AuctionImageStorageException(
                    "The image storage key is invalid."
            );
        }

        Path resolvedPath =
                rootDirectory
                        .resolve(storageKey)
                        .normalize();

        verifyInsideStorage(resolvedPath);

        return resolvedPath;
    }

    @Override
    public void delete(String storageKey) {
        Path imagePath = resolve(storageKey);

        try {
            Files.deleteIfExists(imagePath);

            Path parentDirectory =
                    imagePath.getParent();

            if (
                    parentDirectory != null
                            && !parentDirectory.equals(
                            rootDirectory
                    )
                            && Files.isDirectory(
                            parentDirectory
                    )
                            && isDirectoryEmpty(
                            parentDirectory
                    )
            ) {
                Files.deleteIfExists(
                        parentDirectory
                );
            }
        } catch (IOException exception) {
            throw new AuctionImageStorageException(
                    "Unable to delete the image.",
                    exception
            );
        }
    }

    private void createRootDirectory() {
        try {
            Files.createDirectories(
                    rootDirectory
            );
        } catch (IOException exception) {
            throw new AuctionImageStorageException(
                    "Unable to initialize image storage.",
                    exception
            );
        }
    }

    private void verifyInsideStorage(
            Path path
    ) {
        if (!path.startsWith(rootDirectory)) {
            throw new AuctionImageStorageException(
                    "Invalid image storage path."
            );
        }
    }

    private String extractExtension(
            String originalFilename
    ) {
        if (
                originalFilename == null
                        || originalFilename.isBlank()
        ) {
            return "";
        }

        String normalizedFilename =
                Path.of(originalFilename)
                        .getFileName()
                        .toString();

        int lastDot =
                normalizedFilename.lastIndexOf('.');

        if (
                lastDot < 0
                        || lastDot
                        == normalizedFilename.length()
                        - 1
        ) {
            return "";
        }

        String extension =
                normalizedFilename
                        .substring(lastDot)
                        .toLowerCase(Locale.ROOT);

        if (extension.length() > 10) {
            return "";
        }

        return extension;
    }

    private boolean isDirectoryEmpty(
            Path directory
    ) throws IOException {
        try (
                DirectoryStream<Path> stream =
                        Files.newDirectoryStream(
                                directory
                        )
        ) {
            return !stream
                    .iterator()
                    .hasNext();
        }
    }
}