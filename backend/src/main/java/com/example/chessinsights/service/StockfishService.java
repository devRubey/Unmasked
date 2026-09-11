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

    public AnalysisResult analyze(String positionArgs, int depth) throws IOException {
        send("position " + positionArgs);
        send("go depth " + depth);

        int lastEval = 0;
        String bestMove = "";
        String line;

        while ((line = reader.readLine()) != null) {
            if (line.contains("score cp")) {
                lastEval = extractScore(line);
            }
            if (line.startsWith("bestmove")) {
                bestMove = line.split(" ")[1];
                break;
            }
        }

        return new AnalysisResult(lastEval, bestMove);
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
}