import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, LayoutGrid, Sparkles, LogOut } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Mes réservations', icon: <CalendarDays className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { path: '/catalogue', label: 'Réserver un service', icon: <LayoutGrid className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
    { path: '/vip', label: 'Formules VIP', icon: <Sparkles className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* SIDEBAR VOYAGEUR */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/60 bg-brand-950 text-white">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white ring-1 ring-inset ring-white/15">
              PJ
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-white">Paris Janitor</p>
              <p className="text-[11px] font-medium text-brand-300">Espace voyageur</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
