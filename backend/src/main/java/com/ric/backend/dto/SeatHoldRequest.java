package com.ric.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SeatHoldRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotEmpty(message = "You must select at least one seat")
    private List<Long> seatIds;
}
