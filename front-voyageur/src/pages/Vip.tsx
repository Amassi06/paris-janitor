import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, type IProfile, type SubscriptionType } from '../types/booking';
import { Check, Minus } from 'lucide-react';

type Interval = 'MONTH' | 'YEAR';

const FORMULES = [
  {
    type: 'FREE' as SubscriptionType,
    nom: 'Free',
    accroche: 'Pour découvrir la plateforme',
    prix: { MONTH: 0, YEAR: 0 },
    cle: null,
    avantages: [
      { ok: false, texte: 'Navigation sans publicité' },
      { ok: true, texte: 'Commenter, publier des avis' },
      { ok: false, texte: 'Réduction permanente de 5 %' },
      { ok: false, texte: 'Prestations offertes' },
      { ok: false, texte: 'Accès prioritaire aux prestations VIP' },
      { ok: false, texte: 'Bonus de renouvellement' },
    ],
  },
  {
    type: 'BAG_PACKER' as SubscriptionType,
    nom: 'Bag Packer',
    accroche: 'Pour les séjours réguliers',
    prix: { MONTH: 9.9, YEAR: 113 },
    cle: 'bag_packer',
    avantages: [
      { ok: true, texte: 'Navigation sans publicité' },
      { ok: true, texte: 'Commenter, publier des avis' },
      { ok: false, texte: 'Réduction permanente de 5 %' },
      { ok: true, texte: '1 prestation offerte par an (moins de 80 €)' },
      { ok: false, texte: 'Accès prioritaire aux prestations VIP' },
      { ok: false, texte: 'Bonus de renouvellement' },
    ],
  },
  {
    type: 'EXPLORATOR' as SubscriptionType,
    nom: 'Explorator',
    accroche: "L'offre la plus complète",
    prix: { MONTH: 19, YEAR: 220 },
    cle: 'explorator',
    avantages: [
      { ok: true, texte: 'Navigation sans publicité' },
      { ok: true, texte: 'Commenter, publier des avis' },
      { ok: true, texte: 'Réduction permanente de 5 %' },
      { ok: true, texte: '1 prestation offerte par semestre, sans plafond' },
      { ok: true, texte: 'Accès prioritaire aux prestations VIP' },
      { ok: true, texte: '-10 % au renouvellement annuel' },
    ],
  },
];

const formatPrix = (montant: number) =>
  montant.toLocaleString('fr-FR', { minimumFractionDigits: montant % 1 === 0 ? 0 : 2 });

export default function Vip() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [interval, setInterval] = useState<Interval>('MONTH');
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
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data.user);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du profil', err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserPlan();
  }, [navigate]);

  const handleSubscribe = async (cle: string) => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const plan = `${cle}_${interval.toLowerCase()}`;
    setLoadingPlan(plan);

    try {
      const res = await fetch(`${API_URL}/api/payments/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de la souscription');
      if (data.url) window.location.assign(data.url);
    } catch (err) {
      console.error(err);
      alert("Impossible d'initier l'abonnement.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = profile?.subscription ?? 'FREE';

  // Annexe 2 : -10 % au renouvellement, uniquement Explorator et uniquement en annuel.
  const bonusRenouvellement =
    currentPlan === 'EXPLORATOR' && interval === 'YEAR' && (profile?.renewal_count ?? 0) > 0;

  const BTN =
    'inline-flex w-full items-center justify-center rounded-control px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed';

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8 sm:py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-card border border-slate-200 bg-white p-6 shadow-card">
                <div className="h-4 w-24 rounded-full bg-slate-200" />
                <div className="mt-5 h-8 w-32 rounded-full bg-slate-100" />
                <div className="mt-8 h-40 rounded-control bg-slate-100" />
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
        <header className="mb-8 max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Formules VIP</h1>
          <p className="mt-1 text-sm text-slate-500">
            Réductions permanentes, prestations offertes et accès prioritaire aux services réservés aux abonnés.
          </p>
        </header>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-control bg-slate-200/70 p-1">
            {(['MONTH', 'YEAR'] as Interval[]).map((valeur) => (
              <button
                key={valeur}
                onClick={() => setInterval(valeur)}
                className={`rounded-[0.4rem] px-4 py-1.5 text-sm font-medium transition-colors ${
                  interval === valeur ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {valeur === 'MONTH' ? 'Mensuel' : 'Annuel'}
              </button>
            ))}
          </div>

          
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FORMULES.map((formule) => {
            const estPlanActuel = currentPlan === formule.type;
            const prix = formule.prix[interval];
            const bonus = bonusRenouvellement && formule.type === 'EXPLORATOR';
            const prixPaye = bonus ? Math.round(prix * 0.9 * 100) / 100 : prix;
            const planKey = formule.cle ? `${formule.cle}_${interval.toLowerCase()}` : '';

            return (
              <div
                key={formule.type}
                className={`flex flex-col rounded-card border bg-white p-6 shadow-card ${
                  estPlanActuel ? 'border-brand-600 ring-1 ring-brand-600' : 'border-slate-200'
                }`}
              >
                <div className="flex-1">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{formule.nom}</h2>

                  {prix === 0 ? (
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Gratuit</p>
                  ) : (
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                      {bonus && <span className="mr-2 text-lg font-normal text-slate-400 line-through">{formatPrix(prix)} €</span>}
                      {formatPrix(prixPaye)} €
                      <span className="text-base font-normal text-slate-400">
                        {interval === 'MONTH' ? ' /mois' : ' /an'}
                      </span>
                    </p>
                  )}

                  <p className="mt-1 text-sm text-slate-500">
                    {bonus ? 'Bonus renouvellement -10 % appliqué' : formule.accroche}
                  </p>

                  <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-sm">
                    {formule.avantages.map((avantage) => (
                      <li
                        key={avantage.texte}
                        className={`flex items-start gap-2.5 ${avantage.ok ? 'text-slate-700' : 'text-slate-400'}`}
                      >
                        {avantage.ok ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                        ) : (
                          <Minus className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" strokeWidth={2.5} />
                        )}
                        <span>{avantage.texte}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => formule.cle && handleSubscribe(formule.cle)}
                  disabled={!formule.cle || estPlanActuel || loadingPlan === planKey}
                  className={`${BTN} mt-8 ${
                    estPlanActuel
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200'
                      : !formule.cle
                      ? 'bg-slate-50 text-slate-400 ring-1 ring-inset ring-slate-200'
                      : 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                  }`}
                >
                  {estPlanActuel
                    ? 'Plan actuel'
                    : !formule.cle
                    ? 'Inclus par défaut'
                    : loadingPlan === planKey
                    ? 'Redirection…'
                    : 'Souscrire'}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-xs text-slate-400">
          Paiement sécurisé par Stripe. Abonnement résiliable à tout moment.
        </p>
      </div>
    </div>
  );
}
