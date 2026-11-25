import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, UserPlus, Eye, EyeOff, Shield, Users, CheckCircle, Clock, FileCheck, Key } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon } from 'lucide-react';

const ROLE_CONFIG = {
  member: {
    role:    'member',
    label:   'Individual',
    heading: 'Create your account',
    sub:     'Join an Enterprise workspace',
    icon:    Users,
    color:   '#939BFF',
    badge:   'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    glow:    'from-violet-500/10 to-blue-500/10',
  },
  enterprise: {   
    role:    'admin',
    label:   'Enterprise',
    heading: 'Start your free trial',
    sub:     'Create your Enterprise workspace',
    icon:    Shield,
    color:   '#10b981',
    badge:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    glow:    'from-emerald-500/10 to-teal-500/10',
  },
}

const SignUp = () => {
  const { roleSlug } = useParams();
  const cfg     = ROLE_CONFIG[roleSlug] ?? ROLE_CONFIG.member;
  const isAdmin = cfg.role === 'admin';

  const [showPassword, setShowPassword] = useState(false);
  const [companyName,  setCompanyName]  = useState('');
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  // ← NEW: enterpriseId field for members (the admin's user id)
  const [enterpriseId, setEnterpriseId] = useState('');
  const [referral,     setReferral]     = useState('');
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { signup }             = useAuth();
  const navigate               = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const newUser = await signup(
        isAdmin ? companyName : firstName,
        isAdmin ? null        : lastName,
        email,
        password,
        cfg.role,
        isAdmin ? companyName : null,
        // Pass enterpriseId for members so backend can link them to the right enterprise
        isAdmin ? null : (enterpriseId.trim() || null)
      );

      if (newUser.role === 'member') {
        navigate('/pending-approval');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const RoleIcon = cfg.icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
      <div className={`absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow bg-linear-to-br ${cfg.glow}`} />
      <div className={`absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] animate-pulse-slow bg-linear-to-tr ${cfg.glow}`} />

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
        className="w-full max-w-lg glass-card rounded-3xl p-8 z-10 mx-4 my-8"
      >
        <div className="flex flex-col items-center mb-6">
          <Logo className="mb-5 scale-110" />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-4 ${cfg.badge}`}>
            <RoleIcon size={13} />
            {cfg.label} Account
          </div>

          <h1 className="text-2xl font-bold dark:text-white text-center">{cfg.heading}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center">{cfg.sub}</p>
        </div>

        {isAdmin && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
              <Clock size={15} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                7-day free trial activated instantly — no credit card needed
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
              <FileCheck size={15} className="text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                KYC verification required inside the dashboard after sign-up
              </p>
            </div>
          </div>
        )}

        <div className="mb-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-center text-slate-400 mb-3 font-medium">Sign up as</p>
          <div className="flex justify-center gap-3">
            {Object.entries(ROLE_CONFIG).map(([slug, rc]) => (
              <Link
                key={slug}
               to={slug === 'member' ? '/signup' : `/signup/enterprise`}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  cfg.role === rc.role
                    ? 'text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                }`}
                style={cfg.role === rc.role ? { background: rc.color } : {}}
              >
                <rc.icon size={12} />{rc.label}
              </Link>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {isAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text" placeholder="Acme Corp" className="input-field pl-12"
                  value={companyName} onChange={e => setCompanyName(e.target.value)} required
                />
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="John" className="input-field pl-12"
                    value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Doe" className="input-field pl-12"
                    value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="email" placeholder="you@company.com" className="input-field pl-12"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                className="input-field pl-12 pr-12"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* ── Enterprise ID field — members only ──────────────────────── */}
          {!isAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Enterprise ID <span className="text-slate-400 font-normal">(Provided by your Enterprise admin)</span>
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Enter your Enterprise ID"
                  className="input-field pl-12"
                  value={enterpriseId}
                  onChange={e => setEnterpriseId(e.target.value)}
                />
              </div>
              <p className="text-xs text-slate-400 ml-1">
                Ask your Enterprise admin for their ID to join their workspace.
              </p>
            </div>
          )}

          {!isAdmin && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Referral Code <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input type="text" placeholder="AMNXXXXXXXX" className="input-field"
                  value={referral} onChange={e => setReferral(e.target.value.toUpperCase())} />
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 mt-2 ml-1">
            <input type="checkbox" className="mt-1 accent-primary" id="terms" required />
            <label htmlFor="terms" className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}bb)` }}
          >
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
            ) : (
              <><UserPlus size={18} /> {isAdmin ? 'Start free trial' : `Create ${cfg.label} Account`}</>
            )}
          </button>

          {isAdmin && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <CheckCircle size={13} className="text-emerald-500" />
              <p className="text-xs text-slate-400">Your referral code is generated automatically upon registration</p>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
