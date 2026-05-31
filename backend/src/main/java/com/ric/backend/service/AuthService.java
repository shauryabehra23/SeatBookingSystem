package com.ric.backend.service;

import com.ric.backend.dto.AuthResponse;
import com.ric.backend.dto.LoginRequest;
import com.ric.backend.dto.RegisterRequest;
import com.ric.backend.exception.ApiException;
import com.ric.backend.model.AppUser;
import com.ric.backend.repository.AppUserRepository;
import com.ric.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        // 1. Check if phone already exists
        if (appUserRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new ApiException("Phone number is already registered.", HttpStatus.CONFLICT);
        }

        // 2. Create the new user
        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setNationality(request.getNationality() != null ? request.getNationality() : "Indian");
        
        // 3. Hash the password
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());

        // 4. Save to database
        AppUser savedUser = appUserRepository.save(user);

        // 5. Generate a JWT token for auto-login after registration
        String token = jwtUtil.generateToken(savedUser.getPhone());

        // Remove the password from the response object for security
        savedUser.setPassword(null);

        return new AuthResponse(token, savedUser);
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Find user by phone
        Optional<AppUser> userOpt = appUserRepository.findByPhone(request.getPhone());
        if (userOpt.isEmpty()) {
            throw new ApiException("Invalid phone number or password.", HttpStatus.UNAUTHORIZED);
        }

        AppUser user = userOpt.get();

        // 2. Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid phone number or password.", HttpStatus.UNAUTHORIZED);
        }

        // 3. Generate JWT token
        String token = jwtUtil.generateToken(user.getPhone());

        // Remove the password from the response object for security
        user.setPassword(null);

        return new AuthResponse(token, user);
    }
}
