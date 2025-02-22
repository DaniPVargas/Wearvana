import { Home, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Search, label: 'Explorar', path: '/explore' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {navItems.map(({ icon: Icon, label, path }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-wearvana-accent'
                      : 'text-wearvana-muted hover:text-wearvana-accent'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Left Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-[244px] bg-white border-r border-gray-200 z-50 flex-col py-8 px-3">
        <div className="mb-8 px-3">
          <h1 className="text-xl tracking-widest font-light">WEARVANA</h1>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-wearvana-accent font-medium'
                    : 'text-wearvana-primary hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`} />
                <span className="text-base">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
} 