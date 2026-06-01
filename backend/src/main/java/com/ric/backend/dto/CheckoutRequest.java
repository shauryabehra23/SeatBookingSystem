package com.ric.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * CheckoutRequest is the body sent by the frontend when the user
 * confirms their booking from the checkout page.
 *
 * The user must have already HELD these seats (via /seats/hold)
 * before calling checkout. The service validates this.
 *
 * Example request body:
 *   {
 *     "eventId": 1,
 *     "seatIds": [101, 102]
 *   }
 */
@Data
public class CheckoutRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotEmpty(message = "You must select at least one seat to book")
    private List<Long> seatIds;
}
