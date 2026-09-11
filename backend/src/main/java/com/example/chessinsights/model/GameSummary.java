package com.example.chessinsights.model;

import java.time.LocalDateTime;

public class GameSummary {
    public Long id;
    public String pgn;
    public LocalDateTime analyzedAt;

    public GameSummary(Long id, String pgn, LocalDateTime analyzedAt) {
        this.id = id;
        this.pgn = pgn;
        this.analyzedAt = analyzedAt;
    }
}