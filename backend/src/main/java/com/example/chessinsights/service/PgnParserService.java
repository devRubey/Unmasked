package com.example.chessinsights.service;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.move.MoveList;
import com.github.bhlangonijr.chesslib.pgn.PgnHolder;
import com.github.bhlangonijr.chesslib.game.Game;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PgnParserService {

    public List<String> parseToUciMoves(String pgnText) throws Exception {
        java.io.File tempFile = java.io.File.createTempFile("game", ".pgn");
        java.nio.file.Files.writeString(tempFile.toPath(), pgnText);

        PgnHolder pgnHolder = new PgnHolder(tempFile.getAbsolutePath());
        pgnHolder.loadPgn();

        Game game = pgnHolder.getGames().get(0);
        game.loadMoveText();

        List<String> uciMoves = new ArrayList<>();
        Board board = new Board();

        for (Move move : game.getHalfMoves()) {
            uciMoves.add(move.toString());
            board.doMove(move);
        }

        tempFile.delete();
        return uciMoves;
    }

    public List<String> parseToSanMoves(String pgnText) {
        String movesOnly = pgnText.replaceAll("(?m)^\\[.*\\]\\s*$", "");

        List<String> sanMoves = new ArrayList<>();
        Matcher matcher = Pattern.compile("[^\\s.]+").matcher(movesOnly);

        while (matcher.find()) {
            String token = matcher.group();
            if (token.matches("\\d+") || token.matches("1-0|0-1|1/2-1/2|\\*")) {
                continue;
            }
            sanMoves.add(token);
        }

        return sanMoves;
    }

    /**
     * Converts a single hypothetical move (UCI format, e.g. "g1f3") into
     * SAN notation (e.g. "Nf3"), using the given board position as context.
     * Returns null if it can't be resolved, so callers can fall back safely.
     */
    public String uciToSan(Board board, String uciMove) {
        try {
            for (Move legalMove : board.legalMoves()) {
                if (legalMove.toString().equalsIgnoreCase(uciMove)) {
                    MoveList moveList = new MoveList(board.getFen());
                    moveList.add(legalMove);
                    return moveList.toSanArray()[0];
                }
            }
        } catch (Exception e) {
            // fall through to null
        }
        return null;
    }
}