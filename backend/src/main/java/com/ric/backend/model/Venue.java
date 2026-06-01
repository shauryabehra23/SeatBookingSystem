package com.ric.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String imageUrl;
    private Integer totalCapacity;
    private String area;
    private String venueType;
}
