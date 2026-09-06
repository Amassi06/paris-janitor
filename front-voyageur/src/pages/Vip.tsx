import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

  if (loadingUser) return <div className="p-8 text-center">Chargement des formules...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Formules VIP</h1>
          <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline">
            Retour au Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className={`bg-white p-6 rounded-lg shadow-sm border flex flex-col justify-between ${currentPlan === 'FREE' ? 'border-gray-800 ring-2 ring-gray-800' : 'border-gray-200'}`}>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Free</h2>
              <p className="mt-4 text-3xl font-extrabold">Gratuit</p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li>✔ Publication d'avis</li>
                <li>❌ Réductions sur les prestations</li>
                <li>❌ Prestations offertes</li>
              </ul>
            </div>
            <button 
              disabled={true} 
              className={`mt-8 w-full py-2 rounded font-medium ${currentPlan === 'FREE' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {currentPlan === 'FREE' ? 'Plan actuel' : 'Inclus par défaut'}
            </button>
          </div>

          {/* Bag Packer */}
          <div className={`bg-white p-6 rounded-lg shadow-sm border relative flex flex-col justify-between ${currentPlan === 'BAG_PACKER' ? 'border-blue-600 ring-2 ring-blue-600' : 'border-blue-300'}`}>
            {currentPlan !== 'BAG_PACKER' && (
              <span className="absolute -top-3 left-1/2 -transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 text-xs font-bold rounded-full">
                Populaire
              </span>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">Bag Packer</h2>
              <p className="mt-4 text-3xl font-extrabold">9,90 € <span className="text-sm font-normal text-gray-500">/mois</span></p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li>✔ Sans publicités</li>
                <li>✔ 1 prestation offerte / an</li>
              </ul>
            </div>
            <button 
              onClick={() => handleSubscribe('bag_packer')}
              disabled={currentPlan === 'BAG_PACKER' || loadingPlan === 'bag_packer'}
              className={`mt-8 w-full py-2 rounded font-medium transition ${currentPlan === 'BAG_PACKER' ? 'bg-blue-600 text-white cursor-not-allowed opacity-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {currentPlan === 'BAG_PACKER' ? 'Plan actuel' : loadingPlan === 'bag_packer' ? 'Redirection...' : 'Souscrire'}
            </button>
          </div>

          {/* Explorator */}
          <div className={`bg-white p-6 rounded-lg shadow-sm border flex flex-col justify-between ${currentPlan === 'EXPLORATOR' ? 'border-gray-900 ring-2 ring-gray-900' : 'border-gray-200'}`}>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Explorator</h2>
              <p className="mt-4 text-3xl font-extrabold">19,00 € <span className="text-sm font-normal text-gray-500">/mois</span></p>
              <ul className="mt-6 space-y-3 text-sm text-gray-600">
                <li>✔ Réduction de 5%</li>
                <li>✔ Accès prioritaire VIP</li>
              </ul>
            </div>
            <button 
              onClick={() => handleSubscribe('explorator')}
              disabled={currentPlan === 'EXPLORATOR' || loadingPlan === 'explorator'}
              className={`mt-8 w-full py-2 rounded font-medium transition ${currentPlan === 'EXPLORATOR' ? 'bg-gray-900 text-white cursor-not-allowed opacity-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
            >
              {currentPlan === 'EXPLORATOR' ? 'Plan actuel' : loadingPlan === 'explorator' ? 'Redirection...' : 'Souscrire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}