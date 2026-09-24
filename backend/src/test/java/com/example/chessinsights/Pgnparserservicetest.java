package com.example.chessinsights.service;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PgnParserServiceTest {

    private final PgnParserService pgnParserService = new PgnParserService();

    @Test
    void parseToSanMovesExtractsOnlyTheMovesFromAFullyHeaderedPgn() {
        String pgn = """
                [Event "Casual Game"]
                [Site "?"]
                [Date "2026.09.17"]
                [Round "1"]
                [White "Player 1"]
                [Black "Player 2"]
                [Result "1-0"]

                1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0
                """;

        List<String> sanMoves = pgnParserService.parseToSanMoves(pgn);

        assertEquals(
                List.of("e4", "e5", "Qh5", "Nc6", "Bc4", "Nf6", "Qxf7#"),
                sanMoves
        );
    }

    @Test
    void parseToSanMovesDropsMoveNumbersAndResultToken() {
        String pgn = "1. d4 d5 2. c4 e6 1/2-1/2";

        List<String> sanMoves = pgnParserService.parseToSanMoves(pgn);

        // No bare "1", "2", or the "1/2-1/2" result token should survive.
        assertEquals(List.of("d4", "d5", "c4", "e6"), sanMoves);
    }

    @Test
    void parseToSanMovesHandlesAGameWithNoHeadersAtAll() {
        String pgn = "1. Nf3 Nf6 2. c4 g6 *";

        List<String> sanMoves = pgnParserService.parseToSanMoves(pgn);

        assertEquals(List.of("Nf3", "Nf6", "c4", "g6"), sanMoves);
    }
}