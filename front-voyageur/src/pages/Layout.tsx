import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Mes Réservations' },
    { path: '/catalogue', label: 'Réserver un service' },
    { path: '/vip', label: 'Formules VIP' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR VOYAGEUR */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-blue-800">
          <h2 className="text-xl font-black tracking-tight">PARIS JANITOR</h2>
          <span className="text-xs text-blue-300 font-medium">Espace Voyageur</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 rounded font-medium text-sm transition ${
                location.pathname === item.path 
                  ? 'bg-blue-800 text-white' 
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-blue-800">
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white py-2 rounded text-sm font-medium transition"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ZONE DE CONTENU DYNAMIQUE */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}