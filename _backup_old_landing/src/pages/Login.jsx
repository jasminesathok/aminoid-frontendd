import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Github, Chrome } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { login }              = useAuth();
  const navigate               = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser?.role === 'super_admin') {
        navigate('/superadmin/mega-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow font-delay-2000"></div>

      <button
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-full glass-card hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
      </button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md glass-card rounded-3xl p-8 z-10 mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <Logo className="mb-6 scale-125" size="lg" />
          <h1 className="text-2xl font-bold dark:text-white">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Sign in to your AMINOID account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email or Employee ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="name@company.com or NXT-001"
                className="input-field pl-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <a href="#" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="input-field pl-12 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
          >
            <LogIn size={20} />
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-bold hover:underline">Sign up for free</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
