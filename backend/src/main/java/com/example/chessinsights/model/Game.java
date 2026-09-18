package com.example.chessinsights.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String pgn;

    @Column(nullable = false)
    private LocalDateTime analyzedAt;

    @Column(columnDefinition = "TEXT")
    private String analysisJson;

    public Game() {}

    public Game(User user, String pgn) {
        this.user = user;
        this.pgn = pgn;
        this.analyzedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getPgn() { return pgn; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public String getAnalysisJson() { return analysisJson; }
    public void setAnalysisJson(String analysisJson) { this.analysisJson = analysisJson; }
}