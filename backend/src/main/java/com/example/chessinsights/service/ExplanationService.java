package com.example.chessinsights.service;

import org.springframework.stereotype.Service;

@Service
public class ExplanationService {

    public String explain(MoveAnalysis analysis, String suggestedMove) {
    String phase = phase(analysis.moveNumber);

    if (analysis.classification.equals("Best")) {
        return "Best — A strong move, keeping your position solid in the " + phase + ".";
    }

    String severity = severityWord(Math.abs(analysis.swing));

    StringBuilder sb = new StringBuilder();
    sb.append(analysis.classification).append(" — This move ")
      .append(severity).append(" weakened your position in the ")
      .append(phase).append(".");

    if (suggestedMove != null) {
        sb.append(" A stronger move here was ").append(suggestedMove).append(".");
    }

    return sb.toString();
}

    private String severityWord(int absSwing) {
        if (absSwing >= 500) return "severely";
        if (absSwing >= 300) return "significantly";
        if (absSwing >= 100) return "noticeably";
        return "slightly";
    }

    private String phase(int moveNumber) {
        if (moveNumber <= 10) return "opening";
        if (moveNumber <= 30) return "middlegame";
        return "endgame";
    }
}