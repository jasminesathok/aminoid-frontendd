import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Navbar from './Navbar';
import HomePage from './HomePage';
import ProductsPage from './ProductsPage';
import SolutionsPage from './SolutionsPage';
import PricingPage from './PricingPage';
import CallZenzaPage from './CallZenzaPage';
import ReceptionistPage from './ReceptionistPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import CtaSection from './CtaSection';
import Footer from './Footer';

const V = ['home', 'products', 'solutions', 'pricing', 'callzenza', 'receptionist', 'login', 'register'];

export default function LandingPage() {
  const navigate = useNavigate();
  const [curView, setCurView] = useState('home');
  const [activeNav, setActiveNav] = useState('home');
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const curViewRef = useRef(curView);
  curViewRef.current = curView;
  const isNavigatingRef = useRef(false);
  const navTimerRef = useRef(null);

  const closeMega = useCallback(() => {
    setIsMegaOpen(false);
  }, []);

  const openMega = useCallback(() => {
    setIsMegaOpen(true);
  }, []);

  const toggleMega = useCallback(() => {
    setIsMegaOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (isMegaOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMegaOpen]);

  const go = useCallback((v, anchor) => {
    closeMega();
    const isEmbed = ['callzenza', 'receptionist', 'login', 'register'].includes(v);
    document.body.classList.toggle('embed-on', isEmbed);

    const same = v === curViewRef.current;
    setCurView(v);
    setActiveNav(anchor || v);

    isNavigatingRef.current = true;
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 1200);

    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: same ? 'smooth' : 'instant' });
        }
      }, 0);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    try {
      window.history.replaceState(null, '', '#' + (anchor || v));
    } catch (e) {}
  }, [closeMega]);

  const scrollToCta = useCallback(() => {
    closeMega();
    const el = document.getElementById('cta');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [closeMega]);

  // On page load / refresh: always reset to top of the site (Home)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Always reset to top of the site
    setCurView('home');
    setActiveNav('home');
    document.body.classList.remove('embed-on');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    try {
      window.history.replaceState(null, '', window.location.pathname + '#home');
    } catch (e) {}

    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 50);

    const handleHash = () => {
      const h = (window.location.hash || '').slice(1);
      if (V.includes(h)) {
        go(h);
      } else if (h && document.getElementById(h)) {
        go('home', h);
      } else if (!window.location.hash) {
        go('home');
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [go]);

  // Handle ESC key to close mega menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeMega();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeMega]);

  // Track active section on scroll when on Home page
  useEffect(() => {
    if (curView !== 'home') {
      setActiveNav(curView);
      return;
    }

    let ticking = false;
    const handleScrollSpy = () => {
      if (isNavigatingRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (isNavigatingRef.current) {
            ticking = false;
            return;
          }
          const scrollY = window.scrollY;
          if (scrollY < 400) {
            setActiveNav('home');
          } else {
            const indEl = document.getElementById('industries');
            const compEl = document.getElementById('compare');
            
            const indRect = indEl?.getBoundingClientRect();
            const compRect = compEl?.getBoundingClientRect();

            if (indRect && indRect.top <= 250 && indRect.bottom >= 150) {
              setActiveNav('industries');
            } else if (compRect && compRect.top <= 250 && compRect.bottom >= 150) {
              setActiveNav('compare');
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [curView]);

  // Global click & submit handler for auth forms, anchors, etc.
  useEffect(() => {
    function say(f, t, ok) {
      const m = f.querySelector('.amsg');
      if (m) {
        m.textContent = t;
        m.className = 'amsg ' + (ok ? 'ok' : 'er');
        m.hidden = false;
      }
    }

    const handleClick = (e) => {
      const tb = e.target.closest('.tg button');
      if (tb && tb.dataset.theme) {
        setTheme(tb.dataset.theme);
        return;
      }

      const sh = e.target.closest('[data-show]');
      if (sh) {
        const i = sh.parentElement.querySelector('input');
        if (i) {
          i.type = i.type === 'password' ? 'text' : 'password';
          sh.textContent = i.type === 'password' ? 'Show' : 'Hide';
        }
        return;
      }

      const fg = e.target.closest('[data-forgot]');
      if (fg) {
        e.preventDefault();
        const form = fg.closest('.zc')?.querySelector('form');
        if (form) {
          say(form, 'A password reset link would be sent to your email once this is connected to your auth API.', 1);
        }
        return;
      }

      const elGo = e.target.closest('[data-go]');
      if (elGo && !e.target.closest('a')) {
        go(elGo.dataset.go, elGo.dataset.anchor);
        return;
      }

      const a = e.target.closest('a');
      if (!a) return;

      if (a.dataset.cz) {
        e.preventDefault();
        const targetEl = document.getElementById(a.dataset.cz);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (a.dataset.menu !== undefined) {
        e.preventDefault();
        toggleMega();
      } else if (a.dataset.go) {
        e.preventDefault();
        go(a.dataset.go, a.dataset.anchor);
      } else if (a.dataset.cta !== undefined) {
        e.preventDefault();
        scrollToCta();
      } else if (a.getAttribute('href') === '#') {
        e.preventDefault();
      }
    };

    const handleSubmit = (e) => {
      const f = e.target.closest('form[data-auth]');
      if (!f) return;
      e.preventDefault();
      const k = f.dataset.auth;
      const el = f.elements;

      if (!f.checkValidity()) {
        say(f, 'Please fill in all the fields correctly.', 0);
        return;
      }

      if (k === 'register') {
        if (el.password.value.length < 8) {
          say(f, 'Password must be at least 8 characters.', 0);
          return;
        }
        if (el.password.value !== el.confirm.value) {
          say(f, 'Passwords do not match.', 0);
          return;
        }
      }

      say(
        f,
        k === 'login'
          ? 'Login form submitted. Connect this form to your auth API to sign users in.'
          : 'Account form submitted. Connect this form to your signup API to create accounts.',
        1
      );
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
    };
  }, [go, scrollToCta, setTheme, toggleMega]);

  // Mount landing-active class on body and html for isolated landing page styles
  useEffect(() => {
    document.body.classList.add('landing-active');
    document.documentElement.classList.add('landing-active');
    return () => {
      document.body.classList.remove('landing-active');
      document.documentElement.classList.remove('landing-active');
    };
  }, []);

  return (
    <div className="landing-scope">
      <Navbar
        currentView={curView}
        activeNav={activeNav}
        onNavigate={go}
        isMegaOpen={isMegaOpen}
        onToggleMega={toggleMega}
        onCloseMega={closeMega}
        theme={theme}
        onSetTheme={setTheme}
        onScrollToCta={scrollToCta}
      />
      <div
        id="scrim"
        className={isMegaOpen ? 'open' : ''}
        onClick={closeMega}
      />
      <HomePage hidden={curView !== 'home'} />
      <ProductsPage hidden={curView !== 'products'} />
      <SolutionsPage hidden={curView !== 'solutions'} />
      <PricingPage hidden={curView !== 'pricing'} />
      <CallZenzaPage hidden={curView !== 'callzenza'} onNavigate={go} />
      <ReceptionistPage hidden={curView !== 'receptionist'} onNavigate={go} />
      <LoginPage hidden={curView !== 'login'} onNavigate={go} />
      <RegisterPage hidden={curView !== 'register'} onNavigate={go} />
      <CtaSection />
      <Footer />
    </div>
  );
}

