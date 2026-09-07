import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../types/booking';
import { Check, Minus } from 'lucide-react';

export default function Vip() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>('FREE');
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserPlan = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.user.subscription);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du profil', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserPlan();
  }, [navigate]);

  const handleSubscribe = async (planType: string) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    setLoadingPlan(planType);

    try {
      const res = await fetch(`${API_URL}/api/payments/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planType })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Erreur lors de la souscription');
      if (data.url) window.location.assign(data.url);
      
    } catch (err) {
      console.error(err);
      alert('Impossible d’initier l’abonnement.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const BTN = 'inline-flex w-full items-center justify-center rounded-control px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed';

  const Feature = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
    <li className={`flex items-start gap-2.5 ${ok ? 'text-slate-700' : 'text-slate-400'}`}>
      {ok ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
      ) : (
        <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" strokeWidth={2.5} />
      )}
      <span>{children}</span>
    </li>
  );

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-card border border-slate-200 bg-white p-6 shadow-card">
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-5 h-8 w-32 rounded-full bg-slate-100" />
                <div className="mt-8 space-y-3">
                  <div className="h-3 w-full rounded-full bg-slate-100" />
                  <div className="h-3 w-4/5 rounded-full bg-slate-100" />
                </div>
                <div className="mt-8 h-10 w-full rounded-control bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12">
        <header className="mb-10 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Formules VIP</h1>
          <p className="mt-1 text-sm text-slate-500">
            Réductions permanentes, prestations offertes et accès prioritaire aux services réservés aux abonnés.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Free */}
          <div
            className={`flex flex-col rounded-card border bg-white p-6 shadow-card ${
              currentPlan === 'FREE' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200'
            }`}
          >
            <div className="flex-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Free</h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Gratuit</p>
              <p className="mt-1 text-sm text-slate-500">Pour découvrir la plateforme</p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
                <Feature ok>Publication d'avis</Feature>
                <Feature ok={false}>Réductions sur les prestations</Feature>
                <Feature ok={false}>Prestations offertes</Feature>
              </ul>
            </div>

            <button
              disabled={true}
              className={`${BTN} mt-8 ${
                currentPlan === 'FREE'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200'
              }`}
            >
              {currentPlan === 'FREE' ? 'Plan actuel' : 'Inclus par défaut'}
            </button>
          </div>

          {/* Bag Packer */}
          <div
            className={`flex flex-col rounded-card border bg-white p-6 shadow-card ${
              currentPlan === 'BAG_PACKER' ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200'
            }`}
          >
            <div className="flex-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-600">Bag Packer</h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                9,90 €<span className="text-base font-normal text-slate-400"> /mois</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">Pour les séjours réguliers</p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
                <Feature ok>Navigation sans publicité</Feature>
                <Feature ok>1 prestation offerte par an</Feature>
                <Feature ok={false}>Réduction permanente</Feature>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('bag_packer')}
              disabled={currentPlan === 'BAG_PACKER' || loadingPlan === 'bag_packer'}
              className={`${BTN} mt-8 ${
                currentPlan === 'BAG_PACKER'
                  ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200'
                  : 'bg-white text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
              }`}
            >
              {currentPlan === 'BAG_PACKER'
                ? 'Plan actuel'
                : loadingPlan === 'bag_packer'
                ? 'Redirection…'
                : 'Souscrire'}
            </button>
          </div>

          {/* Explorator — mis en avant */}
          <div
            className={`relative flex flex-col rounded-card border bg-white p-6 shadow-pop ${
              currentPlan === 'EXPLORATOR' ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-900/10 ring-1 ring-slate-900/5'
            }`}
          >
            {currentPlan !== 'EXPLORATOR' && (
              <span className="absolute -top-3 left-6 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
                Recommandé
              </span>
            )}

            <div className="flex-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Explorator</h2>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                19,00 €<span className="text-base font-normal text-slate-400"> /mois</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">L'offre la plus complète</p>

              <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
                <Feature ok>Réduction permanente de 5 %</Feature>
                <Feature ok>Accès prioritaire aux prestations VIP</Feature>
                <Feature ok>Navigation sans publicité</Feature>
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe('explorator')}
              disabled={currentPlan === 'EXPLORATOR' || loadingPlan === 'explorator'}
              className={`${BTN} mt-8 ${
                currentPlan === 'EXPLORATOR'
                  ? 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200'
                  : 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
              }`}
            >
              {currentPlan === 'EXPLORATOR'
                ? 'Plan actuel'
                : loadingPlan === 'explorator'
                ? 'Redirection…'
                : 'Souscrire'}
            </button>
          </div>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Paiement sécurisé par Stripe. Abonnement résiliable à tout moment.
        </p>
      </div>
    </div>
  );
}
