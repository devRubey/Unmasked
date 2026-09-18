package com.example.chessinsights.controller;

import com.example.chessinsights.model.Game;
import com.example.chessinsights.model.GameSummary;
import com.example.chessinsights.model.User;
import com.example.chessinsights.repository.GameRepository;
import com.example.chessinsights.repository.UserRepository;
import com.example.chessinsights.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class AnalysisController {

    private final StockfishService stockfishService;

    @Autowired
    private PgnParserService pgnParserService;

    @Autowired
    private GameAnalysisService gameAnalysisService;

    @Autowired
    private UserRepository userRepository;

    public AnalysisController(StockfishService stockfishService) {
        this.stockfishService = stockfishService;
    }

    @GetMapping("/api/analyze")
    public AnalysisResult analyze(@RequestParam String position, @RequestParam(defaultValue = "15") int depth) throws Exception {
        return stockfishService.analyze(position, depth);
    }

    @PostMapping("/api/parse-pgn")
    public List<String> parsePgn(@RequestBody String pgn) throws Exception {
        return pgnParserService.parseToUciMoves(pgn);
    }

    @PostMapping("/api/analyze-game")
    public GameAnalysisResponse analyzeGame(@RequestBody String pgn, Authentication authentication) throws Exception {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return gameAnalysisService.analyzeGame(pgn, 12, user);
    }

    @GetMapping("/api/games/{id}")
    public GameAnalysisResponse getGame(@PathVariable Long id, Authentication authentication) throws Exception {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return gameAnalysisService.getSavedAnalysis(id, user);
    }

    @GetMapping("/api/my-games")
    public List<GameSummary> myGames(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return gameRepository.findByUserId(user.getId()).stream()
                .map(g -> new GameSummary(g.getId(), g.getPgn(), g.getAnalyzedAt()))
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping("/api/bot-move")
    public Map<String, String> getBotMove(@RequestBody BotMoveRequest request) throws Exception {
        String bestMove = stockfishService.getBestMoveAtStrength(request.getFen(), request.getElo());
        return Map.of("move", bestMove);
    }

    @Autowired
    private GameRepository gameRepository;
}