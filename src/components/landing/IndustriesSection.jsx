import React, { useState, useEffect, useRef } from 'react';

export const INDUSTRIES = [
  {
    icon: '💻',
    title: 'Technology',
    desc: 'Ship features faster with connected engineering, support, and billing workflows.',
  },
  {
    icon: '🏥',
    title: 'Healthcare',
    desc: 'Coordinate scheduling, compliance, and patient-facing operations in one system.',
  },
  {
    icon: '🏭',
    title: 'Manufacturing',
    desc: 'Track inventory, production timelines, and supplier relationships end to end.',
  },
  {
    icon: '🎓',
    title: 'Education',
    desc: 'Manage staff, enrollment operations, and campus resources from one workspace.',
  },
  {
    icon: '🛍️',
    title: 'Retail',
    desc: 'Sync inventory, point-of-sale data, and customer support across every location.',
  },
  {
    icon: '💼',
    title: 'Professional Services',
    desc: 'Run client engagements, billing, and utilization tracking without spreadsheets.',
  },
  {
    icon: '🏗️',
    title: 'Construction',
    desc: 'Keep projects, subcontractors, and budgets aligned from job site to office.',
  },
  {
    icon: '🛎️',
    title: 'Hospitality',
    desc: 'Manage staffing, guest services, and vendor operations in a single place.',
  },
  {
    icon: '🚀',
    title: 'Growing Startups',
    desc: 'Scale operations without hiring a new tool for every new department.',
  },
  {
    icon: '🏢',
    title: 'Enterprise Organizations',
    desc: 'Standardize processes across departments while keeping full visibility.',
  },
];

export default function IndustriesSection() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const stickyTop = 72; // sticky navbar offset
          const totalDistance = containerRef.current.offsetHeight - window.innerHeight;

          if (totalDistance > 0) {
            const scrolled = stickyTop - rect.top;
            const p = Math.max(0, Math.min(1, scrolled / totalDistance));
            setProgress(p);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e) => {
    if (progress < 0.2) return;
    const { clientX, clientY } = e;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const x = ((clientX - cx) / cx) * 5; // -5 to +5 deg
    const y = ((clientY - cy) / cy) * 5;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Interpolated 3D Transform values
  // Scale goes from 0.72 up to 1.04
  const scale = 0.72 + progress * 0.32;
  // TranslateZ from -160px to +20px
  const translateZ = -160 + progress * 180;
  // RotateX tilts up from 14deg to 0deg
  const rotateX = 14 * (1 - progress) - mouseOffset.y * 0.6;
  const rotateY = mouseOffset.x * 0.6;
  // Opacity smoothly increases from 0.5 to 1.0
  const opacity = 0.5 + progress * 0.5;

  return (
    <section id="industries" className="industries-3d-track" ref={containerRef}>
      <span id="customers" style={{ position: 'absolute', top: '-80px' }} />

      <div
        className="industries-sticky-viewport"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Subtle 3D background glow that expands with zoom */}
        <div
          className="industries-3d-glow"
          style={{
            transform: `scale(${0.6 + progress * 0.6})`,
            opacity: 0.3 + progress * 0.4,
          }}
        />

        <div
          className="industries-stage"
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
            opacity,
          }}
        >
          {/* Header */}
          <div className="w center" style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span className="eyebrow">INDUSTRIES</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 42px)', margin: '8px 0 6px' }}>
              Built for teams across every industry
            </h2>
            <p className="lead" style={{ fontSize: '15px', margin: '0 auto', maxWidth: '640px' }}>
              Scale operations and eliminate manual bottlenecks with tailored AI solutions.
            </p>
          </div>

          {/* 10 Cards in 3D Grid */}
          <div className="industries-grid-3d">
            {INDUSTRIES.map((item, idx) => {
              // Subtle individual 3D depth offset
              const staggerZ = ((idx % 4) - 1.5) * 6 * (1 - progress);
              return (
                <div
                  key={item.title}
                  className="industry-card-3d card"
                  style={{
                    transform: `translateZ(${staggerZ}px)`,
                  }}
                >
                  <div className="ind-icon-box">{item.icon}</div>
                  <h3 className="ind-card-title">{item.title}</h3>
                  <p className="ind-card-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* 3D Scroll Progress Indicator */}
          <div className="industries-3d-indicator">
            <span className="ind-pill">
              3D SCROLL ZOOM · {Math.round(progress * 100)}%
            </span>
            <div className="ind-progress-bar">
              <div
                className="ind-progress-fill"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

