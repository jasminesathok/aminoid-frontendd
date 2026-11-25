import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useTheme } from '../components/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Login = ({ onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const { theme, toggleTheme } = useTheme();
  const { login }              = useAuth();
  const navigate               = useNavigate();

  const isDark = theme === 'dark';

  const handleBackToHome = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    if (window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname + '#home');
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } catch (_) {}
    }
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

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
    <div
      style={{
        minHeight: 'calc(100vh - 75px)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(ellipse 70% 60% at 75% 30%, rgba(109, 74, 255, 0.22), transparent 70%), radial-gradient(ellipse 70% 60% at 25% 70%, rgba(90, 61, 255, 0.18), transparent 70%), #0a0817'
          : 'radial-gradient(ellipse 70% 60% at 75% 30%, rgba(109, 74, 255, 0.12), transparent 70%), radial-gradient(ellipse 70% 60% at 25% 70%, rgba(90, 61, 255, 0.08), transparent 70%), #f6f5ff',
        color: isDark ? '#ece9ff' : '#1a1640',
        padding: '40px 16px',
        boxSizing: 'border-box',
        transition: 'background 0.3s ease, color 0.3s ease'
      }}
    >
      {/* Background ambient orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: isDark ? 'rgba(109, 74, 255, 0.18)' : 'rgba(109, 74, 255, 0.12)',
          filter: 'blur(120px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: isDark ? 'rgba(90, 61, 255, 0.16)' : 'rgba(90, 61, 255, 0.08)',
          filter: 'blur(120px)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Left: Back to Home button */}
      <a
        href="#home"
        data-go="home"
        onClick={handleBackToHome}
        style={{
          position: 'absolute',
          top: '28px',
          left: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          textDecoration: 'none',
          border: isDark ? '1px solid rgba(160, 140, 255, 0.25)' : '1px solid rgba(109, 74, 255, 0.2)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
          color: isDark ? '#d9d2ff' : '#4a35b5',
          backdropFilter: 'blur(10px)',
          zIndex: 20,
          transition: 'all 0.2s ease',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(60,40,140,0.06)'
        }}
      >
        ← Back to Home
      </a>

      {/* Top Right: Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '28px',
          right: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          border: isDark ? '1px solid rgba(160, 140, 255, 0.25)' : '1px solid rgba(109, 74, 255, 0.2)',
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.85)',
          color: isDark ? '#d9d2ff' : '#4a35b5',
          backdropFilter: 'blur(10px)',
          zIndex: 20,
          transition: 'all 0.2s ease',
          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(60,40,140,0.06)'
        }}
        title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      >
        {isDark ? (
          <>
            <Sun size={15} style={{ color: '#f59e0b' }} />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon size={15} style={{ color: '#6d4aff' }} />
            <span>Dark</span>
          </>
        )}
      </button>

      {/* Main Login Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '460px',
          margin: '0 auto',
          background: isDark ? 'rgba(18, 13, 45, 0.92)' : '#ffffff',
          border: isDark ? '1px solid rgba(160, 140, 255, 0.22)' : '1px solid rgba(109, 74, 255, 0.18)',
          borderRadius: '24px',
          padding: '42px 38px',
          boxShadow: isDark
            ? '0 30px 70px rgba(0, 0, 0, 0.55), 0 0 40px rgba(109, 74, 255, 0.15)'
            : '0 20px 50px rgba(60, 40, 140, 0.08), 0 2px 10px rgba(60, 40, 140, 0.04)',
          backdropFilter: 'blur(20px)',
          boxSizing: 'border-box',
          zIndex: 10,
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px', textAlign: 'center' }}>
          <a
            href="#home"
            data-go="home"
            onClick={handleBackToHome}
            title="Back to Home"
            style={{ display: 'inline-block', marginBottom: '20px', textDecoration: 'none', cursor: 'pointer' }}
          >
            <Logo size="lg" />
          </a>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: isDark ? '#ffffff' : '#1a1640',
              marginBottom: '8px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: isDark ? '#9a95c4' : '#5b5883',
              margin: 0
            }}
          >
            Sign in to your AMINOID account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Email or Employee ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            <label
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: isDark ? '#ece9ff' : '#1a1640',
                textAlign: 'left'
              }}
            >
              Email or Employee ID
            </label>
            <div style={{ position: 'relative', width: '100%' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#8f78ff' : '#6d4aff',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="name@company.com or NXT-001"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '48px',
                  paddingRight: '16px',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  border: isDark ? '1px solid rgba(160, 140, 255, 0.25)' : '1px solid rgba(109, 74, 255, 0.25)',
                  borderRadius: '12px',
                  color: isDark ? '#ffffff' : '#1a1640',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isDark ? '#ece9ff' : '#1a1640'
                }}
              >
                Password
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert('A password reset link will be sent to your registered email address.');
                }}
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: isDark ? '#8f78ff' : '#6d4aff',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative', width: '100%' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#8f78ff' : '#6d4aff',
                  pointerEvents: 'none'
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '48px',
                  paddingRight: '48px',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                  border: isDark ? '1px solid rgba(160, 140, 255, 0.25)' : '1px solid rgba(109, 74, 255, 0.25)',
                  borderRadius: '12px',
                  color: isDark ? '#ffffff' : '#1a1640',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#9a95c4' : '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                background: 'rgba(255, 122, 138, 0.15)',
                color: '#ff7a8a',
                border: '1px solid rgba(255, 122, 138, 0.3)',
                textAlign: 'center'
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: isDark
                ? 'linear-gradient(135deg, #6d4aff, #8f78ff)'
                : 'linear-gradient(135deg, #6d4aff, #5a3de6)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: isDark
                ? '0 8px 25px rgba(109, 74, 255, 0.45)'
                : '0 8px 25px rgba(109, 74, 255, 0.35)',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              marginTop: '6px'
            }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Signing in…' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            marginTop: '28px',
            textAlign: 'center',
            fontSize: '14px',
            color: isDark ? '#9a95c4' : '#64748b',
            marginBottom: 0
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            style={{
              fontWeight: '600',
              color: isDark ? '#8f78ff' : '#6d4aff',
              textDecoration: 'none'
            }}
          >
            Sign up for free
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
