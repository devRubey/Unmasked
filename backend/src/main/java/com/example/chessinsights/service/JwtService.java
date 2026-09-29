package com.example.chessinsights.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // Reads from the JWT_SECRET environment variable in prod (set via Render env
    // vars / a Kubernetes Secret). Falls back to a placeholder ONLY for local dev
    // when JWT_SECRET isn't set - never rely on the fallback in a real deployment.
    @Value("${JWT_SECRET:this-is-a-placeholder-secret-key-change-me-before-deploy-12345}")
    private String secretString;

    private SecretKey key;

    @PostConstruct
    private void init() {
        this.key = Keys.hmacShaKeyFor(secretString.getBytes());
    }

    private final long expirationMs = 1000 * 60 * 60 * 24; // 24 hours

    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            extractUsername(token);
            return true;
        } catch (Exception e) {
            return false; // expired, tampered with, or malformed
        }
    }
}
