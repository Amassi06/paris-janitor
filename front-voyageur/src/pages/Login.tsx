import { useState, type FormEventHandler } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../types/booking';
import { Check, CircleAlert } from 'lucide-react';
export default function Login() {
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la requête');
      }

      if (isRegister) {
        setIsRegister(false);
        setSuccessMsg("Compte créé avec succès. Vous pouvez maintenant vous connecter.");
        setPassword(''); 
      } else {
        const token = data.token || data.accessToken;
        if (token) {
          localStorage.setItem('token', token);
          navigate('/dashboard');
        } else {
          throw new Error('Aucun token reçu dans la réponse du serveur');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  const INPUT =
    'w-full rounded-control border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none';

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">
            PJ
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">Paris Janitor</h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Espace voyageur
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card border border-slate-200 bg-white p-7 shadow-card">
          <h2 className="mb-6 text-center text-sm font-semibold text-slate-900">
            {isRegister ? 'Créer un compte' : 'Connexion à votre espace'}
          </h2>

          {successMsg && (
            <div className="mb-6 flex items-start gap-2.5 rounded-control border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.5} />
              <p>{successMsg}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                VIVE ALGERIE
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={INPUT}
                placeholder="vous@exemple.com"
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
                autoComplete={isRegister ? 'new-password' : 'current-password'}
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
            className="mt-7 w-full rounded-control bg-brand-600 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Traitement en cours…' : isRegister ? "S'inscrire" : 'Se connecter'}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              type="button"
              onClick={() => {
                const nextIsRegister = !isRegister;
                setIsRegister(nextIsRegister);
                navigate(nextIsRegister ? '/register' : '/login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="font-medium text-brand-600 underline-offset-4 hover:underline"
            >
              {isRegister ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </form>

       
      </div>
    </div>
  );
}
