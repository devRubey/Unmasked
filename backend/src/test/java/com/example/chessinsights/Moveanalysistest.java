package com.example.chessinsights.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MoveAnalysisTest {

    @Test
    void zeroSwingIsClassifiedAsBest() {
        MoveAnalysis analysis = new MoveAnalysis(1, "e2e4", 0, 0, 0);
        assertEquals("Best", analysis.classification);
    }

    @Test
    void swingJustBelowInaccuracyThresholdIsStillBest() {
        MoveAnalysis analysis = new MoveAnalysis(1, "e2e4", 0, -49, -49);
        assertEquals("Best", analysis.classification);
    }

    @Test
    void swingAtInaccuracyThresholdIsInaccuracy() {
        MoveAnalysis analysis = new MoveAnalysis(1, "e2e4", 0, -50, -50);
        assertEquals("Inaccuracy", analysis.classification);
    }

    @Test
    void swingAtMistakeThresholdIsMistake() {
        MoveAnalysis analysis = new MoveAnalysis(1, "e2e4", 0, -100, -100);
        assertEquals("Mistake", analysis.classification);
    }

    @Test
    void swingAtBlunderThresholdIsBlunder() {
        MoveAnalysis analysis = new MoveAnalysis(1, "e2e4", 0, -300, -300);
        assertEquals("Blunder", analysis.classification);
    }

    @Test
    void classificationUsesAbsoluteValueOfSwing() {
        // A large *positive* swing (e.g. the opponent blundering into you)
        // should classify the same as a large negative one.
        MoveAnalysis analysis = new MoveAnalysis(1, "e2e4", 0, 350, 350);
        assertEquals("Blunder", analysis.classification);
    }

    @Test
    void fieldsAreStoredExactlyAsGiven() {
        MoveAnalysis analysis = new MoveAnalysis(6, "g8f6", 40, -60, -100);
        assertEquals(6, analysis.moveNumber);
        assertEquals("g8f6", analysis.move);
        assertEquals(40, analysis.evalBefore);
        assertEquals(-60, analysis.evalAfter);
        assertEquals(-100, analysis.swing);
    }
}