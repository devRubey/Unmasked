package com.example.chessinsights.service;

public class BotMoveRequest {
    private String fen;
    private int elo;

    public String getFen() {
        return fen;
    }

    public void setFen(String fen) {
        this.fen = fen;
    }

    public int getElo() {
        return elo;
    }

    public void setElo(int elo) {
        this.elo = elo;
    }
}