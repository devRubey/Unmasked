package com.example.chessinsights.service;

import com.example.chessinsights.model.Game;
import com.example.chessinsights.model.GameAnalysisDocument;
import com.example.chessinsights.model.User;
import com.example.chessinsights.repository.GameAnalysisRepository;
import com.example.chessinsights.repository.GameRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GameAnalysisService {

    private final StockfishService stockfishService;
    private final PgnParserService pgnParserService;
    private final GameRepository gameRepository;
    private final GameAnalysisRepository gameAnalysisRepository;

    public GameAnalysisService(StockfishService stockfishService,
                               PgnParserService pgnParserService,
                               GameRepository gameRepository,
                               GameAnalysisRepository gameAnalysisRepository) {
        this.stockfishService = stockfishService;
        this.pgnParserService = pgnParserService;
        this.gameRepository = gameRepository;
        this.gameAnalysisRepository = gameAnalysisRepository;
    }

    public List<MoveAnalysis> analyzeGame(String pgnText, int depth, User user) throws Exception {
        List<String> moves = pgnParserService.parseToUciMoves(pgnText);
        List<MoveAnalysis> results = new ArrayList<>();

        StringBuilder positionBuilder = new StringBuilder("startpos");
        int whiteEvalBefore = 0;

        for (int i = 0; i < moves.size(); i++) {
            String move = moves.get(i);
            boolean whiteToMove = (i % 2 == 0);

            if (i == 0) {
                positionBuilder.append(" moves ").append(move);
            } else {
                positionBuilder.append(" ").append(move);
            }

            AnalysisResult result = stockfishService.analyze(positionBuilder.toString(), depth);
            int rawScore = result.evalCp;
            int whiteEvalAfter = whiteToMove ? -rawScore : rawScore;

            int moverSwing = whiteToMove
                    ? (whiteEvalAfter - whiteEvalBefore)
                    : (whiteEvalBefore - whiteEvalAfter);

            results.add(new MoveAnalysis(i + 1, move, whiteEvalBefore, whiteEvalAfter, moverSwing));
            whiteEvalBefore = whiteEvalAfter;
        }

        // --- persistence ---
        Game game = new Game(user, pgnText);
        game = gameRepository.save(game); // Postgres save - this part works fine

        try {
            GameAnalysisDocument doc = new GameAnalysisDocument(game.getId(), results);
            doc = gameAnalysisRepository.save(doc);

            game.setAnalysisDocumentId(doc.getId());
            gameRepository.save(game);
        } catch (Exception e) {
            // Mongo save failed (known SSL/network issue) - don't crash the whole request
            System.err.println("Warning: failed to save analysis to MongoDB - " + e.getMessage());
        }

        return results;
    }
}