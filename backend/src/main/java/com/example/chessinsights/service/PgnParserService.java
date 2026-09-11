package com.example.chessinsights.service;

import com.github.bhlangonijr.chesslib.Board;
import com.github.bhlangonijr.chesslib.move.Move;
import com.github.bhlangonijr.chesslib.pgn.PgnHolder;
import com.github.bhlangonijr.chesslib.game.Game;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PgnParserService {

    /**
     * Takes raw PGN text and returns the list of moves in UCI format
     * (e.g. "e2e4", "g1f3") - the format Stockfish actually understands.
     */
    public List<String> parseToUciMoves(String pgnText) throws Exception {
        // chesslib reads PGN from a file, so we write the text to a temp file first
        java.io.File tempFile = java.io.File.createTempFile("game", ".pgn");
        java.nio.file.Files.writeString(tempFile.toPath(), pgnText);

        PgnHolder pgnHolder = new PgnHolder(tempFile.getAbsolutePath());
        pgnHolder.loadPgn();

        Game game = pgnHolder.getGames().get(0); // just handle one game for now
        game.loadMoveText(); // this replays the SAN moves onto an internal board

        List<String> uciMoves = new ArrayList<>();
        Board board = new Board(); // fresh board to replay moves onto

        for (Move move : game.getHalfMoves()) {
            uciMoves.add(move.toString()); // chesslib's Move.toString() IS UCI format
            board.doMove(move);
        }

        tempFile.delete(); // clean up the temp file
        return uciMoves;
    }
}