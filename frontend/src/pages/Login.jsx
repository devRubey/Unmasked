import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });
      login(response.data);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1c] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-3xl font-bold text-teal-400 mb-2">Unmasked</h1>
        <p className="text-gray-400 mb-8">Sign in to analyze your games</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-[#131826] border border-gray-700 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-colors disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg bg-[#131826] border border-gray-700 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-colors disabled:opacity-50"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-[#0a0e1c] font-semibold transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0e1c] border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {loading && (
            <p className="text-gray-500 text-xs text-center">
              First sign-in can take up to a minute while the server wakes up.
            </p>
          )}
        </form>

        <p className="text-gray-400 text-sm mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-teal-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
