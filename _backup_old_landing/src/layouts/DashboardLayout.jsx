import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Search, Bell, PanelLeftClose, PanelLeftOpen, Maximize, Minimize, LogOut } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { theme, toggleTheme }  = useTheme();
  const { user, logout }        = useAuth();
  const navigate                = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close sidebar on mobile when route changes
  React.useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [navigate]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase()
    : 'U';

  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : 'User';

  const displayRole = user?.role === 'super_admin' ? 'Super Admin'
    : user?.role === 'admin' ? 'Admin' : 'Member';

  return (
    <div className="flex h-screen bg-white dark:bg-navy-600 transition-colors duration-300 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        <header className="h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between px-4 md:px-6 z-20 shrink-0">

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              {sidebarOpen
                ? <PanelLeftClose size={20} className="transition-transform duration-300 group-hover:scale-95" />
                : <PanelLeftOpen  size={20} className="transition-transform duration-300 group-hover:scale-95" />
              }
            </button>

            <div className="hidden sm:flex items-center gap-3 bg-slate-100/50 dark:bg-slate-800/70 px-4 py-2 rounded-xl w-56 md:w-80 border border-white/5 dark:border-slate-700/50 transition-all duration-300">
              <Search size={18} className="text-slate-600 dark:text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="hidden md:block p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'light'
                ? <Moon size={20} />
                : <Sun  size={20} className="text-yellow-400" />
              }
            </button>

            <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-[#020617]" />
            </button>

            <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-600 mx-1" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{displayName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-bold tracking-tight">{displayRole}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                {initials}
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide light-bg-variant">
          {children}
        </main>
      </div>
    </div>
  );
};
