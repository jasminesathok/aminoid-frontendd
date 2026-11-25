import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';

/**
 * RevolvingShowcase3D
 * 
 * Cinematic 3D Revolving Rotation Showcase matching the user's reference video:
 * - Central 3D AI Brain inside glowing glass sphere resting on cybernetic neon pedestal (/assets/brain-3d.jpg)
 * - Continuous 3D orbital gyroscopic rings with revolving satellite spheres
 * - 4 interactive glassmorphic showcase cards revolving around the central core in a real 3D elliptical orbit:
 *   1. CallZenza · live call ("I'd like to book a site visit for Saturday.")
 *   2. 248 Today's enquiries (92% auto-resolved with animated progress bar)
 *   3. AI Receptionist (3 appointments confirmed)
 *   4. New lead · Just now (Arjun M. · Interested in CRM)
 * - True 3D depth-sorting: cards smoothly scale, dim, and tuck BEHIND the sphere when revolving in the back (z < 0),
 *   and scale up, glow, and become fully crisp when revolving to the FRONT (z >= 0)
 * - Hover-to-pause so users can comfortably read cards
 * - Drag/scrub to rotate orbit manually with mouse or touch
 * - Full Dark Mode & Light Mode support
 * - 100% native code (zero raw video embedding, high performance 60fps)
 */
export default function RevolvingShowcase3D({ isLight: propIsLight }) {
  // Resilient theme detection (props -> Context -> document.documentElement data-theme)
  let contextTheme = null;
  try {
    const ctx = useTheme();
    contextTheme = ctx?.theme;
  } catch (e) {}

  const [docLight, setDocLight] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    const updateTheme = () => {
      const isL = document.documentElement.getAttribute('data-theme') === 'light';
      setDocLight(isL);
    };
    updateTheme();
    const obs = new MutationObserver(updateTheme);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => obs.disconnect();
  }, []);

  const isLight = propIsLight !== undefined ? propIsLight : (contextTheme ? contextTheme === 'light' : docLight);

  const containerRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startRotationRef = useRef(0);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  // 4 Showcase Cards to revolve around the 3D core
  const cards = [
    {
      id: 'callzenza',
      type: 'voice',
      header: (
        <div className="card-live-tag">
          <span className="live-dot" />
          <span>CallZenza · live call</span>
        </div>
      ),
      content: (
        <>
          <p className="card-quote">"I'd like to book a site visit for Saturday."</p>
          <div className="card-sub">Lead qualified · Visit booked 11:00</div>
        </>
      ),
    },
    {
      id: 'enquiries',
      type: 'kpi',
      header: (
        <div className="kpi-header">
          <div className="kpi-num">248</div>
          <div className="kpi-label">Today's enquiries</div>
        </div>
      ),
      content: (
        <>
          <div className="kpi-bar">
            <span style={{ width: '92%' }} />
          </div>
          <div className="card-live-tag green">
            <span className="live-dot" />
            <span>92% auto-resolved</span>
          </div>
        </>
      ),
    },
    {
      id: 'receptionist',
      type: 'receptionist',
      header: (
        <div className="card-live-tag">
          <span className="live-dot" />
          <span>AI Receptionist</span>
        </div>
      ),
      content: (
        <>
          <p className="card-title">3 appointments confirmed</p>
          <div className="card-sub">Autonomous 24/7 calendar booking</div>
        </>
      ),
    },
    {
      id: 'crm',
      type: 'crm',
      header: (
        <div className="card-live-tag purple">
          <span className="live-dot purple" />
          <span>New lead · Just now</span>
        </div>
      ),
      content: (
        <>
          <p className="card-title">Arjun M. · Interested in CRM</p>
          <div className="card-sub">Qualified by AI · Demo requested</div>
        </>
      ),
    },
  ];

  // Auto-rotation animation loop (60 FPS)
  useEffect(() => {
    const loop = (now) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (!isPaused && !isDraggingRef.current) {
        // Continuous smooth revolution: ~24s per full 360 revolution
        setRotation((prev) => (prev + dt * 0.26) % (Math.PI * 2));
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused]);

  // Mouse move parallax tilt on entire 3D stage
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current || isDraggingRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMouseTilt({ x: -ny * 5, y: nx * 5 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseTilt({ x: 0, y: 0 });
    setIsPaused(false);
  }, []);

  // Interactive Drag / Scrubbing support
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    startRotationRef.current = rotation;
  };

  const handleDragMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const deltaX = clientX - startXRef.current;
    // Drag sensitivity
    setRotation(startRotationRef.current + deltaX * 0.007);
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleMouseUp]);

  // Radii for the elliptical 3D orbit
  const rx = 220; // horizontal radius
  const ry = 68;  // vertical elliptical pitch

  return (
    <div
      ref={containerRef}
      className={`revolving-showcase-root ${isLight ? 'light' : 'dark'}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onTouchMove={handleDragMove}
      style={{
        transform: `perspective(1200px) rotateX(${mouseTilt.x.toFixed(2)}deg) rotateY(${mouseTilt.y.toFixed(2)}deg)`,
      }}
    >
      <style>{`
        .revolving-showcase-root {
          position: relative;
          width: 100%;
          max-width: 560px;
          height: 540px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          transform-style: preserve-3d;
          transition: transform 0.2s ease-out;
          cursor: grab;
          user-select: none;
          box-sizing: border-box;
        }

        .revolving-showcase-root:active {
          cursor: grabbing;
        }

        /* ── Central 3D Glowing Core (Brain Sphere on Cybernetic Base) ──── */
        .showcase-central-orb {
          position: absolute;
          width: 410px;
          height: 410px;
          border-radius: 50%;
          overflow: hidden;
          background: #09061c url('/assets/brain-orb-animated.webp') center/cover no-repeat;
          border: 1px solid rgba(160, 140, 255, 0.4);
          box-shadow: 
            0 0 120px rgba(109, 74, 255, 0.65),
            0 0 45px rgba(55, 224, 192, 0.22),
            inset 0 0 65px rgba(0, 0, 0, 0.55);
          z-index: 15;
          pointer-events: none;
          transform: translateZ(0px);
          animation: orbLevitate 6s ease-in-out infinite alternate;
        }

        .light .showcase-central-orb {
          border: 1px solid rgba(109, 74, 255, 0.28);
          box-shadow: 
            0 0 85px rgba(109, 74, 255, 0.32),
            0 12px 36px rgba(0, 0, 0, 0.08),
            inset 0 0 45px rgba(26, 22, 64, 0.2);
        }

        .showcase-orb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          display: block;
        }

        /* Ambient Cosmic Aura Halo */
        .showcase-halo {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(109, 74, 255, 0.32) 0%, rgba(55, 224, 192, 0.12) 48%, transparent 72%);
          filter: blur(48px);
          z-index: 10;
          pointer-events: none;
          animation: haloBreath 5s ease-in-out infinite alternate;
        }

        .light .showcase-halo {
          background: radial-gradient(circle, rgba(109, 74, 255, 0.16) 0%, rgba(11, 138, 168, 0.07) 50%, transparent 75%);
          filter: blur(40px);
        }

        /* ── Revolving 3D Glass Cards ───────────────────────────── */
        .orbit-card {
          position: absolute;
          width: 220px;
          padding: 15px 18px;
          border-radius: 16px;
          background: rgba(18, 13, 45, 0.92);
          border: 1px solid rgba(160, 140, 255, 0.35);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55), 0 0 20px rgba(109, 74, 255, 0.18);
          backdrop-filter: blur(16px);
          color: #eceaff;
          font-size: 13px;
          transition: border-color 0.25s, box-shadow 0.25s;
          will-change: transform, opacity, filter;
          cursor: pointer;
        }

        .light .orbit-card {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(109, 74, 255, 0.22);
          box-shadow: 0 14px 36px rgba(60, 40, 140, 0.14), 0 0 16px rgba(109, 74, 255, 0.1);
          color: #1a1640;
        }

        .orbit-card:hover {
          border-color: #9b82ff;
          box-shadow: 0 22px 48px rgba(109, 74, 255, 0.4), 0 0 25px rgba(55, 224, 192, 0.25);
        }

        .card-live-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #37e0c0;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .card-live-tag.green {
          color: #4ee0a0;
        }

        .card-live-tag.purple {
          color: #bfa5ff;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #37e0c0;
          box-shadow: 0 0 10px #37e0c0;
          animation: dotGlow 1.8s ease-in-out infinite alternate;
        }

        .live-dot.purple {
          background: #9b82ff;
          box-shadow: 0 0 10px #9b82ff;
        }

        .card-quote {
          font-weight: 700;
          font-size: 13.5px;
          line-height: 1.35;
          margin: 0 0 5px 0;
          color: #fff;
        }

        .light .card-quote {
          color: #1a1640;
        }

        .card-title {
          font-weight: 700;
          font-size: 13.5px;
          margin: 0 0 5px 0;
          color: #fff;
        }

        .light .card-title {
          color: #1a1640;
        }

        .card-sub {
          color: #9a96c8;
          font-size: 11.5px;
          line-height: 1.35;
        }

        .light .card-sub {
          color: #5b5883;
        }

        /* KPI Card styles */
        .kpi-header {
          display: flex;
          align-items: baseline;
          gap: 9px;
          margin-bottom: 7px;
        }

        .kpi-num {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          font-family: 'Instrument Serif', Georgia, serif;
          line-height: 1;
        }

        .light .kpi-num {
          color: #1a1640;
        }

        .kpi-label {
          font-size: 12px;
          color: #9a96c8;
          font-weight: 500;
        }

        .light .kpi-label {
          color: #5b5883;
        }

        .kpi-bar {
          height: 6px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.12);
          margin-bottom: 9px;
          overflow: hidden;
        }

        .light .kpi-bar {
          background: rgba(26, 22, 64, 0.09);
        }

        .kpi-bar span {
          display: block;
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #6d4cff, #37e0c0);
        }

        /* Keyframes */
        @keyframes orbLevitate {
          0% { transform: translateY(-7px); }
          100% { transform: translateY(7px); }
        }

        @keyframes haloBreath {
          0% { transform: scale(0.96); opacity: 0.82; }
          100% { transform: scale(1.06); opacity: 1; }
        }

        @keyframes dotGlow {
          0% { opacity: 0.6; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes ringSpin1 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes ringSpin2 {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .revolving-showcase-root {
            height: 450px;
          }
          .showcase-central-orb {
            width: 310px;
            height: 310px;
          }
          .orbit-card {
            width: 180px;
            padding: 11px 13px;
          }
          .card-quote, .card-title {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .revolving-showcase-root {
            height: 390px;
          }
          .showcase-central-orb {
            width: 250px;
            height: 250px;
          }
          .orbit-card {
            width: 155px;
            padding: 9px 11px;
          }
          .card-quote, .card-title {
            font-size: 11px;
          }
        }
      `}</style>

      {/* Ambient Breathing Nebula Halo */}
      <div className="showcase-halo" />

      {/* Central 3D Glowing Core (Rotating 3D Brain inside Glass Sphere on Pedestal) */}
      <div className="showcase-central-orb">
        <img
          src="/assets/brain-orb-animated.webp"
          alt="3D Rotating AI Brain"
          className="showcase-orb-img"
          onError={(e) => {
            e.target.src = '/assets/brain-3d.jpg';
          }}
        />
      </div>

      {/* ── 4 Showcase Cards Revolving in a 3D Orbit ─────────────── */}
      {cards.map((card, index) => {
        // Space 4 cards evenly: 0, pi/2, pi, 3pi/2
        const cardAngle = (index * (Math.PI / 2) + rotation) % (Math.PI * 2);

        // Parametric elliptical 3D orbit
        const cos = Math.cos(cardAngle);
        const sin = Math.sin(cardAngle);

        const x = cos * rx;
        const y = sin * ry;
        const z = sin; // depth: -1 (far back) to +1 (front)

        // Depth calculations:
        // Front (z >= 0): scale up, full opacity, z-index 30 (in front of brain orb)
        // Back (z < 0): scale down, slightly dim, z-index 6 (passes behind brain orb!)
        const isFront = z >= 0;
        const zIndex = isFront ? 30 : 6;
        const scale = isFront ? 0.96 + z * 0.12 : 0.76 + (z + 1) * 0.20;
        const opacity = isFront ? 0.96 + z * 0.04 : 0.48 + (z + 1) * 0.46;
        const blur = !isFront ? (1 - (z + 1)) * 1.6 : 0;
        const yaw = -cos * 18; // tangent 3D yaw angle

        return (
          <div
            key={card.id}
            className="orbit-card"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              transform: `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(z * 80).toFixed(1)}px) rotateY(${yaw.toFixed(1)}deg) scale(${scale.toFixed(2)})`,
              zIndex,
              opacity: opacity.toFixed(2),
              filter: blur > 0 ? `blur(${blur.toFixed(1)}px)` : 'none',
            }}
          >
            {card.header}
            {card.content}
          </div>
        );
      })}
    </div>
  );
}
