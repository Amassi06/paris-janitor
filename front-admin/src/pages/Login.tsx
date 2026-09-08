import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../types/env';
import { CircleAlert } from 'lucide-react';

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
        credentials: 'include',
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

  const INPUT =
    'w-full rounded-control border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-slate-900 focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            PJ
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Paris Janitor</h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Espace administrateur
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-slate-200 bg-white p-7 shadow-card">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email professionnel
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
                placeholder="admin@paris-janitor.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={INPUT}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-control bg-slate-900 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? 'Authentification…' : 'Accéder au panel'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Accès restreint aux comptes disposant du rôle administrateur.
        </p>
      </div>
    </div>
  );
}
