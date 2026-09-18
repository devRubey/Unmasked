import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

function GameDetail() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGame() {
      try {
        const response = await apiClient.get(`/games/${id}`);
        setResults(response.data.moves);
      } catch (err) {
        setError('Could not load this game.');
      } finally {
        setLoading(false);
      }
    }

    fetchGame();
  }, [id]);

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

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {results && (
          <div className="space-y-2">
            {results.map((move) => (
              <div
                key={move.moveNumber}
                className="bg-[#131826] border border-gray-700 rounded-lg px-4 py-3"
              >
                <div className="flex items-center justify-between">
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

                {move.explanation && (
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                    {move.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GameDetail;