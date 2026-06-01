package com.ric.backend.repository;

import com.ric.backend.model.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {

    /**
     * Fetch all BookingSeat records for a given booking.
     * Used when building the BookingResponse to show seat details.
     */
    List<BookingSeat> findByBookingId(Long bookingId);
}
