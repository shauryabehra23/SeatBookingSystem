package com.ric.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class SeatReleaseRequest {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotEmpty(message = "You must provide at least one seat to release")
    private List<Long> seatIds;
}
