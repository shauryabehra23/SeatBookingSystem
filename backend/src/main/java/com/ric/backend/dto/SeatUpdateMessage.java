package com.ric.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * SeatUpdateMessage is the payload that is broadcast over WebSocket
 * to all users currently viewing a seat map.
 *
 * It tells the frontend: "These specific seat IDs just changed to this status."
 *
 * Example payload sent over WebSocket:
 *   { "eventId": 1, "seatIds": [1, 2], "status": "HELD" }
 *   { "eventId": 1, "seatIds": [1, 2], "status": "AVAILABLE" }
 *   { "eventId": 1, "seatIds": [1, 2], "status": "BOOKED" }
 */
@Data
@AllArgsConstructor
public class SeatUpdateMessage {

    // Which event these seats belong to
    private Long eventId;

    // The list of seat IDs that changed
    private List<Long> seatIds;

    // The new status: "HELD", "AVAILABLE", or "BOOKED"
    private String status;
}
