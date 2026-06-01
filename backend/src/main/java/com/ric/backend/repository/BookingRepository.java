package com.ric.backend.repository;

import com.ric.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Fetch all bookings for a specific user, newest first.
     * Used for the "My Bookings" page.
     */
    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);
}
