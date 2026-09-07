import { useState, type FormEventHandler } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../types/booking';
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-md border border-gray-200"
      >
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
          {isRegister ? 'Inscription' : 'Connexion'}
        </h1>

        {successMsg && (
          <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700 border border-green-200">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="test@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading 
            ? 'Traitement en cours...' 
            : isRegister ? "S'inscrire" : 'Se connecter'}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              const nextIsRegister = !isRegister;
              setIsRegister(nextIsRegister);
              navigate(nextIsRegister ? '/register' : '/login');
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            {isRegister 
              ? "Déjà un compte ? Se connecter" 
              : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </form>
    </div>
  );
}