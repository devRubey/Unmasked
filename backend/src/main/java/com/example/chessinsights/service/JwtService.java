package com.example.chessinsights.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    // In a real production app this key would come from an environment variable,
    // not be hardcoded - we'll fix this before deployment. Fine for local dev now.
    private final SecretKey key = Keys.hmacShaKeyFor(
            "this-is-a-placeholder-secret-key-change-me-before-deploy-12345".getBytes()
    );

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