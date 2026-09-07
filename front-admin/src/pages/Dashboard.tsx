import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../types/env';
import type { ReservationDTO } from '../types/reservation';
import type { ServiceDTO } from '../types/service';
import type { UserDTO } from '../types/user';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'utilisateurs'>('reservations');
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();
  
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loadingResa, setLoadingResa] = useState(true);

  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [newService, setNewService] = useState({ nom: '', description: '', prix_base: 0 });
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

useEffect(() => {
    // A. Déclaration des requêtes internes au useEffect
    const fetchReservations = async () => {
      try {
        const res = await fetch(`${API_URL}/api/bookings`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setReservations(await res.json());
      } catch (error) { console.error('Erreur', error); } 
      finally { setLoadingResa(false); }
    };

    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/services`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setServices(await res.json());
      } catch (error) { console.error('Erreur', error); } 
      finally { setLoadingServices(false); }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setUsers(await res.json());
      } catch (error) { console.error('Erreur', error); }
      finally { setLoadingUsers(false); }
    };

    // B. Exécution conditionnelle
    if (activeTab === 'reservations') fetchReservations();
    if (activeTab === 'services') fetchServices();
    if (activeTab === 'utilisateurs') fetchUsers();

  }, [activeTab, token]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        const created = await res.json();
        setServices([...services, created]);
        setNewService({ nom: '', description: '', prix_base: 0 }); 
      }
    } catch (error) { console.error('Erreur création', error); }
  };

  // Action : Modifier un service
  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      const res = await fetch(`${API_URL}/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          nom: editingService.nom,
          description: editingService.description,
          prix_base: editingService.prix_base,
          actif: editingService.actif
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setServices(services.map(s => s._id === updated._id ? updated : s));
        setEditingService(null); 
      }
    } catch (error) { console.error('Erreur modification', error); }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Supprimer ce service définitivement ?')) return;
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setServices(services.filter(s => s._id !== id));
      }
    } catch (error) { console.error('Erreur suppression', error); }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-black tracking-tight">PARIS JANITOR</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm transition ${activeTab === 'reservations' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            Réservations
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm transition ${activeTab === 'services' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
          >
            Catalogue Services
          </button>
          <button 
            onClick={() => setActiveTab('utilisateurs')}
            className={`w-full text-left px-4 py-2.5 rounded font-medium text-sm transition ${activeTab === 'utilisateurs' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
            >
            Utilisateurs
            </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="w-full bg-red-500/10 text-red-500 py-2 rounded text-sm font-medium">Déconnexion</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        
        {activeTab === 'reservations' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Toutes les réservations</h1>
            {loadingResa ? <p>Chargement...</p> : (
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
          </>
        )}

        {activeTab === 'services' && (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Catalogue des Services</h1>
            
            {editingService ? (
              <form onSubmit={handleUpdateService} className="bg-blue-50 p-6 rounded-lg shadow border border-blue-200 mb-8 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-900 mb-1">Modifier le nom</label>
                  <input required type="text" value={editingService.nom} onChange={e => setEditingService({...editingService, nom: e.target.value})} className="w-full border border-blue-300 rounded p-2 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-blue-900 mb-1">Modifier la description</label>
                  <input required type="text" value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} className="w-full border border-blue-300 rounded p-2 text-sm" />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-blue-900 mb-1">Prix (€)</label>
                  <input required type="number" min="0" value={editingService.prix_base} onChange={e => setEditingService({...editingService, prix_base: Number(e.target.value)})} className="w-full border border-blue-300 rounded p-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition">Sauver</button>
                  <button type="button" onClick={() => setEditingService(null)} className="bg-white text-gray-600 px-4 py-2 rounded border border-gray-300 font-medium hover:bg-gray-50 transition">Annuler</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateService} className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service</label>
                  <input required type="text" value={newService.nom} onChange={e => setNewService({...newService, nom: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Ex: Ménage complet" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input required type="text" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="Ex: Nettoyage 2h" />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                  <input required type="number" min="0" value={newService.prix_base} onChange={e => setNewService({...newService, prix_base: Number(e.target.value)})} className="w-full border rounded p-2 text-sm" />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded font-medium hover:bg-black transition">
                  Ajouter
                </button>
              </form>
            )}

            {loadingServices ? <p>Chargement...</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <div key={service._id} className="bg-white p-6 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{service.nom}</h3>
                      <p className="text-gray-500 text-sm mt-1">{service.description}</p>
                      <p className="text-2xl font-black text-gray-900 mt-4">{service.prix_base} €</p>
                    </div>
                  <button 
                        onClick={() => setEditingService(service)}
                        className="flex-1 border border-yellow-200 text-yellow-600 hover:bg-yellow-50 py-2 rounded text-sm font-medium transition"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service._id)}
                        className="flex-1 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded text-sm font-medium transition"
                      >
                        Supprimer
                      </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'utilisateurs' && (
  <>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Utilisateurs</h1>
    {loadingUsers ? <p>Chargement...</p> : (
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rôle</th>
              <th className="px-6 py-4">Abonnement</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{user.subscription}</td>
                <td className="px-6 py-4">
                  <button className="text-red-600 hover:text-red-800 font-medium text-sm transition">
                    Bannir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
)}
      </main>
    </div>
  );
}