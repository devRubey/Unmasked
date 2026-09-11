package com.example.chessinsights.service;

public class MoveAnalysis {
    public int moveNumber;
    public String move;
    public int evalBefore;   // always from White's perspective now
    public int evalAfter;    // always from White's perspective now
    public int swing;        // from the MOVER's own perspective - negative = bad for them
    public String classification;

    public MoveAnalysis(int moveNumber, String move, int evalBefore, int evalAfter, int swing) {
        this.moveNumber = moveNumber;
        this.move = move;
        this.evalBefore = evalBefore;
        this.evalAfter = evalAfter;
        this.swing = swing;
        this.classification = classify(Math.abs(swing));
    }

    private String classify(int absSwing) {
        if (absSwing >= 300) return "Blunder";
        if (absSwing >= 100) return "Mistake";
        if (absSwing >= 50) return "Inaccuracy";
        return "Best";
    }
}