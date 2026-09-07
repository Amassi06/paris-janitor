import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../types/env';
import type { ReservationDTO } from '../types/reservation';
export default function Dashboard() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        if (res.ok) setReservations(data);
      } catch (error) {
        console.error('Erreur réseau', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-black tracking-tight">PARIS JANITOR</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full text-left px-4 py-2.5 rounded bg-gray-800 text-white font-medium text-sm">Réservations</button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-2 rounded text-sm font-medium">Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Toutes les réservations</h1>
        
        {loading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Prix</th>
                  <th className="px-6 py-4">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reservations.map((resa) => (
                  <tr key={resa._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{resa.id_voyageur?.email || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{resa.id_service?.nom || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(resa.date_prestation).toLocaleDateString('fr-FR')}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{resa.prix_final} €</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${resa.statut === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {resa.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}