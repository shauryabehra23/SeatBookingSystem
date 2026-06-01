package com.ric.backend.security;

import com.ric.backend.model.AppUser;
import com.ric.backend.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

/**
 * JwtFilter intercepts EVERY incoming HTTP request exactly once.
 * Its job is to answer the question: "Is this request coming from a logged-in user?"
 *
 * How it works step by step:
 *   1. Look for the "Authorization" header in the request
 *   2. If found and starts with "Bearer ", extract the token
 *   3. Ask JwtUtil to validate the token
 *   4. If valid, extract the phone number from the token
 *   5. Load the user from the database by phone number
 *   6. Create an "Authentication" object and place it in the SecurityContext
 *      → Spring Security now knows this request belongs to that user
 *   7. Pass the request to the next filter/controller
 *
 * If at any step something fails (no header, invalid token, user not found),
 * we simply don't set the authentication — Spring Security will then block
 * the request if the endpoint requires authentication.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AppUserRepository appUserRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // Step 1: Read the Authorization header
        // Expected format: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIi..."
        String authHeader = request.getHeader("Authorization");

        // Step 2: If there's no Authorization header or it doesn't start with "Bearer ",
        // skip JWT processing and move on. Public endpoints (like GET /api/events)
        // will work fine. Protected endpoints will be blocked by SecurityConfig.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 3: Strip the "Bearer " prefix to get the raw token string
        String token = authHeader.substring(7);

        // Step 4: Check if the token is valid (not tampered with, not expired)
        if (!jwtUtil.isTokenValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Step 5: Extract the phone number from the token's payload
        String phone = jwtUtil.extractPhone(token);

        // Step 6: Only set authentication if it hasn't already been set this request
        if (phone != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Load the actual user from the database to make sure they still exist
            Optional<AppUser> userOpt = appUserRepository.findByPhone(phone);

            if (userOpt.isPresent()) {
                AppUser user = userOpt.get();

                // Create a Spring Security Authentication object.
                // - principal: the AppUser object (who is logged in)
                // - credentials: null (we don't store passwords)
                // - authorities: empty list (no roles needed for now)
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.emptyList()
                        );

                // Attach request details (IP address, etc.) to the authentication
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // Place the authentication into Spring's SecurityContext.
                // After this line, any controller can call:
                //   (AppUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal()
                // to get the currently logged-in user.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // Step 7: Continue to the actual controller
        filterChain.doFilter(request, response);
    }
}
