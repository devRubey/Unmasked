package com.example.chessinsights.service;

import com.example.chessinsights.model.Game;
import com.example.chessinsights.model.User;
import com.example.chessinsights.repository.GameRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.bhlangonijr.chesslib.Board;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class GameAnalysisService {

    private final StockfishService stockfishService;
    private final PgnParserService pgnParserService;
    private final GameRepository gameRepository;
    private final ExplanationService explanationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GameAnalysisService(StockfishService stockfishService,
                               PgnParserService pgnParserService,
                               GameRepository gameRepository,
                               ExplanationService explanationService) {
        this.stockfishService = stockfishService;
        this.pgnParserService = pgnParserService;
        this.gameRepository = gameRepository;
        this.explanationService = explanationService;
    }

    public GameAnalysisResponse analyzeGame(String pgnText, int depth, User user) throws Exception {
        List<String> moves = pgnParserService.parseToUciMoves(pgnText);
        List<String> sanMoves = pgnParserService.parseToSanMoves(pgnText);
        List<MoveAnalysis> results = new ArrayList<>();

        StringBuilder positionBuilder = new StringBuilder("startpos");
        int whiteEvalBefore = 0;
        String suggestedMoveForThisTurn = null;
        Board sanBoard = new Board();

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

            MoveAnalysis analysis = new MoveAnalysis(i + 1, move, whiteEvalBefore, whiteEvalAfter, moverSwing);
            analysis.sanMove = (i < sanMoves.size()) ? sanMoves.get(i) : move;

                String suggestedSan = null;
                if (suggestedMoveForThisTurn != null && !suggestedMoveForThisTurn.equalsIgnoreCase(move)) {
                    suggestedSan = pgnParserService.uciToSan(sanBoard, suggestedMoveForThisTurn);
                }
                analysis.explanation = explanationService.explain(analysis, suggestedSan);
            
            results.add(analysis);
            whiteEvalBefore = whiteEvalAfter;
            suggestedMoveForThisTurn = result.bestMove;

            sanBoard.doMove(analysis.sanMove);
        }

        Game game = new Game(user, pgnText);
        game.setAnalysisJson(objectMapper.writeValueAsString(results));
        game = gameRepository.save(game);

        return new GameAnalysisResponse(game.getId(), results);
    }

    public GameAnalysisResponse getSavedAnalysis(Long gameId, User user) throws Exception {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Game not found"));

        if (!game.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to view this game");
        }

        List<MoveAnalysis> results = objectMapper.readValue(
                game.getAnalysisJson(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, MoveAnalysis.class)
        );

        return new GameAnalysisResponse(game.getId(), results);
    }
}