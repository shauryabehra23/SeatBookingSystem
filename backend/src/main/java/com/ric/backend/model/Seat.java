package com.ric.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id")
    private Long eventId;

    private String section;
    private String rowLabel;
    private Integer seatNumber;
    
    // Status can be: AVAILABLE, BOOKED
    // Note: HELD status will be computed dynamically using Redis later
    private String status;
    
    private BigDecimal price;
}
