import React from 'react';
import { Clock } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PendingApproval = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();
 
  const { user, refreshUser } = useAuth();

useEffect(() => {
  const interval = setInterval(async () => {
    await refreshUser();
  }, 8000); // check every 8 seconds
  return () => clearInterval(interval);
}, []);



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
      <div className="glass-card rounded-3xl p-10 max-w-md text-center mx-4">
        <Logo className="mx-auto mb-6" />
        <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
          <Clock size={32} className="text-violet-500" />
        </div>
        <h1 className="text-2xl font-bold mb-3 dark:text-white">Waiting for Approval</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
          Your account is pending Enterprise approval. Once the Enterprise admin reviews your request and assigns dashboard access, you'll be able to log in.
        </p>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-red-500 transition-colors"
        >
          Sign out and go back
        </button>
      </div>
    </div>
  );
};

export default PendingApproval;