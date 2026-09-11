package com.example.chessinsights.service;

public class AnalysisResult {
    public int evalCp;
    public String bestMove;

    public AnalysisResult(int evalCp, String bestMove) {
        this.evalCp = evalCp;
        this.bestMove = bestMove;
    }
}