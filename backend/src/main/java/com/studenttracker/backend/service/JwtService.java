package com.studenttracker.backend.service;

import java.util.Date;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.studenttracker.backend.model.User;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    private static final long ACCESS_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
    private static final int MINIMUM_SECRET_KEY_LENGTH = 32; // 256 bits for HS256

    /**
     * Validates JWT secret key length on service initialization.
     * HS256 requires at least 32 bytes (256 bits) for cryptographic security.
     * Throws IllegalArgumentException if key is too short.
     */
    @PostConstruct
    public void validateSecretKey() {
        int keyLength = SECRET_KEY.getBytes().length;
        if (keyLength < MINIMUM_SECRET_KEY_LENGTH) {
            throw new IllegalArgumentException(
                "JWT secret key must be at least " + MINIMUM_SECRET_KEY_LENGTH +
                " characters (256 bits) for HS256 security. Current length: " + keyLength +
                " characters. Please set a longer jwt.secret value in application.properties or " +
                "JWT_SECRET environment variable.");
        }
    }

    /**
     * Generates a new access token with 7-day expiration
     *
     * @param user The user to generate token for
     * @return JWT access token
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tokenVersion", user.getTokenVersion())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY_MS))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public int extractTokenVersion(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("tokenVersion", Integer.class);
    }
}
