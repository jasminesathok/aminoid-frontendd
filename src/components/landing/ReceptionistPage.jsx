import React, { useState } from 'react';

export default function ReceptionistPage({ hidden, onNavigate }) {
  const [loading, setLoading] = useState(true);

  return (
    <main
      id="v-receptionist"
      hidden={hidden}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0d0a22',
        display: hidden ? 'none' : 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Top Bar for In-App Browser Experience */}
      <div
        style={{
          position: 'relative',
          height: '48px',
          background: 'rgba(13, 10, 34, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(109, 74, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxSizing: 'border-box',
          color: '#ffffff',
          fontSize: '14px',
          zIndex: 10,
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) {
              onNavigate('home');
            }
          }}
          data-go="home"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#a5b4fc',
            cursor: 'pointer',
            fontSize: '13.5px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Aminoid AI
        </button>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#cbd5e1',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
          <span>callzenza.in · AI Receptionist</span>
        </div>
      </div>

      {/* Embedded AI Receptionist Website */}
      <div style={{ position: 'relative', flex: 1, width: '100%', height: 'calc(100vh - 48px)' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0d0a22',
              color: '#ffffff',
              gap: '16px',
              zIndex: 5,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(109, 74, 255, 0.2)',
                borderTopColor: '#6d4aff',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <span style={{ fontSize: '14px', color: '#94a3b8', letterSpacing: '0.02em' }}>
              Loading AI Receptionist...
            </span>
          </div>
        )}

        <iframe
          src="https://www.callzenza.in/"
          title="AI Receptionist Platform"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          allow="microphone; camera; autoplay; clipboard-write; encrypted-media; fullscreen; geolocation"
          onLoad={() => setLoading(false)}
        />
      </div>
    </main>
  );
}

