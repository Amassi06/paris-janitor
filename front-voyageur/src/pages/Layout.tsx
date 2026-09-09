import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutGrid, Sparkles, LogOut, Menu, X } from 'lucide-react';
import { type SubscriptionType } from '../types/booking';
import { apiFetch, logout } from '../lib/api';
import type { IProfile } from '../types/booking';

export default function Layout() {
  const location = useLocation();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [offreDisponible, setOffreDisponible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<SubscriptionType | null>(null);
  const currentPlan = profile?.subscription ?? 'FREE';

  useEffect(() => {
    const fetchSubsription = async()=>{
      try{
        const res = await apiFetch('/api/auth/me');
        if (!res.ok){
          setSubscription(null);
          return;
        }
        const data = await res.json();
        setProfile(data.user);
        setOffreDisponible(data.offre_disponible);
        setSubscription(data.user?.subscription??null);
      }catch{
        setSubscription(null);
      }
    }
    fetchSubsription();
    },[location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: '/dashboard', label: 'Mes réservations', icon: <CalendarDays className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { path: '/catalogue', label: 'Réserver un service', icon: <LayoutGrid className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { path: '/vip', label: 'Formules VIP', icon: <Sparkles className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* VOILE — ferme le tiroir au tap, mobile uniquement */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-800/60 bg-brand-950 text-white transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white ring-1 ring-inset ring-white/15">
              PJ
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-white">Paris Janitor</p>
              <p className="text-[11px] font-medium text-brand-300">Espace voyageur</p>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="ml-auto -mr-1 flex h-9 w-9 items-center justify-center rounded-control text-brand-200/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        
         {currentPlan === 'FREE' && (
    <div className="mt-0 mb-6 flex flex-col items-start gap-2 px-4 text-xs">
      <span className="inline-flex w-fit items-center rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-300 ring-1 ring-inset ring-blue-500/20">
        Formule Free
      </span>
      </div>
      )}
      
        {currentPlan !== 'FREE' && (
    <div className="mt-0 mb-6 flex flex-col items-start gap-2 px-4 text-xs">
      <span className="inline-flex w-fit items-center rounded-full bg-blue-500/10 px-2.5 py-1 font-medium text-blue-300 ring-1 ring-inset ring-blue-500/20">
        Formule {currentPlan === 'BAG_PACKER' ? 'Bag Packer' : 'Explorator'}
      </span>

    {profile?.subscription_end && (
      <span className="inline-flex w-fit items-center rounded-full bg-slate-500/10 px-2.5 py-1 font-medium text-slate-300 ring-1 ring-inset ring-slate-500/20">
        Jusqu'au {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
      </span>
    )}

    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 font-medium ring-1 ring-inset ${
        offreDisponible
          ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20'
          : 'bg-slate-500/10 text-slate-400 ring-slate-500/20'
      }`}
    >
      {offreDisponible ? '1 prestation offerte' : 'Prestation utilisée'}
    </span>
  </div>
)}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-brand-200/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-white transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <span className={isActive ? 'text-white' : 'text-brand-300/70 group-hover:text-white'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-control px-3 py-2.5 text-sm font-medium text-brand-200/80 transition-colors hover:bg-red-500/15 hover:text-red-300"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* BARRE MOBILE */}
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            className="-ml-1 flex h-10 w-10 items-center justify-center rounded-control text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-950 text-sm font-bold text-white">
            PJ
          </span>
          <p className="text-sm font-semibold tracking-tight text-slate-900">Paris Janitor</p>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          {subscription === 'FREE' && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 ring-1 ring-inset ring-amber-600/15 sm:px-6">
              <span>
                <span className="mr-2 rounded bg-amber-200/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  Publicité
                </span>
                Passez à une formule VIP pour naviguer sans publicité.
              </span>
              <Link to="/vip" className="font-medium underline underline-offset-4">
                Voir les formules
              </Link>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
