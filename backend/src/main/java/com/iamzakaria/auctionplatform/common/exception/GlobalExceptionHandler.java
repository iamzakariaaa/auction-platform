package com.iamzakaria.auctionplatform.common.exception;

import com.iamzakaria.auctionplatform.auction.exception.AuctionNotEditableException;
import com.iamzakaria.auctionplatform.auction.exception.AuctionNotFoundException;
import com.iamzakaria.auctionplatform.auction.exception.InvalidAuctionScheduleException;
import com.iamzakaria.auctionplatform.bid.exception.AuctionNotActiveException;
import com.iamzakaria.auctionplatform.bid.exception.BidTooLowException;
import com.iamzakaria.auctionplatform.bid.exception.SelfOutbidException;
import com.iamzakaria.auctionplatform.common.response.ApiError;
import com.iamzakaria.auctionplatform.user.exception.EmailAlreadyExistsException;
import com.iamzakaria.auctionplatform.user.exception.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.AuthenticationException;

import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> errors =
                exception.getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .collect(Collectors.toMap(
                                FieldError::getField,
                                error -> Objects.requireNonNullElse(
                                        error.getDefaultMessage(),
                                        "Invalid value."
                                ),
                                (first, second) -> first
                        ));

        return buildError(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_FAILED",
                "The request contains invalid values.",
                request.getRequestURI(),
                errors
        );
    }

    //AUTH EXCEPTION HANDLER
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(
            UserNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "USER_NOT_FOUND",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailConflict(
            EmailAlreadyExistsException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.CONFLICT,
                "EMAIL_ALREADY_EXISTS",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    //AUCTION EXCEPTION HANDLER
    @ExceptionHandler(AuctionNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(
            AuctionNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.NOT_FOUND,
                "AUCTION_NOT_FOUND",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationFailure(
            AuthenticationException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.UNAUTHORIZED,
                "INVALID_CREDENTIALS",
                "Invalid email or password.",
                request.getRequestURI(),
                Map.of()
        );
    }

    @ExceptionHandler({
            InvalidAuctionScheduleException.class,
            AuctionNotEditableException.class
    })
    public ResponseEntity<ApiError> handleBusinessRule(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.BAD_REQUEST,
                "INVALID_AUCTION_OPERATION",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }

    //BID EXCEPTION HANDLER
    @ExceptionHandler(BidTooLowException.class)
    public ResponseEntity<ApiError> handleBidTooLow(
            BidTooLowException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.CONFLICT,
                "BID_TOO_LOW",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }
    @ExceptionHandler(AuctionNotActiveException.class)
    public ResponseEntity<ApiError> handleAuctionNotActive(
            AuctionNotActiveException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.CONFLICT,
                "AUCTION_NOT_ACTIVE",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }
    @ExceptionHandler(SelfOutbidException.class)
    public ResponseEntity<ApiError> handleSelfOutbid(
            SelfOutbidException exception,
            HttpServletRequest request
    ) {
        return buildError(
                HttpStatus.CONFLICT,
                "ALREADY_HIGHEST_BIDDER",
                exception.getMessage(),
                request.getRequestURI(),
                Map.of()
        );
    }
    private ResponseEntity<ApiError> buildError(
            HttpStatus status,
            String code,
            String message,
            String path,
            Map<String, String> validationErrors
    ) {
        ApiError error = new ApiError(
                Instant.now(),
                status.value(),
                code,
                message,
                path,
                validationErrors
        );

        return ResponseEntity.status(status).body(error);
    }
}