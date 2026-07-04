package com.iamzakaria.auctionplatform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "First name is required.")
        @Size(max = 100)
        String firstName,

        @NotBlank(message = "Last name is required.")
        @Size(max = 100)
        String lastName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        @Size(max = 255)
        String email,

        @NotBlank(message = "Password is required.")
        @Size(
                min = 8,
                max = 100,
                message = "Password must contain between 8 and 100 characters."
        )
        String password
) {
}
