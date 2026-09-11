import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

function AnalyzeGame() {
  const [pgn, setPgn] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    setError('');
    setResults(null);
    setLoading(true);

    try {
      const response = await apiClient.post('/analyze-game', pgn, {
        headers: { 'Content-Type': 'text/plain' },
      });
      setResults(response.data);
    } catch (err) {
      setError('Could not analyze this game. Check your PGN format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const classificationColor = (classification) => {
    switch (classification) {
      case 'Blunder': return 'text-red-400 bg-red-400/10';
      case 'Mistake': return 'text-orange-400 bg-orange-400/10';
      case 'Inaccuracy': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1c] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-400">Unmasked</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <h2 className="text-lg font-semibold text-white mb-3">Paste Your Game (PGN)</h2>

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
          {loading && (
                <div className="mt-6 flex items-center gap-3 text-gray-400">
                    <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Analyzing your game — this can take 20-30 seconds...</span>
                </div>
            )}
        </button>

        {error && <p className="text-red-400 mt-4">{error}</p>}

        {results && (
          <div className="mt-8">
            <h3 className="text-white font-semibold mb-4">Results</h3>
            <div className="space-y-2">
              {results.map((move) => (
                <div
                  key={move.moveNumber}
                  className="flex items-center justify-between bg-[#131826] border border-gray-700 rounded-lg px-4 py-3"
                >
                  <div>
                    <span className="text-gray-400 text-sm mr-2">{move.moveNumber}.</span>
                    <span className="text-white font-mono text-sm">{move.move}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-xs">
                      {move.evalAfter > 0 ? '+' : ''}{(move.evalAfter / 100).toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${classificationColor(move.classification)}`}>
                      {move.classification}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyzeGame;