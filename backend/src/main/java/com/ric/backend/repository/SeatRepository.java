package com.ric.backend.repository;

import com.ric.backend.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    
    // Fetch all seats for a specific event, ordered by row then seat number
    List<Seat> findByEventIdOrderByRowLabelAscSeatNumberAsc(Long eventId);
}
