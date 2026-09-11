import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await apiClient.post('/auth/register', { username, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try a different username.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0e1c] px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <h1 className="text-3xl font-bold text-teal-400 mb-2">Unmasked</h1>
        <p className="text-gray-400 mb-8">Create your account</p>

        {success ? (
          <p className="text-teal-400">Account created! Redirecting to login...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#131826] border border-gray-700 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#131826] border border-gray-700 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[#131826] border border-gray-700 text-white focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 transition-colors"
                required
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#0a0e1c] font-semibold transition"
            >
              Create Account
            </button>
          </form>
        )}

        <p className="text-gray-400 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;