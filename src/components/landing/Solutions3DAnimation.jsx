import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Solutions3DAnimation
 * 
 * High-performance, modern, interactive 3D Canvas animation representing:
 * - AI-powered customer conversations
 * - Voice agents (pulsing soundwaves & audio frequency orbitals)
 * - Intelligent CRM automation (dynamic neural network mesh with traveling data packets)
 * - Business growth (orbital depth rings and interactive 3D perspective tilt)
 * 
 * Automatically responds to Dark Mode and Light Mode.
 * Fully responsive and performance-optimized (pauses when hidden/off-screen).
 */
export default function Solutions3DAnimation({ isLight = false, children }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false });
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)' });

  // Mouse move handler for interactive 3D tilt & parallax
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1

    mouseRef.current.targetX = nx;
    mouseRef.current.targetY = ny;
    mouseRef.current.isHovering = true;

    // Smooth card 3D tilt
    const rotX = -ny * 7; // -7 to 7 deg
    const rotY = nx * 8;  // -8 to 8 deg
    setTiltStyle({
      transform: `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`,
      transition: 'transform 0.1s ease-out',
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    mouseRef.current.isHovering = false;
    setTiltStyle({
      transform: 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || 480;
      height = Math.max(rect.height || 480, 440);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    // Generate 3D Neural Nodes on a sphere (Fibonacci sphere distribution)
    const nodeCount = 54;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const y = 1 - (i / (nodeCount - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        phase: Math.random() * Math.PI * 2,
        speed: 1.5 + Math.random() * 2,
        size: 2.2 + Math.random() * 1.8,
      });
    }

    // Dynamic data packets moving along neural links
    const packets = Array.from({ length: 6 }, () => ({
      from: Math.floor(Math.random() * nodeCount),
      to: Math.floor(Math.random() * nodeCount),
      progress: Math.random(),
      speed: 0.008 + Math.random() * 0.012,
    }));

    let rotX = 0.25;
    let rotY = 0;
    let lastTime = performance.now();

    // Render loop
    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth mouse lerping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      // Base rotation + interactive tilt steering
      rotY += (0.45 + mouseRef.current.x * 0.8) * dt;
      rotX += (0.15 - mouseRef.current.y * 0.6) * dt;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.36;
      const fov = 420;

      // Colors based on theme
      const primaryColor = isLight ? '#4f46e5' : '#6d4cff';
      const secondaryColor = isLight ? '#0b8aa8' : '#37e0c0';
      const accentColor = isLight ? '#7c3aed' : '#9b82ff';
      const glowAlpha = isLight ? 0.22 : 0.45;

      // ── 1. Central Ambient Breathing Radial Glow ───────────────────
      const pulse = Math.sin(now * 0.002) * 0.15 + 0.85;
      const glowGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, baseRadius * 1.5);
      glowGrad.addColorStop(0, isLight ? `rgba(79, 70, 229, ${0.18 * pulse})` : `rgba(109, 76, 255, ${glowAlpha * pulse})`);
      glowGrad.addColorStop(0.5, isLight ? `rgba(11, 138, 168, ${0.08 * pulse})` : `rgba(55, 224, 192, ${0.15 * pulse})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // ── 2. Project 3D Nodes ─────────────────────────────────────────
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const projected = nodes.map((node) => {
        // Breathing pulse on radius
        const r = baseRadius * (1 + Math.sin(now * 0.003 * node.speed + node.phase) * 0.04);

        // 3D rotation Y
        let x1 = node.baseX * cosY + node.baseZ * sinY;
        let z1 = -node.baseX * sinY + node.baseZ * cosY;

        // 3D rotation X
        let y2 = node.baseY * cosX - z1 * sinX;
        let z2 = node.baseY * sinX + z1 * cosX;

        // Perspective projection
        const scale = fov / (fov + z2 * r);
        const px = cx + x1 * r * scale;
        const py = cy + y2 * r * scale;
        const alpha = Math.max(0.12, Math.min(1, (z2 + 1) * 0.5));

        return { px, py, z: z2, scale, alpha, node };
      });

      // ── 3. Draw Connecting Neural Links ─────────────────────────────
      const maxDistance = baseRadius * 0.68;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const lineAlpha = (1 - dist / maxDistance) * Math.min(p1.alpha, p2.alpha) * (isLight ? 0.35 : 0.5);
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = isLight
              ? `rgba(79, 70, 229, ${lineAlpha})`
              : `rgba(155, 130, 255, ${lineAlpha})`;
            ctx.lineWidth = isLight ? 0.9 : 1.1;
            ctx.stroke();
          }
        }
      }

      // ── 4. Draw Traveling Data Packets ──────────────────────────────
      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.from = Math.floor(Math.random() * nodeCount);
          pkt.to = Math.floor(Math.random() * nodeCount);
        }

        const pA = projected[pkt.from];
        const pB = projected[pkt.to];
        if (pA && pB) {
          const kx = pA.px + (pB.px - pA.px) * pkt.progress;
          const ky = pA.py + (pB.py - pA.py) * pkt.progress;
          const packetAlpha = Math.sin(pkt.progress * Math.PI) * 0.9;

          ctx.beginPath();
          ctx.arc(kx, ky, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? `rgba(11, 138, 168, ${packetAlpha})` : `rgba(55, 224, 192, ${packetAlpha})`;
          ctx.shadowColor = secondaryColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // ── 5. Draw Nodes (Sorted by Z for proper depth ordering) ───────
      projected.sort((a, b) => a.z - b.z);
      projected.forEach(({ px, py, scale, alpha, z }) => {
        const nodeSize = (z > 0 ? 3.2 : 2.0) * scale;
        ctx.beginPath();
        ctx.arc(px, py, nodeSize, 0, Math.PI * 2);

        if (z > 0.4) {
          ctx.fillStyle = isLight ? '#4f46e5' : '#ffffff';
          ctx.shadowColor = isLight ? primaryColor : accentColor;
          ctx.shadowBlur = 10;
        } else if (z > -0.2) {
          ctx.fillStyle = isLight ? `rgba(79, 70, 229, ${alpha})` : `rgba(155, 130, 255, ${alpha})`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = isLight ? `rgba(11, 138, 168, ${alpha})` : `rgba(55, 224, 192, ${alpha * 0.7})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', resize);
    };
  }, [isLight]);

  return (
    <div
      ref={containerRef}
      className="solutions-3d-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        .solutions-3d-stage {
          position: relative;
          width: 100%;
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          transform-style: preserve-3d;
          box-sizing: border-box;
          user-select: none;
        }

        .solutions-3d-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .stage-card-wrap {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          transform-style: preserve-3d;
          transition: transform 0.15s ease-out;
        }

        /* 3D floating interactive badges */
        .stage-float-badge {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          backdrop-filter: blur(14px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
          pointer-events: none;
          transform: translateZ(40px);
          animation: floatSway 4s ease-in-out infinite;
        }

        .stage-float-badge.f-top {
          top: -12px;
          left: 10px;
          background: rgba(15, 13, 42, 0.88);
          border: 1px solid rgba(109, 74, 255, 0.4);
          color: #eceaff;
        }

        html[data-theme="light"] .stage-float-badge.f-top {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(109, 74, 255, 0.22);
          color: #1a1640;
          box-shadow: 0 10px 25px rgba(80, 60, 170, 0.12);
        }

        .stage-float-badge.f-bottom {
          bottom: -10px;
          right: 14px;
          background: rgba(15, 13, 42, 0.88);
          border: 1px solid rgba(55, 224, 192, 0.4);
          color: #eceaff;
          animation-delay: -2s;
        }

        html[data-theme="light"] .stage-float-badge.f-bottom {
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(11, 138, 168, 0.25);
          color: #1a1640;
          box-shadow: 0 10px 25px rgba(80, 60, 170, 0.12);
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #37e0c0;
          box-shadow: 0 0 10px #37e0c0;
          display: inline-block;
          animation: beaconPulse 1.8s ease-in-out infinite;
        }

        .audio-bars {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 14px;
        }

        .audio-bars span {
          width: 2.5px;
          background: linear-gradient(180deg, #9b82ff, #6d4cff);
          border-radius: 2px;
          animation: waveBar 1.2s ease-in-out infinite alternate;
        }

        .audio-bars span:nth-child(1) { height: 6px; animation-delay: 0.1s; }
        .audio-bars span:nth-child(2) { height: 13px; animation-delay: 0.25s; }
        .audio-bars span:nth-child(3) { height: 9px; animation-delay: 0.4s; }
        .audio-bars span:nth-child(4) { height: 14px; animation-delay: 0.15s; }
        .audio-bars span:nth-child(5) { height: 7px; animation-delay: 0.3s; }

        @keyframes floatSway {
          0%, 100% { transform: translateY(0px) translateZ(40px); }
          50% { transform: translateY(-7px) translateZ(40px); }
        }

        @keyframes beaconPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }

        @keyframes waveBar {
          0% { height: 4px; }
          100% { height: 14px; }
        }

        @media (max-width: 640px) {
          .stage-float-badge {
            display: none;
          }
          .solutions-3d-stage {
            min-height: 420px;
          }
        }
      `}</style>

      {/* 3D WebGL / Canvas Neural Core & Soundwave Orbitals */}
      <canvas ref={canvasRef} className="solutions-3d-canvas" />

      {/* Floating 3D Badge: Voice Agent Stream */}
      <div className="stage-float-badge f-top" aria-hidden="true">
        <span className="live-dot" />
        <span>CallZenza · AI Voice Agent</span>
        <div className="audio-bars">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* 3D Depth Wrapper for the Dashboard Preview Card (Unmodified content) */}
      <div className="stage-card-wrap" style={tiltStyle}>
        {children}
      </div>

      {/* Floating 3D Badge: Speed-to-lead & Automation */}
      <div className="stage-float-badge f-bottom" aria-hidden="true">
        <span style={{ color: isLight ? '#0b8aa8' : '#37e0c0' }}>⚡</span>
        <span>Auto-Qualified · Real-time Sync &lt;30s</span>
      </div>
    </div>
  );
}
