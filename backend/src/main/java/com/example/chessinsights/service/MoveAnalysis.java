package com.example.chessinsights.service;

public class MoveAnalysis {
    public int moveNumber;
    public String move;
    public int evalBefore;
    public int evalAfter;
    public int swing;
    public String classification;
    public String explanation;
    public String sanMove; // human-readable, e.g. "Qh5" - for display only

    public MoveAnalysis() {
    }

    public MoveAnalysis(int moveNumber, String move, int evalBefore, int evalAfter, int swing) {
        this.moveNumber = moveNumber;
        this.move = move;
        this.evalBefore = evalBefore;
        this.evalAfter = evalAfter;
        this.swing = swing;
        this.classification = classify(Math.abs(swing));
        this.explanation = null;
    }

    private String classify(int absSwing) {
        if (absSwing >= 300) return "Blunder";
        if (absSwing >= 100) return "Mistake";
        if (absSwing >= 50) return "Inaccuracy";
        return "Best";
    }
}