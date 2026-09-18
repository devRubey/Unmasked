import { useState, useCallback, useRef, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import apiClient from "../api/client";

const DIFFICULTY_LEVELS = [
  { label: "Beginner", elo: 1320 },
  { label: "Casual", elo: 1500 },
  { label: "Intermediate", elo: 1700 },
  { label: "Advanced", elo: 1900 },
  { label: "Expert", elo: 2100 },
  { label: "Master", elo: 2300 },
  { label: "Grandmaster", elo: 2500 },
  { label: "Elite Grandmaster", elo: 2700 },
  { label: "Impossible", elo: 3200 },
];

const ANIMATION_SPEEDS = {
  Instant: 0,
  Fast: 150,
  Smooth: 350,
};

function playTone(frequency, duration = 0.08, type = "sine") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // audio not supported/blocked
  }
}

function PlayBot({ onGameFinished }) {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState(gameRef.current.fen());
  const [difficultyIndex, setDifficultyIndex] = useState(1);
  const [playerColor, setPlayerColor] = useState("white");
  const [botThinking, setBotThinking] = useState(false);
  const [status, setStatus] = useState("Your move — you're playing White.");
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");

  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [highlightLastMove, setHighlightLastMove] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState("Fast");
  const [legalMoveSquares, setLegalMoveSquares] = useState({});
  const [lastMove, setLastMove] = useState(null);

  const currentDifficulty = DIFFICULTY_LEVELS[difficultyIndex];

  const playMoveSound = useCallback(
    (isCapture) => {
      if (!soundEnabled) return;
      playTone(isCapture ? 300 : 500);
    },
    [soundEnabled],
  );

  const playCheckSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(700, 0.12, "triangle");
  }, [soundEnabled]);

  const playIllegalSound = useCallback(() => {
    if (!soundEnabled) return;
    playTone(120, 0.15, "sawtooth");
  }, [soundEnabled]);

  const checkGameOver = useCallback(() => {
    const g = gameRef.current;
    if (g.isGameOver()) {
      setGameOver(true);
      let reason = "Game over.";
      if (g.isCheckmate()) {
        const winner = g.turn() === "w" ? "Black" : "White";
        const isPlayerWinner =
          (winner === "White" && playerColor === "white") ||
          (winner === "Black" && playerColor === "black");
        reason = `Checkmate — ${winner} (${isPlayerWinner ? "You" : "Bot"}) wins.`;
        if (soundEnabled) playTone(200, 0.3);
      } else if (g.isDraw()) {
        reason = "Game drawn.";
      }
      setStatus(reason);
      setGameOverReason(reason);
      setShowModal(true);
      return true;
    }

    if (g.isCheck()) {
      playCheckSound();
    }
    return false;
  }, [soundEnabled, playCheckSound, playerColor]);

  const makeBotMove = useCallback(async () => {
    setBotThinking(true);
    setStatus("Bot is thinking...");

    try {
      const response = await apiClient.post("/bot-move", {
        fen: gameRef.current.fen(),
        elo: currentDifficulty.elo,
      });

      const uciMove = response.data.move;
      const from = uciMove.slice(0, 2);
      const to = uciMove.slice(2, 4);
      const promotion = uciMove.length > 4 ? uciMove[4] : undefined;

      const moveResult = gameRef.current.move({ from, to, promotion });
      setFen(gameRef.current.fen());
      setLastMove({ from, to });
      playMoveSound(moveResult?.captured);

      if (!checkGameOver()) {
        setStatus("Your move.");
      }
    } catch (err) {
      console.error("Bot move failed:", err);
      setStatus("Bot move failed — check the backend is running.");
    } finally {
      setBotThinking(false);
    }
  }, [currentDifficulty, checkGameOver, playMoveSound]);

  const onDrop = useCallback(
    (sourceSquare, targetSquare) => {
      if (botThinking || gameOver) return false;

      const expectedTurn = playerColor === "white" ? "w" : "b";
      if (gameRef.current.turn() !== expectedTurn) {
        playIllegalSound();
        return false;
      }

      let moveResult;
      try {
        moveResult = gameRef.current.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q",
        });
      } catch {
        playIllegalSound();
        return false;
      }

      if (moveResult === null) {
        playIllegalSound();
        return false;
      }

      setFen(gameRef.current.fen());
      setLastMove({ from: sourceSquare, to: targetSquare });
      setLegalMoveSquares({});
      setGameStarted(true);
      playMoveSound(moveResult.captured);

      if (!checkGameOver()) {
        makeBotMove();
      }

      return true;
    },
    [
      botThinking,
      gameOver,
      playerColor,
      checkGameOver,
      makeBotMove,
      playIllegalSound,
      playMoveSound,
    ],
  );

  const onPieceDragBegin = useCallback(
    (piece, sourceSquare) => {
      if (!showLegalMoves || botThinking || gameOver) return;

      const moves = gameRef.current.moves({
        square: sourceSquare,
        verbose: true,
      });
      const squares = {};
      moves.forEach((move) => {
        const isCapture = move.flags.includes("c");
        squares[move.to] = {
          background: isCapture
            ? "radial-gradient(circle, rgba(239,68,68,0.35) 65%, transparent 70%)"
            : "radial-gradient(circle, rgba(45,212,191,0.5) 25%, transparent 30%)",
          borderRadius: "50%",
        };
      });
      setLegalMoveSquares(squares);
    },
    [showLegalMoves, botThinking, gameOver],
  );

  const onPieceDragEnd = useCallback(() => {
    setLegalMoveSquares({});
  }, []);

  // If playing Black, bot (White) needs to move first
  const startGameIfPlayingBlack = useCallback(() => {
    if (playerColor === "black" && gameRef.current.history().length === 0) {
      setGameStarted(true);
      makeBotMove();
    }
  }, [playerColor, makeBotMove]);

  const handleColorChange = (color) => {
    if (gameStarted) return;
    setPlayerColor(color);
    setStatus(
      color === "white"
        ? "Your move — you're playing White."
        : "Bot moves first — you're playing Black.",
    );
  };

  // Trigger bot's opening move whenever Black is selected on a fresh board
  useEffect(() => {
    startGameIfPlayingBlack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerColor]);

  const resetGame = () => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setGameOver(false);
    setGameStarted(false);
    setLastMove(null);
    setLegalMoveSquares({});
    setShowModal(false);
    setStatus(
      playerColor === "white"
        ? "Your move — you're playing White."
        : "Bot moves first — you're playing Black.",
    );
    startGameIfPlayingBlack();
  };

  const buildAndSendPgn = () => {
    const g = gameRef.current;
    const result = g.isCheckmate()
      ? g.turn() === "w"
        ? "0-1"
        : "1-0"
      : "1/2-1/2";

    g.header(
      "Event",
      "Casual Game",
      "Site",
      "Unmasked",
      "Date",
      new Date().toISOString().split("T")[0],
      "Round",
      "1",
      "White",
      playerColor === "white" ? "You" : `${currentDifficulty.label} Bot`,
      "Black",
      playerColor === "black" ? "You" : `${currentDifficulty.label} Bot`,
      "Result",
      result,
    );

    const pgn = g.pgn();
    if (onGameFinished) {
      onGameFinished(pgn);
    }
  };

  const handleAnalyze = () => {
    setShowModal(false);
    buildAndSendPgn();
  };

  const checkSquareStyle = {};
  if (gameRef.current.isCheck() && !gameOver) {
    const board = gameRef.current.board();
    const turnColor = gameRef.current.turn();
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === "k" && piece.color === turnColor) {
          const square = "abcdefgh"[file] + (8 - rank);
          checkSquareStyle[square] = {
            background:
              "radial-gradient(circle, rgba(239,68,68,0.65) 0%, rgba(239,68,68,0.15) 70%)",
          };
        }
      }
    }
  }

  const squareStyles = {
    ...(highlightLastMove && lastMove
      ? {
          [lastMove.from]: { backgroundColor: "rgba(250, 204, 21, 0.35)" },
          [lastMove.to]: { backgroundColor: "rgba(250, 204, 21, 0.35)" },
        }
      : {}),
    ...checkSquareStyle,
    ...legalMoveSquares,
  };

  return (
    <div className="max-w-md mx-auto relative">
      {/* Color + difficulty */}
      <div className="bg-[#131826] border border-gray-700 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-sm">Play as</span>
          <div className="flex gap-1">
            <button
              onClick={() => handleColorChange("white")}
              disabled={gameStarted}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                playerColor === "white"
                  ? "bg-teal-500 text-[#0a0e1c]"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              White
            </button>
            <button
              onClick={() => handleColorChange("black")}
              disabled={gameStarted}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${
                playerColor === "black"
                  ? "bg-teal-500 text-[#0a0e1c]"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Black
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold text-sm">Engine</span>
          <span className="text-teal-400 text-xs">
            {currentDifficulty.label}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={DIFFICULTY_LEVELS.length - 1}
          value={difficultyIndex}
          onChange={(e) => setDifficultyIndex(Number(e.target.value))}
          disabled={gameStarted}
          className="w-full accent-teal-400 disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between mt-1">
          {DIFFICULTY_LEVELS.map((level, i) => (
            <span
              key={level.label}
              className={`text-[10px] ${i === difficultyIndex ? "text-teal-400" : "text-gray-500"}`}
            >
              {level.elo >= 3000 ? "Max" : level.elo}
            </span>
          ))}
        </div>
        {gameStarted && !gameOver && (
          <p className="text-gray-500 text-[11px] mt-2">
            Color and difficulty locked — start a new game to change them.
          </p>
        )}
      </div>

      {/* Board settings toggles */}
      <div className="bg-[#131826] border border-gray-700 rounded-xl p-3 mb-4 flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={showLegalMoves}
            onChange={(e) => setShowLegalMoves(e.target.checked)}
            className="accent-teal-400"
          />
          Show legal moves
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={highlightLastMove}
            onChange={(e) => setHighlightLastMove(e.target.checked)}
            className="accent-teal-400"
          />
          Highlight last move
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="accent-teal-400"
          />
          Sounds
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          Speed:
          <select
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(e.target.value)}
            className="bg-[#0a0e1c] border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white"
          >
            {Object.keys(ANIMATION_SPEEDS).map((speed) => (
              <option key={speed} value={speed}>
                {speed}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <div
          className="rounded-lg overflow-hidden border border-gray-700"
          style={{ width: 400 }}
        >
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            onPieceDragBegin={onPieceDragBegin}
            onPieceDragEnd={onPieceDragEnd}
            customSquareStyles={squareStyles}
            boardWidth={400}
            boardOrientation={playerColor}
            animationDuration={ANIMATION_SPEEDS[animationSpeed]}
            customDarkSquareStyle={{ backgroundColor: "#3a3a3a" }}
            customLightSquareStyle={{ backgroundColor: "#e8e8e8" }}
          />
        </div>
      </div>

      {/* Status + controls */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-gray-400 text-sm">{status}</p>
        <div className="flex gap-2">
          <button
            onClick={resetGame}
            className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold transition"
          >
            New Game
          </button>
          {gameOver && !showModal && (
            <button
              onClick={handleAnalyze}
              className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#0a0e1c] text-xs font-semibold transition"
            >
              Analyze This Game
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-[#131826] border border-gray-700 rounded-xl p-6 max-w-sm w-full text-center">
            <h3 className="text-white text-lg font-bold mb-2">Game Over</h3>
            <p className="text-gray-300 text-sm mb-6">{gameOverReason}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#0a0e1c] font-semibold text-sm transition"
              >
                Analyze This Game
              </button>
              <button
                onClick={resetGame}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-semibold text-sm transition"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayBot;
