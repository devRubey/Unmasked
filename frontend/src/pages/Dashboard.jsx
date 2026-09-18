import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await apiClient.get("/my-games");
        setGames(response.data);
      } catch (err) {
        setError("Could not load your games");
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0e1c] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-teal-400">Unmasked</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Log out
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Your Games</h2>
          <button
            onClick={() => navigate("/analyze")}
            className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#0a0e1c] font-semibold text-sm transition"
          >
            + New Analysis
          </button>
        </div>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && games.length === 0 && (
          <div className="bg-[#131826] border border-dashed border-gray-700 rounded-xl p-12 text-center animate-fade-in">
            <p className="text-gray-500 text-4xl mb-3">♟</p>
            <p className="text-gray-300 font-medium mb-1">
              No games analyzed yet
            </p>
            <p className="text-gray-500 text-sm">
              Paste a PGN to see where your games go wrong.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {games.map((game, index) => (
            <div
              key={game.id}
              onClick={() => navigate(`/games/${game.id}`)}
              style={{ animationDelay: `${index * 60}ms` }}
              className="bg-[#131826] border border-gray-700 rounded-lg p-4 hover:border-teal-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/5 transition-all cursor-pointer animate-fade-in"
            >
              <p className="text-white text-sm">Game #{game.id}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(game.analyzedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
