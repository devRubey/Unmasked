package com.example.chessinsights.service;

import java.util.List;

public class GameAnalysisResponse {

    private Long gameId;
    private List<MoveAnalysis> moves;

    public GameAnalysisResponse(Long gameId, List<MoveAnalysis> moves) {
        this.gameId = gameId;
        this.moves = moves;
    }

    public Long getGameId() {
        return gameId;
    }

    public List<MoveAnalysis> getMoves() {
        return moves;
    }
}