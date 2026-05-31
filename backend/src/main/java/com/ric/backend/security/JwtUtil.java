package com.ric.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JwtUtil is a helper class responsible for two things:
 *   1. GENERATING a JWT token (when user logs in successfully after OTP)
 *   2. VALIDATING and PARSING a JWT token (on every incoming protected request)
 *
 * A JWT (JSON Web Token) has three parts separated by dots:
 *   Header.Payload.Signature
 *   e.g. eyJhbGci....eyJzdWIi....SflKxwRJ...
 *
 * The "subject" (sub) we store inside the token is the user's phone number.
 * This is how we know WHO the request belongs to without hitting the database.
 */
@Component
public class JwtUtil {

    // Reads the secret key from application.properties
    @Value("${app.jwt.secret}")
    private String secret;

    // Token validity: reads from properties (86400000 ms = 24 hours)
    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    /**
     * Builds the signing key from our secret string.
     * The key must be at least 256 bits for HMAC-SHA256.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a JWT token for a given phone number.
     * Called once after successful OTP verification.
     *
     * @param phone  the user's phone number — stored as the token "subject"
     * @return       a signed JWT string like "eyJhbGci..."
     */
    public String generateToken(String phone) {
        return Jwts.builder()
                .subject(phone)                                        // who the token belongs to
                .issuedAt(new Date())                                  // when it was issued
                .expiration(new Date(System.currentTimeMillis() + expirationMs)) // when it expires
                .signWith(getSigningKey())                             // sign with our secret
                .compact();
    }

    /**
     * Extracts the phone number (subject) from a token.
     * Used by JwtFilter to identify the user on protected requests.
     *
     * @param token  the raw JWT string (without "Bearer " prefix)
     * @return       the phone number stored inside the token
     */
    public String extractPhone(String token) {
        return parseClaims(token).getSubject();
    }

    /**
     * Checks whether a token is valid (signature matches + not expired).
     *
     * @param token  the raw JWT string
     * @return       true if valid, false if tampered or expired
     */
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token); // throws an exception if invalid or expired
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Parses the JWT and returns all claims (payload data).
     * Throws an exception automatically if the signature is wrong or token expired.
     */
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
