import React from 'react';
import MegaMenu from './MegaMenu';

export default function Navbar({
  currentView,
  activeNav,
  onNavigate,
  isMegaOpen,
  onToggleMega,
  onCloseMega,
  theme,
  onSetTheme,
  onScrollToCta,
}) {
  const active = isMegaOpen ? 'products' : (activeNav || currentView || 'home');

  return (
    <nav>
      <a
        href="#"
        data-go="home"
        aria-label="Aminoid AI home"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onNavigate('home');
        }}
      >
        <img className="logo-d" src="/assets/aminoid-logo-dark.png" alt="Aminoid AI" />
        <img className="logo-l" src="/assets/aminoid-logo-light.png" alt="Aminoid AI" />
      </a>
      <div className="links">
        <a
          href="#"
          data-go="home"
          className={active === 'home' ? 'on' : ''}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('home');
          }}
        >
          Home
        </a>
        <a
          href="#"
          data-menu
          data-v="products"
          className={`pm ${isMegaOpen ? 'open' : ''} ${active === 'products' ? 'on' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleMega();
          }}
        >
          Products{' '}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
        <a
          href="#"
          data-go="solutions"
          className={active === 'solutions' ? 'on' : ''}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('solutions');
          }}
        >
          Solutions
        </a>
        <a
          href="#"
          data-go="home"
          data-anchor="compare"
          className={active === 'compare' ? 'on' : ''}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('home', 'compare');
          }}
        >
          Compare
        </a>
        <a
          href="#"
          data-go="home"
          data-anchor="industries"
          className={active === 'industries' ? 'on' : ''}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('home', 'industries');
          }}
        >
          Industries
        </a>
        <a
          href="#"
          data-go="pricing"
          className={active === 'pricing' ? 'on' : ''}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('pricing');
          }}
        >
          Pricing
        </a>
      </div>
      <div className="navr">
        <div className="tg" role="group" aria-label="Theme">
          <button
            data-theme="dark"
            className={theme === 'dark' ? 'on' : ''}
            title="Dark theme"
            onClick={(e) => {
              e.stopPropagation();
              onSetTheme('dark');
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
            Dark
          </button>
          <button
            data-theme="light"
            className={theme === 'light' ? 'on' : ''}
            title="Light theme"
            onClick={(e) => {
              e.stopPropagation();
              onSetTheme('light');
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </svg>
            Light
          </button>
        </div>
        <a
          className="btn b2"
          style={{ padding: '9px 20px' }}
          href="#"
          data-go="login"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('login');
          }}
        >
          Login
        </a>
        <a
          className="btn b1"
          style={{ padding: '9px 20px' }}
          href="#"
          data-go="pricing"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNavigate('pricing');
          }}
        >
          Free
        </a>
      </div>
      <MegaMenu isOpen={isMegaOpen} onClose={onCloseMega} onNavigate={onNavigate} />
    </nav>
  );
}
