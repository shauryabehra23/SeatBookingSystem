package com.ric.backend.repository;

import com.ric.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    // Used at login: find the user by their phone number
    Optional<AppUser> findByPhone(String phone);
}
