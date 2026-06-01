package com.ric.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private Venue venue;

    private String title;
    private String description;
    private String eventType;
    private String bannerImage;
    private LocalDateTime eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private BigDecimal ticketPrice;
    private LocalDateTime createdAt;
}
