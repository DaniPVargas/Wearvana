import { Home, Search, User, Heart, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: Search, label: 'Explorar', path: '/explore' },
    { icon: PlusCircle, label: 'Publicar', path: '/post' },
    { icon: Heart, label: 'Favoritos', path: '/favorites' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
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
  );
} 