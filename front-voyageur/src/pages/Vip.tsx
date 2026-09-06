import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Vip() {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await fetch(`${API_URL}/api/payments/subscription/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        navigate('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url; 
      } else {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.message || 'Impossible de créer la session de paiement'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erreur réseau.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">Devenez VIP</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Formule Free */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Free</h2>
            <p className="mt-4 text-3xl font-extrabold">Gratuit</p>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li>✔ Commenter, publier des avis</li>
              <li>❌ Présence de publicités</li>
            </ul>
            <button disabled className="mt-8 w-full bg-gray-200 text-gray-500 py-2 rounded font-medium">
              Plan actuel
            </button>
          </div>

          {/* Formule Bag Packer */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-bold rounded-bl-lg rounded-tr-lg">Populaire</div>
            <h2 className="text-xl font-bold text-gray-800">Bag Packer</h2>
            <p className="mt-4 text-3xl font-extrabold">9,90 € <span className="text-lg font-normal text-gray-500">/mois</span></p>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li>✔ Sans publicité</li>
              <li>✔ 1 prestation offerte/an (max 80€)</li>
            </ul>
            <button
              onClick={() => handleSubscribe('bag_packer')}
              disabled={loadingPlan === 'bag_packer'}
              className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium transition disabled:opacity-50"
            >
              {loadingPlan === 'bag_packer' ? 'Redirection...' : 'Souscrire'}
            </button>
          </div>

          {/* Formule Explorator */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Explorator</h2>
            <p className="mt-4 text-3xl font-extrabold">19,00 € <span className="text-lg font-normal text-gray-500">/mois</span></p>
            <ul className="mt-6 space-y-4 text-gray-600">
              <li>✔ Réduction permanente de 5%</li>
              <li>✔ Accès prioritaire</li>
              <li>✔ 1 prestation offerte/semestre</li>
            </ul>
            <button
              onClick={() => handleSubscribe('explorator')}
              disabled={loadingPlan === 'explorator'}
              className="mt-8 w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded font-medium transition disabled:opacity-50"
            >
              {loadingPlan === 'explorator' ? 'Redirection...' : 'Souscrire'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}