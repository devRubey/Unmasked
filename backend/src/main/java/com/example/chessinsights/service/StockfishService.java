package com.example.chessinsights.service;

import com.github.bhlangonijr.chesslib.Board;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.*;

@Service
public class StockfishService {

    @Value("${stockfish.path}")
    private String enginePath;

    private Process process;
    private BufferedWriter writer;
    private BufferedReader reader;

    @PostConstruct
    public void start() throws IOException {
        ProcessBuilder builder = new ProcessBuilder(enginePath);
        builder.redirectErrorStream(true);
        process = builder.start();

        writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
        reader = new BufferedReader(new InputStreamReader(process.getInputStream()));

        send("uci");
        waitFor("uciok");
        send("isready");
        waitFor("readyok");
    }

    public synchronized AnalysisResult analyze(String positionArgs, int depth) throws IOException {
        send("position " + positionArgs);
        send("go depth " + depth);

        int lastEval = 0;
        String bestMove = "";
        String line;

        while ((line = reader.readLine()) != null) {
            if (line.contains("score mate")) {
                lastEval = extractMateScore(line);
            } else if (line.contains("score cp")) {
                lastEval = extractScore(line);
            }
            if (line.startsWith("bestmove")) {
                bestMove = line.split(" ")[1];
                break;
            }
        }

        return new AnalysisResult(lastEval, bestMove);
    }

    /**
     * Gets the bot's move at a given difficulty (Elo strength).
     * Pass elo >= 3000 for full-strength/"Impossible" (no limit).
     * Always resets strength back to full afterward so analyze()
     * is never accidentally affected by a leftover strength limit.
     */
    public synchronized String getBestMoveAtStrength(String fen, int elo) throws IOException {
        if (elo >= 3000) {
            send("setoption name UCI_LimitStrength value false");
        } else {
            send("setoption name UCI_LimitStrength value true");
            send("setoption name UCI_Elo value " + elo);
        }

        send("isready");
        waitFor("readyok");

        send("position fen " + fen);
        send("go movetime 1000"); // 1 second thinking time, smooth for gameplay

        String bestMove = "";
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.startsWith("bestmove")) {
                bestMove = line.split(" ")[1];
                break;
            }
        }

        // Reset back to full strength so analyze()/analyze-game are unaffected
        send("setoption name UCI_LimitStrength value false");
        send("isready");
        waitFor("readyok");

        return bestMove;
    }

    @PreDestroy
    public void stop() throws IOException {
        send("quit");
        process.destroy();
    }

    private void send(String command) throws IOException {
        writer.write(command);
        writer.newLine();
        writer.flush();
    }

    private void waitFor(String expected) throws IOException {
        String line;
        while ((line = reader.readLine()) != null) {
            if (line.contains(expected)) return;
        }
    }

    private int extractScore(String line) {
        String[] parts = line.split(" ");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals("cp")) {
                return Integer.parseInt(parts[i + 1]);
            }
        }
        return 0;
    }

    private int extractMateScore(String line) {
        String[] parts = line.split(" ");
        for (int i = 0; i < parts.length; i++) {
            if (parts[i].equals("mate")) {
                int mateIn = Integer.parseInt(parts[i + 1]);
                return mateIn > 0 ? 10000 : -10000;
            }
        }
        return 0;
    }
}