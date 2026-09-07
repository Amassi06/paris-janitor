import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../types/env';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Identifiants invalides');
      }

      if (data.user.role !== 'ADMIN') {
        throw new Error('Accès refusé. Privilèges administrateur requis.');
      }

      const token = data.token || data.accessToken;
      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      } else {
        throw new Error('Aucun token reçu dans la réponse.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur inattendue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow-xl border border-gray-200"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">PARIS JANITOR</h1>
          <p className="text-sm font-semibold text-red-600 uppercase tracking-widest mt-1">Espace Administrateur</p>
        </div>

        {error && (
          <div className="mb-6 rounded bg-red-50 p-3 text-sm font-medium text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Email professionnel</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
            placeholder="admin@paris-janitor.com"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-gray-900 py-2.5 font-medium text-white hover:bg-black disabled:opacity-50 transition"
        >
          {loading ? 'Authentification...' : 'Accéder au panel'}
        </button>
      </form>
    </div>
  );
}