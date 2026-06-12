import { useState } from 'react';
import { Globe, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-[#00063d] border-b border-white/10 py-4 px-8 flex justify-between items-center">
        <div className="text-xl font-bold flex items-center gap-2 text-primary">
          <Globe className="w-6 h-6" />
          <span>C0 Net-Zero</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="/" className="hover:text-primary transition-colors">Home Page</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">About Us</a>
          <a href="#projects" className="hover:text-primary transition-colors">Projects</a>
          <a href="#market" className="hover:text-primary transition-colors">Market</a>
          {isLoggedIn && (
            <a href="#dashboard" className="hover:text-primary transition-colors">Dashboard</a>
          )}

          {isLoggedIn && user?.role === 'buyer' && (
            <button
              onClick={() => document.getElementById('carbon-market')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 rounded-full bg-primary text-background font-bold hover:shadow-[0_0_15px_rgba(0,255,178,0.4)] transition-all"
            >
              Buy Carbon Credits
            </button>
          )}

          {isLoggedIn ? (
            <div className="relative">
              <button
                id="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-primary"
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user?.username}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 glass-panel p-2 border border-white/10 rounded-xl">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <div className="text-xs text-gray-400">Signed in as</div>
                    <div className="text-sm font-medium truncate">{user?.email}</div>
                    <div className="text-xs text-primary capitalize mt-0.5">{user?.role?.replace('_', ' ')}</div>
                  </div>
                  <button
                    id="logout-button"
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="login-button"
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign Up
            </button>
          )}
        </div>
      </nav>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
