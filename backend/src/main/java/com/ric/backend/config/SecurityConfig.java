package com.ric.backend.config;

import com.ric.backend.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * SecurityConfig defines which endpoints are public and which require a valid JWT.
 *
 * Rule of thumb for this project:
 *   PUBLIC  → anything a guest can see (event list, event detail, seat availability)
 *   PUBLIC  → auth endpoints (send-otp, verify-otp) — obviously no token yet at login
 *   PROTECTED → booking (requires knowing who you are)
 *   PROTECTED → my-bookings (your personal history)
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF: we use stateless JWT, not browser sessions/cookies
            .csrf(AbstractHttpConfigurer::disable)

            // Stateless: Spring should NOT create or use HTTP sessions.
            // Every request must carry its own JWT.
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // ── Public endpoints (no token needed) ──────────────────────
                // Anyone can browse events and seats
                .requestMatchers(HttpMethod.GET, "/api/events/**").permitAll()

                // Auth endpoints — user doesn't have a token yet when calling these
                .requestMatchers("/api/auth/**").permitAll()

                // ── Protected endpoints (valid JWT required) ─────────────────
                // Booking and personal data require authentication
                .requestMatchers("/api/bookings/**").authenticated()
                .requestMatchers("/api/users/**").authenticated()

                // Everything else: also require auth by default (safe fallback)
                .anyRequest().authenticated()
            )

            // Plug in our JwtFilter BEFORE Spring's default username/password filter.
            // This means JwtFilter runs first on every request.
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

