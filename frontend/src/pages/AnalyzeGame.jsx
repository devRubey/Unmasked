import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import PlayBot from "../components/PlayBot";

function estimateRating(accuracy) {
  const anchors = [
    [0, 400],
    [40, 700],
    [50, 900],
    [60, 1100],
    [70, 1350],
    [80, 1650],
    [90, 2000],
    [95, 2300],
    [100, 2800],
  ];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [accA, ratingA] = anchors[i];
    const [accB, ratingB] = anchors[i + 1];
    if (accuracy >= accA && accuracy <= accB) {
      const t = (accuracy - accA) / (accB - accA);
      return Math.round(ratingA + t * (ratingB - ratingA));
    }
  }
  return accuracy <= 0 ? 400 : 2800;
}

function AnalyzeGame() {
  const [mode, setMode] = useState("bot");
  const [pgn, setPgn] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const runAnalysis = async (pgnToAnalyze) => {
    setError("");
    setResults(null);
    setLoading(true);

    try {
      const response = await apiClient.post("/analyze-game", pgnToAnalyze, {
        headers: { "Content-Type": "text/plain" },
      });
      setResults(response.data.moves);
    } catch (err) {
      setError(
        "Could not analyze this game. Check your PGN format and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => runAnalysis(pgn);

  const handleBotGameFinished = (generatedPgn) => {
    setPgn(generatedPgn);
    runAnalysis(generatedPgn);
  };

  const classificationColor = (classification) => {
    switch (classification) {
      case "Blunder":
        return "text-red-400 bg-red-400/10";
      case "Mistake":
        return "text-orange-400 bg-orange-400/10";
      case "Inaccuracy":
        return "text-yellow-400 bg-yellow-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const classificationBadge = (classification) => {
    switch (classification) {
      case "Blunder":
        return { symbol: "??", color: "text-red-400" };
      case "Mistake":
        return { symbol: "?!", color: "text-orange-400" };
      case "Inaccuracy":
        return { symbol: "?", color: "text-yellow-400" };
      default:
        return { symbol: "★", color: "text-green-400" };
    }
  };

  // Per-move accuracy from centipawn swing, then averaged separately
  // for White (odd moveNumber) and Black (even moveNumber)
  const accuracy = useMemo(() => {
    if (!results || results.length === 0) return null;

    const moveAccuracy = (swing) => {
      const loss = Math.abs(swing ?? 0);
      const acc = 103.1668 * Math.exp(-0.04354 * loss) - 3.1669;
      return Math.max(0, Math.min(100, acc));
    };

    const whiteMoves = results.filter((m) => m.moveNumber % 2 === 1);
    const blackMoves = results.filter((m) => m.moveNumber % 2 === 0);

    const avg = (moves) =>
      moves.length === 0
        ? null
        : moves.reduce((sum, m) => sum + moveAccuracy(m.swing), 0) /
          moves.length;

    return {
      white: avg(whiteMoves),
      black: avg(blackMoves),
    };
  }, [results]);

  return (
    <div className="min-h-screen bg-[#0a0e1c] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-400">Unmasked</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex gap-2 mb-6 bg-[#131826] border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setMode("bot")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
              mode === "bot"
                ? "bg-teal-500 text-[#0a0e1c]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Play vs Computer
          </button>
          <button
            onClick={() => setMode("pgn")}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
              mode === "pgn"
                ? "bg-teal-500 text-[#0a0e1c]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Paste PGN
          </button>
        </div>

        {mode === "bot" ? (
          <PlayBot onGameFinished={handleBotGameFinished} />
        ) : (
          <>
            <h2 className="text-lg font-semibold text-white mb-3">
              Paste Your Game (PGN)
            </h2>

            <textarea
              value={pgn}
              onChange={(e) => setPgn(e.target.value)}
              rows={10}
              placeholder='[Event "Casual Game"]&#10;...&#10;1. e4 e5 2. Nf3 Nc6 ...'
              className="w-full px-4 py-3 rounded-lg bg-[#131826] border border-gray-700 text-white font-mono text-sm focus:outline-none focus:border-teal-400"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !pgn.trim()}
              className="mt-4 px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 disabled:text-gray-500 text-[#0a0e1c] font-semibold text-sm transition"
            >
              Analyze
            </button>
          </>
        )}

        {loading && (
          <div className="mt-6 flex items-center gap-3 text-gray-400">
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">
              Analyzing your game — this can take 20-30 seconds...
            </span>
          </div>
        )}

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {results && (
          <div className="mt-8">
            <h3 className="text-white font-semibold mb-4">Results</h3>

            {accuracy && (
              <div className="flex gap-3 mb-4">
                {accuracy.white !== null && (
                  <div className="flex-1 bg-[#131826] border border-gray-700 rounded-lg px-4 py-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">White Accuracy</p>
                    <p className="text-teal-400 text-xl font-bold">
                      {accuracy.white.toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-[10px] mt-1">
                      Est. Rating: {estimateRating(accuracy.white)}
                    </p>
                  </div>
                )}
                {accuracy.black !== null && (
                  <div className="flex-1 bg-[#131826] border border-gray-700 rounded-lg px-4 py-3 text-center">
                    <p className="text-gray-400 text-xs mb-1">Black Accuracy</p>
                    <p className="text-teal-400 text-xl font-bold">
                      {accuracy.black.toFixed(1)}%
                    </p>
                    <p className="text-gray-500 text-[10px] mt-1">
                      Est. Rating: {estimateRating(accuracy.black)}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {results.map((move) => {
                const badge = classificationBadge(move.classification);
                return (
                  <div
                    key={move.moveNumber}
                    className="bg-[#131826] border border-gray-700 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">
                          {move.moveNumber}.
                        </span>
                        <span className="text-white font-mono text-sm">
                          {move.sanMove}
                        </span>
                        <span className={`font-bold text-sm ${badge.color}`}>
                          {badge.symbol}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs">
                          {move.evalAfter > 0 ? "+" : ""}
                          {(move.evalAfter / 100).toFixed(2)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${classificationColor(move.classification)}`}
                        >
                          {move.classification}
                        </span>
                      </div>
                    </div>

                    {move.explanation && (
                      <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                        {move.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyzeGame;
