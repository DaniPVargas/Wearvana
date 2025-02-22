import { Home, Search, User, Settings, Moon, Sun, X, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import authContext from '../context/AuthProvider';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useContext(authContext);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('Galego');
  
  const languages = [
    { code: 'gl', name: 'Galego' },
    { code: 'eu', name: 'Euskara' },
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' }
  ];

  // Add scroll lock effect
  useEffect(() => {
    if (showSettingsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSettingsModal]);

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
        <div className="flex flex-col gap-1 flex-1">
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
          <div className="flex-1" />
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-wearvana-primary hover:bg-gray-50 mt-auto"
          >
            <Settings className="h-6 w-6 stroke-1.5" />
            <span className="text-base">Axustes</span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSettingsModal(false);
            }
          }}
        >
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Axustes</h2>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <button 
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  // Theme toggle logic will be implemented later
                }}
              >
                <div className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <span>Modo escuro</span>
                </div>
                <span className="text-sm text-gray-500">{isDarkMode ? 'On' : 'Off'}</span>
              </button>
              <div className="w-full px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span>Idioma</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={currentLanguage}
                      onChange={(e) => setCurrentLanguage(e.target.value)}
                      className="text-sm text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button 
                className="w-full flex items-center justify-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                onClick={() => {
                  localStorage.removeItem('jwt');
                  setAuth({});
                  setShowSettingsModal(false);
                  navigate('/login');
                }}
              >
                <span>Pechar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 