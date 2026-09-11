package com.example.chessinsights.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.example.chessinsights.service.MoveAnalysis;
import java.util.List;

@Document(collection = "game_analyses")
public class GameAnalysisDocument {

    @Id
    private String id;

    private Long gameId; // links back to the Postgres Game row

    private List<MoveAnalysis> moves;

    public GameAnalysisDocument() {}

    public GameAnalysisDocument(Long gameId, List<MoveAnalysis> moves) {
        this.gameId = gameId;
        this.moves = moves;
    }

    public String getId() { return id; }
    public Long getGameId() { return gameId; }
    public List<MoveAnalysis> getMoves() { return moves; }
}