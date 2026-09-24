package com.example.chessinsights.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExplanationServiceTest {

    private final ExplanationService explanationService = new ExplanationService();

    @Test
    void bestMoveInOpeningGetsPositiveReinforcement() {
        MoveAnalysis analysis = new MoveAnalysis(5, "e2e4", 0, 10, 10);

        String result = explanationService.explain(analysis, "Nf3");

        assertEquals(
                "Best — A strong move, keeping your position solid in the opening.",
                result
        );
    }

    @Test
    void blunderInMiddlegameIncludesSeverityPhaseAndSuggestion() {
        // moveNumber 20 -> middlegame; swing -350 -> Blunder, severity "significantly"
        MoveAnalysis analysis = new MoveAnalysis(20, "e7e5", 0, -350, -350);

        String result = explanationService.explain(analysis, "Nf3");

        assertEquals(
                "Blunder — This move significantly weakened your position in the middlegame. A stronger move here was Nf3.",
                result
        );
    }

    @Test
    void severeBlunderInEndgameWithNoSuggestedMoveOmitsFinalSentence() {
        // moveNumber 35 -> endgame; swing -600 -> Blunder, severity "severely"
        MoveAnalysis analysis = new MoveAnalysis(35, "g8f6", 0, -600, -600);

        String result = explanationService.explain(analysis, null);

        assertEquals(
                "Blunder — This move severely weakened your position in the endgame.",
                result
        );
    }

    @Test
    void mistakeGetsNoticeableSeverityWording() {
        // swing -150 -> Mistake, severity "noticeably" (>=100, <300)
        MoveAnalysis analysis = new MoveAnalysis(3, "d2d4", 0, -150, -150);

        String result = explanationService.explain(analysis, "d4");

        assertEquals(
                "Mistake — This move noticeably weakened your position in the opening. A stronger move here was d4.",
                result
        );
    }

    @Test
    void inaccuracyGetsSlightSeverityWording() {
        // swing -60 -> Inaccuracy, severity "slightly" (<100)
        MoveAnalysis analysis = new MoveAnalysis(15, "b1c3", 0, -60, -60);

        String result = explanationService.explain(analysis, null);

        assertEquals(
                "Inaccuracy — This move slightly weakened your position in the middlegame.",
                result
        );
    }
}