import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../types/env';
import type { ReservationDTO } from '../types/reservation';
import type { ServiceDTO } from '../types/service';
import type { UserDTO } from '../types/user';
import type { InvoiceDTO } from '../types/invoice';
import { CalendarDays, LayoutGrid, Users, LogOut, Star, Receipt } from 'lucide-react';


const STATUT_STYLE: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  COMPLETED: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
};

const STATUT_LABEL: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Payée',
  COMPLETED: 'Réalisée',
  CANCELLED: 'Annulée',
};

const CARD = 'rounded-card border border-slate-200 bg-white shadow-card';
const INPUT =
  'w-full rounded-control border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-none';
const BTN = 'inline-flex items-center justify-center gap-1.5 rounded-control px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50';
const BTN_DARK = `${BTN} bg-slate-900 text-white shadow-sm hover:bg-slate-800`;
const BTN_BRAND = `${BTN} bg-brand-600 text-white shadow-sm hover:bg-brand-700`;
const BTN_OUTLINE = `${BTN} bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50`;
const BTN_DANGER = `${BTN} bg-white text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50`;
const TH = 'px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500';
const TD = 'px-6 py-4 align-middle';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'services' | 'utilisateurs' | 'factures'>('reservations');
  const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();
  
  const [reservations, setReservations] = useState<ReservationDTO[]>([]);
  const [loadingResa, setLoadingResa] = useState(true);

  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  
  const [newService, setNewService] = useState({ nom: '', description: '', prix_base: 0, vip_only: false });
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

useEffect(() => {
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

    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/invoices`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setInvoices(await res.json());
      } catch (error) { console.error('Erreur', error); }
      finally { setLoadingInvoices(false); }
    };

    if (activeTab === 'reservations') fetchReservations();
    if (activeTab === 'services') fetchServices();
    if (activeTab === 'utilisateurs') fetchUsers();
    if (activeTab === 'factures') fetchInvoices();

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
        setNewService({ nom: '', description: '', prix_base: 0, vip_only: false }); 
      }
    } catch (error) { console.error('Erreur création', error); }
  };

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
          actif: editingService.actif,
          vip_only: editingService.vip_only
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
    } catch (error) { console.error('Erreur suppression service', error); }
  };

  const handleToggleBan = async (id: string, banned: boolean) => {
    const action = banned ? 'Bannir' : 'Débannir';
    if (!window.confirm(`${action} cet utilisateur ?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/auth/users/${id}/ban`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ banned })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');

      setUsers(users.map(u => (u._id === id ? { ...u, banned: data.banned } : u)));
    } catch (error) {
      console.error('Erreur bannissement', error);
      alert(error instanceof Error ? error.message : 'Erreur réseau');
    }
  };

  const handleUpdateSubscription = async (id: string, subscription: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subscription })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');

      setUsers(users.map(u => (u._id === id ? { ...u, subscription: data.subscription } : u)));
    } catch (error) {
      console.error('Erreur abonnement', error);
      alert(error instanceof Error ? error.message : 'Erreur réseau');
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/invoices/${bookingId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Facture introuvable');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      console.error(error);
      alert("Impossible d'ouvrir la facture.");
    }
  };

  const handleUpdateStatus = async (id: string, statut: 'COMPLETED' | 'CANCELLED') => {
    const action = statut === 'COMPLETED'
      ? 'marquer cette prestation comme réalisée'
      : 'annuler cette réservation';
    if (!window.confirm(`Confirmer : ${action} ?`)) return;

    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ statut })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors du changement de statut');

      setReservations(reservations.map(r => (r._id === id ? { ...r, statut: data.statut } : r)));
    } catch (error) {
      console.error('Erreur changement de statut', error);
      alert(error instanceof Error ? error.message : 'Erreur réseau');
    }
  };

  const tabs = [
    { id: 'reservations', label: 'Réservations', icon: <CalendarDays className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { id: 'services', label: 'Catalogue', icon: <LayoutGrid className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { id: 'utilisateurs', label: 'Utilisateurs', icon: <Users className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { id: 'factures', label: 'Factures & règlements', icon: <Receipt className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
  ] as const;

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR ADMIN */}
      <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-white">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold ring-1 ring-inset ring-white/15">
              PJ
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Paris Janitor</p>
              <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Administration
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-white transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-control px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">

          {/* ---------------- RÉSERVATIONS ---------------- */}
          {activeTab === 'reservations' && (
            <>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Réservations</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Suivez le paiement, clôturez les prestations réalisées et gérez les annulations.
                  </p>
                </div>
                {!loadingResa && reservations.length > 0 && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                    {reservations.length} au total
                  </span>
                )}
              </header>

              {loadingResa ? (
                <div className={`${CARD} divide-y divide-slate-100`}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse px-6 py-5">
                      <div className="h-3.5 w-56 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="rounded-card border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <h2 className="text-sm font-semibold text-slate-900">Aucune réservation</h2>
                  <p className="mt-1 text-sm text-slate-500">Les réservations des voyageurs apparaîtront ici.</p>
                </div>
              ) : (
                <div className={`${CARD} overflow-x-auto`}>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr>
                        <th className={TH}>Client</th>
                        <th className={TH}>Service</th>
                        <th className={TH}>Date</th>
                        <th className={`${TH} text-right`}>Prix</th>
                        <th className={TH}>Statut</th>
                        <th className={TH}>Avis</th>
                        <th className={`${TH} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reservations.map((resa) => (
                        <tr key={resa._id} className="transition-colors hover:bg-slate-50/70">
                          <td className={`${TD} font-medium text-slate-900`}>
                            <span className="block max-w-[14rem] wrap-anywhere">
                              {resa.id_voyageur?.email || <span className="text-slate-400">—</span>}
                            </span>
                          </td>
                          <td className={`${TD} text-slate-600`}>
                            <span className="block max-w-[12rem] wrap-anywhere">
                              {resa.id_service?.nom || <span className="text-slate-400">—</span>}
                            </span>
                          </td>
                          <td className={`${TD} whitespace-nowrap text-slate-500`}>
                            {formatDate(resa.date_prestation)}
                          </td>
                          <td className={`${TD} whitespace-nowrap text-right font-semibold tabular-nums text-slate-900`}>
                            {resa.prix_final} €
                          </td>
                          <td className={TD}>
                            <span
                              className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUT_STYLE[resa.statut]}`}
                            >
                              {STATUT_LABEL[resa.statut]}
                            </span>
                          </td>
                          <td className={TD}>
                            {resa.note ? (
                              <div className="max-w-[16rem]">
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                                  <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                                  {resa.note}/5
                                </span>
                                {resa.commentaire && (
                                  <p
                                    className="mt-1 line-clamp-2 wrap-anywhere text-xs text-slate-500"
                                    title={resa.commentaire}
                                  >
                                    {resa.commentaire}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className={`${TD} whitespace-nowrap text-right`}>
                            <div className="flex justify-end gap-2">
                              {resa.statut === 'CONFIRMED' && (
                                <button
                                  onClick={() => handleUpdateStatus(resa._id, 'COMPLETED')}
                                  className={`${BTN_BRAND} px-3 py-1.5 text-xs`}
                                >
                                  Marquer réalisée
                                </button>
                              )}
                              {(resa.statut === 'PENDING' || resa.statut === 'CONFIRMED') && (
                                <button
                                  onClick={() => handleUpdateStatus(resa._id, 'CANCELLED')}
                                  className={`${BTN_DANGER} px-3 py-1.5 text-xs`}
                                >
                                  Annuler
                                </button>
                              )}
                              {(resa.statut === 'COMPLETED' || resa.statut === 'CANCELLED') && (
                                <span className="text-xs text-slate-300">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ---------------- CATALOGUE ---------------- */}
          {activeTab === 'services' && (
            <>
              <header className="mb-8">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Catalogue des services</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Créez, modifiez et retirez les prestations proposées aux voyageurs.
                </p>
              </header>

              {editingService ? (
                <form
                  onSubmit={handleUpdateService}
                  className="mb-8 rounded-card border border-brand-200 bg-brand-50/60 p-6"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                    <h2 className="text-sm font-semibold text-brand-900">Modification en cours</h2>
                  </div>

                  <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">Nom</label>
                      <input
                        required
                        type="text"
                        value={editingService.nom}
                        onChange={(e) => setEditingService({ ...editingService, nom: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">Description</label>
                      <input
                        required
                        type="text"
                        value={editingService.description}
                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                        className={INPUT}
                      />
                    </div>
                    <div className="w-28">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">Prix (€)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={editingService.prix_base}
                        onChange={(e) => setEditingService({ ...editingService, prix_base: Number(e.target.value) })}
                        className={INPUT}
                      />
                    </div>
                    <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={editingService.vip_only}
                        onChange={(e) => setEditingService({ ...editingService, vip_only: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                      />
                      Réservé VIP
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" className={BTN_BRAND}>Enregistrer</button>
                      <button type="button" onClick={() => setEditingService(null)} className={BTN_OUTLINE}>
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateService} className={`${CARD} mb-8 p-6`}>
                  <h2 className="mb-4 text-sm font-semibold text-slate-900">Ajouter une prestation</h2>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">Nom du service</label>
                      <input
                        required
                        type="text"
                        value={newService.nom}
                        onChange={(e) => setNewService({ ...newService, nom: e.target.value })}
                        className={INPUT}
                        placeholder="Ex : Ménage complet"
                      />
                    </div>
                    <div className="min-w-[12rem] flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">Description</label>
                      <input
                        required
                        type="text"
                        value={newService.description}
                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                        className={INPUT}
                        placeholder="Ex : Nettoyage 2h, produits inclus"
                      />
                    </div>
                    <div className="w-28">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">Prix (€)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        value={newService.prix_base}
                        onChange={(e) => setNewService({ ...newService, prix_base: Number(e.target.value) })}
                        className={INPUT}
                      />
                    </div>
                    <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={newService.vip_only}
                        onChange={(e) => setNewService({ ...newService, vip_only: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 accent-brand-600"
                      />
                      Réservé VIP
                    </label>
                    <button type="submit" className={BTN_DARK}>Ajouter</button>
                  </div>
                </form>
              )}

              {loadingServices ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className={`${CARD} animate-pulse p-6`}>
                      <div className="h-4 w-32 rounded-full bg-slate-200" />
                      <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
                      <div className="mt-6 h-7 w-20 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : services.length === 0 ? (
                <div className="rounded-card border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <h2 className="text-sm font-semibold text-slate-900">Catalogue vide</h2>
                  <p className="mt-1 text-sm text-slate-500">Ajoutez une première prestation ci-dessus.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <div key={service._id} className={`${CARD} flex flex-col p-6`}>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold tracking-tight text-slate-900">
                            {service.nom}
                            {service.vip_only && (
                              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 align-middle text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                VIP
                              </span>
                            )}
                          </h3>
                          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-700">
                            {service.prix_base} €
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500">{service.description}</p>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                        <button onClick={() => setEditingService(service)} className={`${BTN_OUTLINE} flex-1`}>
                          Modifier
                        </button>
                        <button onClick={() => handleDeleteService(service._id)} className={`${BTN_DANGER} flex-1`}>
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ---------------- UTILISATEURS ---------------- */}
          {activeTab === 'utilisateurs' && (
            <>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Utilisateurs</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Comptes voyageurs et administrateurs enregistrés sur la plateforme.
                  </p>
                </div>
                {!loadingUsers && users.length > 0 && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                    {users.length} compte{users.length > 1 ? 's' : ''}
                  </span>
                )}
              </header>

              {loadingUsers ? (
                <div className={`${CARD} divide-y divide-slate-100`}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse px-6 py-5">
                      <div className="h-3.5 w-48 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`${CARD} overflow-x-auto`}>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr>
                        <th className={TH}>Email</th>
                        <th className={TH}>Rôle</th>
                        <th className={TH}>Abonnement</th>
                        <th className={`${TH} text-right`}>Réservations</th>
                        <th className={TH}>Statut</th>
                        <th className={`${TH} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user._id} className="transition-colors hover:bg-slate-50/70">
                          <td className={`${TD} font-medium text-slate-900`}>
                            <span className="block max-w-[18rem] wrap-anywhere">{user.email}</span>
                          </td>
                          <td className={TD}>
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                                user.role === 'ADMIN'
                                  ? 'bg-purple-50 text-purple-700 ring-purple-600/20'
                                  : 'bg-slate-100 text-slate-600 ring-slate-500/15'
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className={TD}>
                            <select
                              value={user.subscription}
                              onChange={(e) => handleUpdateSubscription(user._id, e.target.value)}
                              className="rounded-control border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
                            >
                              <option value="FREE">Free</option>
                              <option value="BAG_PACKER">Bag Packer</option>
                              <option value="EXPLORATOR">Explorator</option>
                            </select>
                          </td>
                          <td className={`${TD} text-right tabular-nums text-slate-600`}>
                            {user.nb_reservations}
                          </td>
                          <td className={TD}>
                            {user.banned ? (
                              <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                                Banni
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                Actif
                              </span>
                            )}
                          </td>
                          <td className={`${TD} whitespace-nowrap text-right`}>
                            <button
                              onClick={() => handleToggleBan(user._id, !user.banned)}
                              className={`${user.banned ? BTN_OUTLINE : BTN_DANGER} px-3 py-1.5 text-xs`}
                            >
                              {user.banned ? 'Débannir' : 'Bannir'}
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

          {activeTab === 'factures' && (
            <>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Factures &amp; règlements</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Toutes les factures émises par la plateforme, archivées et téléchargeables.
                  </p>
                </div>
                {!loadingInvoices && invoices.length > 0 && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                    {invoices.length} facture{invoices.length > 1 ? 's' : ''} &middot;{' '}
                    {invoices.reduce((total, f) => total + f.montant, 0).toFixed(2)} € encaissés
                  </span>
                )}
              </header>

              {loadingInvoices ? (
                <div className={`${CARD} divide-y divide-slate-100`}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse px-6 py-5">
                      <div className="h-3.5 w-56 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : invoices.length === 0 ? (
                <div className="rounded-card border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <h2 className="text-sm font-semibold text-slate-900">Aucune facture</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Les factures sont générées automatiquement au paiement d'une réservation.
                  </p>
                </div>
              ) : (
                <div className={`${CARD} overflow-x-auto`}>
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50/80">
                      <tr>
                        <th className={TH}>N° de facture</th>
                        <th className={TH}>Client</th>
                        <th className={TH}>Prestation</th>
                        <th className={TH}>Émise le</th>
                        <th className={`${TH} text-right`}>Montant</th>
                        <th className={`${TH} text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices.map((facture) => (
                        <tr key={facture._id} className="transition-colors hover:bg-slate-50/70">
                          <td className={`${TD} font-medium text-slate-900`}>
                            <span className="block max-w-[16rem] wrap-anywhere">{facture.numero_facture}</span>
                          </td>
                          <td className={`${TD} text-slate-600`}>
                            <span className="block max-w-[14rem] wrap-anywhere">
                              {facture.id_booking?.id_voyageur?.email || <span className="text-slate-400">—</span>}
                            </span>
                          </td>
                          <td className={`${TD} text-slate-600`}>
                            <span className="block max-w-[12rem] wrap-anywhere">
                              {facture.id_booking?.id_service?.nom || <span className="text-slate-400">—</span>}
                            </span>
                          </td>
                          <td className={`${TD} whitespace-nowrap text-slate-500`}>
                            {formatDate(facture.createdAt)}
                          </td>
                          <td className={`${TD} whitespace-nowrap text-right font-semibold tabular-nums text-slate-900`}>
                            {facture.montant.toFixed(2)} €
                          </td>
                          <td className={`${TD} whitespace-nowrap text-right`}>
                            {facture.id_booking ? (
                              <button
                                onClick={() => handleDownloadInvoice(facture.id_booking!._id)}
                                className={`${BTN_OUTLINE} px-3 py-1.5 text-xs`}
                              >
                                Télécharger
                              </button>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
