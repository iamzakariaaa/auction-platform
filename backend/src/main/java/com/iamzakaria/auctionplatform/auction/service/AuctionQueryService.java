package com.iamzakaria.auctionplatform.auction.service;

import com.iamzakaria.auctionplatform.auction.dto.AuctionResponse;
import com.iamzakaria.auctionplatform.auction.dto.AuctionSummaryResponse;
import com.iamzakaria.auctionplatform.auction.entity.AuctionStatus;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotFoundException;
import com.iamzakaria.auctionplatform.auction.mapper.AuctionMapper;
import com.iamzakaria.auctionplatform.auction.repository.AuctionRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuctionQueryService {

    private final AuctionRepository auctionRepository;

    public AuctionQueryService(
            AuctionRepository auctionRepository
    ) {
        this.auctionRepository = auctionRepository;
    }

    @Transactional(readOnly = true)
    public AuctionResponse getById(UUID auctionId) {
        return auctionRepository.findById(auctionId)
                .map(AuctionMapper::toResponse)
                .orElseThrow(
                        () -> new AuctionNotFoundException(auctionId)
                );
    }

    @Transactional(readOnly = true)
    public Page<AuctionSummaryResponse> getAll(
            Pageable pageable
    ) {
        return auctionRepository.findAll(pageable)
                .map(AuctionMapper::toSummary);
    }

    @Transactional(readOnly = true)
    public Page<AuctionSummaryResponse> getByStatus(
            AuctionStatus status,
            Pageable pageable
    ) {
        return auctionRepository
                .findByStatus(status, pageable)
                .map(AuctionMapper::toSummary);
    }
}
