import React, { useState, useEffect, useCallback, useContext, createContext } from "react";
import { api } from "../../utils/api";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../components/ThemeContext";
import {
  Users,
  DollarSign,
  Package,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  LayoutGrid,
  TrendingUp,
  BarChart3,
  PieChart,
  ShieldCheck,
} from "lucide-react";

/* ── Theme context ────────────────────────────────────────── */
const ThemeCtx = createContext({ isDark: true, C: {} });

const mkC = (isDark) => ({
  // Backgrounds
  qBg: isDark
    ? "linear-gradient(165deg,rgba(19,28,46,0.95),rgba(13,17,23,1))"
    : "linear-gradient(165deg,rgba(248,250,252,0.98),rgba(241,245,249,1))",
  panelBg: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)",
  panelBorderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
  kpiBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
  kpiBorderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
  subtleBg: isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.03)",
  subtleBorderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
  // Text colours — progressively darker in light mode
  primaryText: isDark ? "#ffffff" : "#0f172a",      // main values, headings
  labelText: isDark ? "#94a3b8" : "#334155",        // slate-400 dark / slate-700 light
  mutedText: isDark ? "#64748b" : "#475569",        // slate-500 dark / slate-600 light
  dimText: isDark ? "#475569" : "#1e293b",          // slate-600 dark / slate-800 light
  // SVG
  svgText: isDark ? "rgba(255,255,255,0.45)" : "rgba(15,23,42,0.65)",
  svgGrid: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
  svgTrack: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.1)",
  svgGauge: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.1)",
  donutText: isDark ? "white" : "#0f172a",
  hbarTrack: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
  progressTrack: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)",
  // UI chrome
  tabNavBg: isDark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,0.95)",
  tabNavBorderColor: isDark ? "rgba(51,65,85,0.6)" : "rgba(148,163,184,0.5)",
  tabActiveBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.85)",
  tabActiveBorderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
  tabInactiveText: isDark ? "#64748b" : "#475569",
  refreshBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)",
  refreshBorderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.12)",
  refreshColor: isDark ? "#cbd5e1" : "#334155",
  liveStatusBg: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.05)",
  liveStatusBorderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)",
  dividerColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
  floatBg: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.95)",
  floatBorderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
  floatText: isDark ? "white" : "#0f172a",
  subtitleBar: isDark ? "#1e293b" : "#94a3b8",
});

/* ── helpers ─────────────────────────────────────────────── */
const Badge = ({ up, value }) => (
  <span
    className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
      up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
    }`}
  >
    {up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
    {value}
  </span>
);

const SectionTitle = ({ children, color }) => {
  const { C } = useContext(ThemeCtx);
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="h-3.5 w-1 rounded-full" style={{ background: color }} />
      <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: C.labelText }}>
        {children}
      </p>
    </div>
  );
};

const Skeleton = ({ className = "", style = {} }) => {
  const { isDark } = useContext(ThemeCtx);
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{
        background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
        ...style
      }}
    />
  );
};

const fmtNum = (n) => n == null ? "—" : Number(n) >= 1000000 ? `${(Number(n) / 1000000).toFixed(1)}M` : Number(n) >= 1000 ? `${(Number(n) / 1000).toFixed(1)}K` : String(n);
const fmtCurr = (n) => n == null ? "—" : `$${fmtNum(n)}`;

const KPIRow = ({ items }) => {
  const { C } = useContext(ThemeCtx);
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length},1fr)` }}>
      {items.map((k, i) => (
        <div
          key={i}
          className="rounded-xl p-4 transition-all"
          style={{ background: C.kpiBg, border: `1px solid ${C.kpiBorderColor}` }}
        >
          <p className="text-[10px] uppercase tracking-wider font-bold truncate mb-1" style={{ color: C.mutedText }}>
            {k.label}
          </p>
          <p className="text-xl font-black leading-none" style={{ color: k.color }}>
            {k.value}
          </p>
          {k.badge && <div className="mt-2"><Badge up={k.up} value={k.badge} /></div>}
        </div>
      ))}
    </div>
  );
};

/* ── SVG charts ──────────────────────────────────────────── */
const LineChart = ({ data, color, h = 52 }) => {
  const W = 260;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, h - ((v - min) / range) * (h - 8) - 4]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${W},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }}>
      <defs>
        <linearGradient id={`la${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#la${color.replace("#", "")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

const DualLine = ({ d1, d2, c1, c2, h = 68 }) => {
  const { C } = useContext(ThemeCtx);
  const W = 250;
  const all = [...d1, ...d2], min = Math.min(...all), max = Math.max(...all), range = max - min || 1;
  const pts = (d) => d.map((v, i) => [(i / (d.length - 1)) * W, h - ((v - min) / range) * (h - 10) - 5]);
  const path = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }}>
      {[0.25, 0.5, 0.75].map((r) => (
        <line key={r} x1="0" y1={h * r} x2={W} y2={h * r} stroke={C.svgGrid} strokeWidth="1" />
      ))}
      <path d={path(pts(d1))} fill="none" stroke={c1} strokeWidth="1.6" strokeLinecap="round" />
      <path d={path(pts(d2))} fill="none" stroke={c2} strokeWidth="1.6" strokeLinecap="round" strokeDasharray="4,3" />
    </svg>
  );
};

const BarChart = ({ data, color, h = 60, vals = false }) => {
  const { C } = useContext(ThemeCtx);
  const W = 220;
  const max = Math.max(...data.map((d) => d.v)) || 1;
  const bw = W / data.length - 3;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }}>
      <defs>
        <linearGradient id={`br${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".9" />
          <stop offset="100%" stopColor={color} stopOpacity=".35" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const bh = (d.v / max) * (h - 14);
        const x = i * (W / data.length) + 1.5, y = h - bh - 10;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx="2" fill={`url(#br${color.replace("#", "")})`} />
            {vals && <text x={x + bw / 2} y={y - 1} textAnchor="middle" fontSize="6.5" fill={color} fontWeight="800">{d.v}</text>}
            <text x={x + bw / 2} y={h - 1} textAnchor="middle" fontSize="6.5" fill={C.svgText}>{d.l}</text>
          </g>
        );
      })}
    </svg>
  );
};

const MultiBar = ({ groups, colors, h = 68 }) => {
  const { C } = useContext(ThemeCtx);
  const W = 230;
  const all = groups.flatMap((g) => g.vs), max = Math.max(...all) || 1;
  const gw = W / groups.length, bw = (gw - 8) / colors.length;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }}>
      {[0.33, 0.66].map((r) => (
        <line key={r} x1="0" y1={h * r} x2={W} y2={h * r} stroke={C.svgGrid} strokeWidth="1" />
      ))}
      {groups.map((g, gi) =>
        g.vs.map((v, vi) => {
          const bh = (v / max) * (h - 14), x = gi * gw + vi * (bw + 1) + 4, y = h - bh - 10;
          return <rect key={`${gi}-${vi}`} x={x} y={y} width={bw} height={bh} rx="1.5" fill={colors[vi]} opacity=".82" />;
        }),
      )}
      {groups.map((g, gi) => (
        <text key={gi} x={gi * gw + gw / 2} y={h - 1} textAnchor="middle" fontSize="6.5" fill={C.svgText}>{g.l}</text>
      ))}
    </svg>
  );
};

const Donut = ({ segs, size = 72 }) => {
  const { C } = useContext(ThemeCtx);
  const r = 27, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  const total = segs.reduce((s, v) => s + v.v, 0);
  let off = 0;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.svgTrack} strokeWidth="10" />
      {segs.map((s, i) => {
        const dash = (s.v / total) * circ, gap = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth="10"
            strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-off}
            style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }} />
        );
        off += dash;
        return el;
      })}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="900" fill={C.donutText}>
        {segs[0].v}%
      </text>
    </svg>
  );
};

const Gauge = ({ value, color, size = 70 }) => {
  const { C } = useContext(ThemeCtx);
  const r = 25, cx = size / 2, cy = size * 0.62, circ = Math.PI * r, dash = (value / 100) * circ;
  return (
    <svg viewBox={`0 0 ${size} ${size * 0.72}`} style={{ width: size, height: size * 0.72 }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={C.svgGauge} strokeWidth="7" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize="10" fontWeight="900" fill={color}>{value}%</text>
    </svg>
  );
};

const HBar = ({ label, value, max, color }) => {
  const { C } = useContext(ThemeCtx);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="truncate max-w-[120px] font-semibold" style={{ color: C.labelText }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: C.hbarTrack }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
};

const Funnel = ({ steps, color }) => {
  const { C } = useContext(ThemeCtx);
  return (
    <div className="space-y-0.5">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div
            className="h-4 rounded-sm flex items-center px-1.5"
            style={{
              width: `${s.pct}%`, minWidth: 32,
              background: `${color}${Math.round(255 * (1 - i * 0.14)).toString(16).padStart(2, "0")}`,
            }}
          >
            <span className="text-[7.5px] font-bold text-white truncate">{s.l}</span>
          </div>
          <span className="text-[8px] font-mono font-semibold" style={{ color: C.labelText }}>{s.v.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const TreeMap = ({ items }) => (
  <div className="flex flex-wrap gap-0.5" style={{ height: 72 }}>
    {items.map((t, i) => (
      <div key={i} className="flex items-center justify-center rounded text-[7px] font-bold text-white"
        style={{ flex: t.v, minWidth: 28, background: t.c, opacity: 0.85 }}>
        {t.l}
      </div>
    ))}
  </div>
);

const Spark = ({ data, color, h = 24 }) => {
  const W = 72;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, h - ((v - min) / range) * (h - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${h}`} style={{ width: W, height: h }}>
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

const AreaChart = ({ d1, d2, c1, c2, h = 68, fillOpacity = 0.15 }) => {
  const W = 250;
  const all = [...d1, ...d2], min = Math.min(...all), max = Math.max(...all), range = max - min || 1;
  const pts = (d) => d.map((v, i) => [(i / (d.length - 1)) * W, h - ((v - min) / range) * (h - 12) - 6]);
  const line = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = (p) => `${line(p)} L${W},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ height: h }}>
      <defs>
        <linearGradient id={`ga${c1.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c1} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`ga${c2.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c2} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area(pts(d1))} fill={`url(#ga${c1.replace("#", "")})`} />
      <path d={area(pts(d2))} fill={`url(#ga${c2.replace("#", "")})`} />
      <path d={line(pts(d1))} fill="none" stroke={c1} strokeWidth="2" strokeLinecap="round" />
      <path d={line(pts(d2))} fill="none" stroke={c2} strokeWidth="2" strokeLinecap="round" strokeDasharray="3,2" />
    </svg>
  );
};

const RadarChart = ({ data, color, size = 120 }) => {
  const { C } = useContext(ThemeCtx);
  const R = size / 2, cx = R, cy = R, r = R * 0.7;
  const pts = data.map((v, i) => {
    const ang = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    return [cx + Math.cos(ang) * (v / 100) * r, cy + Math.sin(ang) * (v / 100) * r];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size }}>
      {[0.4, 0.7, 1.0].map((f) => (
        <circle key={f} cx={cx} cy={cy} r={r * f} fill="none" stroke={C.svgTrack} strokeWidth="1" />
      ))}
      <path d={path} fill={`${color}20`} stroke={color} strokeWidth="1.5" />
      {data.map((_, i) => {
        const ang = (Math.PI * 2 * i) / data.length - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(ang) * r} y2={cy + Math.sin(ang) * r} stroke={C.svgTrack} strokeWidth="1" />;
      })}
    </svg>
  );
};

/* ── Quadrant wrapper ────────────────────────────────────── */
const Q = ({ title, subtitle, icon: Icon, accent, children, delay = 0, integrated = false }) => {
  const { C } = useContext(ThemeCtx);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-3xl flex flex-col overflow-hidden w-full ${integrated ? "h-full" : ""}`}
      style={{
        background: C.qBg,
        border: integrated ? `1px solid ${C.panelBorderColor}` : `1px solid ${accent}30`,
        boxShadow: integrated ? "none" : `0 0 50px ${accent}08, inset 0 1px 0 rgba(255,255,255,0.05)`,
        backdropFilter: "blur(40px)",
      }}
    >
      <div
        className={`px-6 flex items-center justify-between shrink-0 ${integrated ? "py-3" : "py-4"}`}
        style={{ borderBottom: `1px solid ${accent}20`, background: `linear-gradient(90deg, ${accent}10, transparent 60%)` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accent}25, ${accent}05)`, color: accent, border: `1px solid ${accent}20` }}
          >
            <Icon size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[2px] truncate italic"
              style={{ color: C.primaryText, textShadow: `0 0 15px ${accent}50` }}>
              {title}
            </p>
            {!integrated && (
              <p className="text-[9px] tracking-[1.5px] font-bold truncate uppercase italic" style={{ color: C.mutedText }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {!integrated && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg shrink-0"
            style={{ background: C.liveStatusBg, border: `1px solid ${C.liveStatusBorderColor}` }}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-2 h-2 rounded-full animate-ping opacity-40" style={{ background: accent }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
            </div>
            <span className="text-[9px] font-black tracking-[2px] leading-none uppercase italic" style={{ color: C.refreshColor }}>
              Live Status
            </span>
          </div>
        )}
      </div>
      <div className={`p-6 overflow-hidden ${integrated ? "flex-1 pt-4" : ""}`}>
        {children}
      </div>
    </motion.div>
  );
};

/* ── Finance Quadrant ────────────────────────────────────── */
const FinanceQ = ({ integrated = false, data, loading }) => {
  const { C } = useContext(ThemeCtx);

  const fallbackData = {
    revenueByMonth: [0, 0, 0, 0, 0, 0],
    profitByMonth: [0, 0, 0, 0, 0, 0],
    expenseCategories: [{ l: 'N/A', v: 0 }],
    budgetUtil: 0,
    ebitda: 0,
    cashFlow: 0,
    totalRevenue: 0,
    totalProfit: 0,
  };
  const d = data || fallbackData;

  return (
    <div className={`flex flex-col h-full ${integrated ? "gap-4" : "gap-6"}`}>
      {!integrated && (
        <div className="min-h-[100px]">
          {loading ? <Skeleton className="h-24 w-full rounded-xl" /> : (
            <KPIRow items={[
              { label: "Revenue", value: fmtCurr(d.totalRevenue), color: "#4ADE80" },
              { label: "Net Profit", value: fmtCurr(d.totalProfit), color: "#60A5FA" },
              { label: "EBITDA", value: `${d.ebitda}%`, color: "#FBBF24" },
              { label: "Cash Flow", value: fmtCurr(d.cashFlow), color: "#A78BFA" },
            ]} />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#4ADE80">Quarterly Rev & Profit</SectionTitle>
          <div className="flex-1 min-h-0 mt-2">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <AreaChart d1={d.revenueByMonth} d2={d.profitByMonth} c1="#4ADE80" c2="#60A5FA" h={integrated ? 80 : 120} />
            )}
          </div>
          <div className="flex gap-4 mt-3">
            {[{ c: "#4ADE80", l: `Rev ${fmtCurr(d.totalRevenue)}` }, { c: "#60A5FA", l: `Profit ${fmtCurr(d.totalProfit)}` }].map((x, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded" style={{ background: x.c }} />
                <span className="text-[9px] font-bold uppercase" style={{ color: C.mutedText }}>{loading ? "..." : x.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#FBBF24">Expense Categories</SectionTitle>
          <div className="flex-1 min-h-0 mt-2">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <BarChart data={d.expenseCategories} color="#FBBF24" h={integrated ? 80 : 120} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
          <SectionTitle color="#F472B6">Budget Util.</SectionTitle>
          {loading ? <Skeleton className="h-16 w-16 rounded-full" /> : <Gauge value={d.budgetUtil} color="#F472B6" size={80} />}
        </div>
        <div className="col-span-2 rounded-xl p-4 flex items-center justify-around" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: C.mutedText }}>EBITDA</p>
            {loading ? <Skeleton className="h-6 w-16" /> : (
              <p className="text-xl font-black" style={{ color: C.primaryText }}>{d.ebitda}%</p>
            )}
            <p className="text-[8px] text-emerald-400 font-bold">USD</p>
          </div>
          <div className="w-px h-8" style={{ background: C.dividerColor }} />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: C.mutedText }}>Cash Flow</p>
            {loading ? <Skeleton className="h-6 w-20" /> : (
              <p className="text-xl font-black text-[#60A5FA]">{fmtCurr(d.cashFlow)}</p>
            )}
            <p className="text-[8px] text-emerald-400 font-bold">USD</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── HR Quadrant ─────────────────────────────────────────── */
const HRQ = ({ integrated = false, data, loading }) => {
  const { C } = useContext(ThemeCtx);

  const fallbackData = {
    headcountTrend: [0, 0, 0, 0, 0, 0],
    turnoverTrend: [0, 0, 0, 0, 0, 0],
    deptDistribution: [{ l: 'N/A', v: 0, c: '#60A5FA' }],
    diversitySegs: [{ c: '#60A5FA', v: 100 }],
    avgTimeToHire: 0,
    employeeNps: 0,
    totalHeadcount: 0,
  };
  const d = data || fallbackData;

  return (
    <div className={`flex flex-col h-full ${integrated ? "gap-4" : "gap-6"}`}>
      {!integrated && (
        <div className="min-h-[100px]">
          {loading ? <Skeleton className="h-24 w-full rounded-xl" /> : (
            <KPIRow items={[
              { label: "Headcount", value: String(d.totalHeadcount), color: "#60A5FA" },
              { label: "Open Roles", value: "—", color: "#FBBF24" }, // Not dynamic yet
              { label: "Time-to-Hire", value: `${d.avgTimeToHire}d`, color: "#F472B6" },
              { label: "Emp. NPS", value: d.employeeNps > 0 ? `+${d.employeeNps}` : String(d.employeeNps), color: "#34D399" },
            ]} />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#34D399">Headcount vs Turnover</SectionTitle>
          <div className="flex-1 min-h-0 mt-2">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <AreaChart d1={d.headcountTrend} d2={d.turnoverTrend} c1="#34D399" c2="#F87171" h={integrated ? 80 : 120} />
            )}
          </div>
          <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-widest px-1" style={{ color: C.dimText }}>
            <span>6M AGO</span><span>NOW</span>
          </div>
        </div>

        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#60A5FA">Dept Distribution</SectionTitle>
          <div className="space-y-2 mt-2">
            {loading ? <Skeleton className="h-full w-full" /> : d.deptDistribution.map((item, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <div className="flex justify-between text-[8px] font-bold uppercase">
                  <span style={{ color: C.labelText }}>{item.l}</span>
                  <span style={{ color: C.labelText }}>{item.v}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: C.progressTrack }}>
                  <div className="h-full rounded-full" style={{ width: `${(item.v / (d.totalHeadcount || 1)) * 100}%`, background: item.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
          <SectionTitle color="#A78BFA">Diversity Index</SectionTitle>
          {loading ? <Skeleton className="h-16 w-16 rounded-full" /> : <Donut segs={d.diversitySegs} size={65} />}
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: C.mutedText }}>Avg Time to Hire</p>
            {loading ? <Skeleton className="h-6 w-16" /> : (
              <p className="text-xl font-black text-[#34D399]">{d.avgTimeToHire} Days</p>
            )}
          </div>
          <div className="rounded-xl p-4 flex flex-col items-center justify-center text-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: C.mutedText }}>Employee NPS</p>
            {loading ? <Skeleton className="h-6 w-16" /> : (
              <p className="text-xl font-black text-[#FBBF24]">{d.employeeNps > 0 ? `+${d.employeeNps}` : d.employeeNps}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Marketing Quadrant ──────────────────────────────────── */
const MarketingQ = ({ integrated = false, data, loading }) => {
  const { C } = useContext(ThemeCtx);

  const fallbackData = {
    funnel: [
      { l: "Leads", v: 0, pct: 100 },
      { l: "MQLs", v: 0, pct: 0 },
      { l: "SQLs", v: 0, pct: 0 },
      { l: "Won", v: 0, pct: 0 },
    ],
    engagementScores: [50, 50, 50, 50, 50],
    totalLeads: 0,
    cpl: 0,
    roi: 0,
  };
  const d = data || fallbackData;

  return (
    <div className={`flex flex-col h-full ${integrated ? "gap-4" : "gap-6"}`}>
      {!integrated && (
        <div className="min-h-[100px]">
          {loading ? <Skeleton className="h-24 w-full rounded-xl" /> : (
            <KPIRow items={[
              { label: "Total Leads", value: fmtNum(d.totalLeads), color: "#F472B6" },
              { label: "CPL", value: fmtCurr(d.cpl), color: "#FBBF24" },
              { label: "ROI", value: `${d.roi}×`, color: "#34D399" },
              { label: "Conv. Rate", value: `${d.funnel[3]?.pct || 0}%`, color: "#60A5FA" },
            ]} />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#F472B6">Marketing Funnel</SectionTitle>
          <div className="flex-1 mt-2 min-h-0 overflow-hidden flex flex-col justify-center">
            {loading ? <Skeleton className="h-full w-full" /> : <Funnel steps={d.funnel} color="#F472B6" />}
          </div>
          <div className="mt-2 text-center text-[9px] font-black text-[#F472B6] uppercase tracking-widest">
            {loading ? <Skeleton className="h-2 w-16 mx-auto" /> : (
              <>Total Leads: {d.totalLeads.toLocaleString()} <span className="ml-1" style={{ color: C.mutedText }}>{" >> "} 🔥</span></>
            )}
          </div>
        </div>

        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#A78BFA">Engagement Score</SectionTitle>
          <div className="mt-2">
            {loading ? <Skeleton className="h-24 w-24 rounded-full" /> : <RadarChart data={d.engagementScores} color="#A78BFA" size={integrated ? 90 : 120} />}
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
            {["Reach", "Spend", "Conv"].map((l, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: ["#A78BFA", "#F472B6", "#60A5FA"][i] }} />
                <span className="text-[8px] font-bold uppercase" style={{ color: C.mutedText }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
          <SectionTitle color="#60A5FA">Leads by Channel</SectionTitle>
          <div className="mt-1">
            {loading ? <Skeleton className="h-10 w-full" /> : (
              <BarChart data={[{ l: "SM", v: 80 }, { l: "EM", v: 60 }, { l: "SE", v: 95 }]} color="#60A5FA" h={40} />
            )}
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <div className="rounded-xl p-3 flex flex-col items-center justify-center text-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
            <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: C.mutedText }}>CPL</p>
            {loading ? <Skeleton className="h-6 w-16" /> : (
              <p className="text-lg font-black text-[#FBBF24]">{fmtCurr(d.cpl)}</p>
            )}
          </div>
          <div className="rounded-xl p-3 flex flex-col items-center justify-center text-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
            <p className="text-[8px] font-black uppercase tracking-widest mb-0.5" style={{ color: C.mutedText }}>ROI</p>
            {loading ? <Skeleton className="h-6 w-12" /> : (
              <p className="text-lg font-black text-[#34D399]">{d.roi}x</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Inventory Quadrant ──────────────────────────────────── */
const InventoryQ = ({ integrated = false, data, loading }) => {
  const { C } = useContext(ThemeCtx);

  const fallbackData = {
    valueByCategory: [{ l: 'N/A', v: 0, c: '#60A5FA' }],
    stockAlerts: [{ s: 'N/A', cur: 'Current', c: '#64748B', pct: 0 }],
    totalSKUs: 0,
    stockouts: 0,
    outOfStock: 0,
  };
  const d = data || fallbackData;

  return (
    <div className={`flex flex-col h-full ${integrated ? "gap-4" : "gap-6"}`}>
      {!integrated && (
        <div className="min-h-[100px]">
          {loading ? <Skeleton className="h-24 w-full rounded-xl" /> : (
            <KPIRow items={[
              { label: "Total SKUs", value: fmtNum(d.totalSKUs), color: "#60A5FA" },
              { label: "Stockout", value: String(d.stockouts), color: "#F87171" },
              { label: "Days to Sell", value: "—", color: "#FBBF24" }, // Not dynamic yet
              { label: "Out of Stock", value: String(d.outOfStock), color: "#F472B6" },
            ]} />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#60A5FA">Value by Category</SectionTitle>
          <div className="flex-1 mt-2 min-h-0 overflow-hidden">
            {loading ? <Skeleton className="h-full w-full" /> : <TreeMap items={d.valueByCategory} />}
          </div>
        </div>

        <div className="rounded-xl p-4 flex flex-col" style={{ background: C.panelBg, border: `1px solid ${C.panelBorderColor}` }}>
          <SectionTitle color="#FBBF24">Stock Alerts</SectionTitle>
          <div className="space-y-3 mt-2 overflow-hidden">
            {loading ? <Skeleton className="h-full w-full" /> : d.stockAlerts.map((r, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                  <span style={{ color: C.labelText }}>{r.s}</span>
                  <span style={{ color: r.c }}>{r.cur}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.progressTrack }}>
                  <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 shrink-0">
        <div className="rounded-xl p-4 flex flex-col items-center justify-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
          <SectionTitle color="#34D399">Turnover Rate</SectionTitle>
          <div className="mt-1">
            {loading ? <Skeleton className="h-10 w-full" /> : <Spark data={[3.2, 3.8, 3.5, 4.1, 3.9, 4.4]} color="#34D399" h={30} />}
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-3 gap-2">
          {[
            { label: "Stockouts", val: String(d.stockouts), color: "text-rose-500" },
            { label: "Days to Sell", val: "—", color: "text-[#60A5FA]" },
            { label: "Out of Stock", val: String(d.outOfStock), color: "text-orange-400" },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-2 text-center flex flex-col justify-center" style={{ background: C.subtleBg, border: `1px solid ${C.subtleBorderColor}` }}>
              <p className="text-[7px] font-black uppercase mb-0.5 whitespace-nowrap" style={{ color: C.mutedText }}>{item.label}</p>
              {loading ? <Skeleton className="h-6 w-8 mx-auto" /> : (
                <p className={`text-base font-black ${item.color}`}>{item.val}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Overview Tab ────────────────────────────────────────── */
const OverviewTab = ({ stats, users }) => {
  const { isDark, C } = useContext(ThemeCtx);
  const fmt = (n) => n == null ? "—" : Number(n) >= 1_000_000
    ? `$${(Number(n) / 1_000_000).toFixed(1)}M`
    : Number(n) >= 1_000 ? Number(n).toLocaleString() : String(n);

  const kpis = [
    { t: "Finance Health", v: stats ? fmt(stats.totalRevenue) : "—", l: "Total Revenue", i: DollarSign, c: "#4ADE80", s: stats ? `Net Profit: ${fmt(stats.netProfit)}` : "Loading…" },
    { t: "Human Capital", v: stats ? String(stats.totalEmployees) : "—", l: "Employees", i: Users, c: "#60A5FA", s: stats ? `${stats.totalUsers} total users` : "Loading…" },
    { t: "Active Projects", v: stats ? String(stats.activeProjects) : "—", l: "In Progress", i: Activity, c: "#F472B6", s: stats ? `${stats.completedProjects} completed` : "Loading…" },
    { t: "Invoices", v: stats ? String(stats.pendingInvoices) : "—", l: "Pending", i: Package, c: "#FBBF24", s: stats ? `${stats.overdueInvoices} overdue` : "Loading…" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-6">
        {kpis.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl p-6 relative overflow-hidden group transition-all cursor-pointer"
            style={{ background: C.kpiBg, border: `1px solid ${C.kpiBorderColor}` }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 transition-opacity group-hover:opacity-40" style={{ background: d.c }} />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: `${d.c}15`, color: d.c }}>
                  <d.i size={20} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[2px]" style={{ color: C.mutedText }}>{d.t}</p>
              </div>
              <p className="text-3xl font-black mb-1 tracking-tight" style={{ color: C.primaryText }}>{d.v}</p>
              <p className="text-[12px] font-semibold mb-4" style={{ color: C.labelText }}>{d.l}</p>
              <div className="pt-4 flex items-center gap-2" style={{ borderTop: `1px solid ${C.dividerColor}` }}>
                <div className="w-1 h-1 rounded-full animate-pulse" style={{ background: d.c }} />
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.labelText }}>{d.s}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {users && users.length > 0 && (
        <div className="rounded-3xl p-6" style={{ background: C.panelBg, border: `1px solid ${C.kpiBorderColor}` }}>
          <div className="mb-5">
            <SectionTitle color="#60A5FA">All Platform Users ({users.length})</SectionTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.dividerColor}` }}>
                  {["Name", "Email", "Role", "Joined"].map((h) => (
                    <th key={h} className="text-left text-[10px] font-black uppercase tracking-widest pb-3 pr-4" style={{ color: C.mutedText }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 8).map((u) => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.panelBorderColor}` }}>
                    <td className="py-2.5 pr-4 font-bold" style={{ color: C.primaryText }}>{u.first_name} {u.last_name}</td>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: C.labelText }}>{u.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        u.role === "super_admin" ? "bg-amber-500/15 text-amber-500" :
                        u.role === "admin" ? "bg-blue-500/15 text-blue-500" :
                        isDark ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-600"
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-2.5 font-medium" style={{ color: C.mutedText }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-3xl p-8" style={{ background: C.subtleBg, border: `1px solid ${C.kpiBorderColor}` }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black tracking-tight italic" style={{ color: C.primaryText }}>
              ENTERPRISE TRAJECTORY
            </h3>
            <p className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: C.mutedText }}>
              Monthly revenue growth vs total overhead
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full bg-[#4ADE80]" />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.labelText }}>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-b border-dashed border-[#60A5FA]" />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: C.labelText }}>Target</span>
            </div>
          </div>
        </div>
        <DualLine
          d1={[820, 960, 880, 1120, 1050, 1280, 1180, 1420, 1340, 1580, 1490, 1700]}
          d2={[450, 520, 480, 580, 565, 640, 610, 685, 655, 720, 700, 760]}
          c1="#4ADE80" c2="#60A5FA" h={240}
        />
      </div>
    </div>
  );
};

/* ── Integrated View ─────────────────────────────────────── */
const IntegratedView = ({ data, loading, onTabClick }) => (
  <div className="grid grid-cols-2 gap-6">
    <div onClick={() => onTabClick("finance")} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
      <Q title="Finance Dashboard" subtitle="Revenue & Profit Trajectory" icon={DollarSign} accent="#EAB308" integrated><FinanceQ integrated data={data?.finance} loading={loading} /></Q>
    </div>
    <div onClick={() => onTabClick("hr")} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
      <Q title="HR Dashboard" subtitle="Workforce Metrics & Analytics" icon={Users} accent="#10B981" integrated><HRQ integrated data={data?.hr} loading={loading} /></Q>
    </div>
    <div onClick={() => onTabClick("marketing")} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
      <Q title="Marketing Dashboard" subtitle="Lead Funnel & ROI Analytics" icon={Activity} accent="#D946EF" integrated><MarketingQ integrated data={data?.marketing} loading={loading} /></Q>
    </div>
    <div onClick={() => onTabClick("inventory")} className="cursor-pointer transition-transform hover:scale-[1.02] h-full">
      <Q title="Inventory Dashboard" subtitle="Supply Chain & Stock Status" icon={Package} accent="#F97316" integrated><InventoryQ integrated data={data?.inventory} loading={loading} /></Q>
    </div>
  </div>
);

const TabButton = ({ active, label, icon: Icon, onClick }) => {
  const { C } = useContext(ThemeCtx);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-6 py-3 rounded-2xl transition-all duration-300 relative group"
      style={{ color: active ? C.primaryText : C.tabInactiveText }}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 rounded-2xl"
          style={{ background: C.tabActiveBg, border: `1px solid ${C.tabActiveBorderColor}` }}
        />
      )}
      <Icon size={15} className="relative z-10 transition-transform group-hover:scale-110"
        style={{ color: active ? "#fbbf24" : C.tabInactiveText }} />
      <span className="relative z-10 text-[10px] font-black uppercase tracking-[2.5px] italic">
        {label}
      </span>
    </button>
  );
};

const TABS = [
  { id: "overview", l: "Overview", i: LayoutGrid },
  { id: "integrated", l: "Integrated", i: ShieldCheck },
  { id: "finance", l: "Finance", i: TrendingUp },
  { id: "hr", l: "HR", i: Users },
  { id: "marketing", l: "Marketing", i: BarChart3 },
  { id: "inventory", l: "Inventory", i: PieChart },
];

/* ── Main ────────────────────────────────────────────────── */
export default function MegaDashboard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const C = mkC(isDark);

  const [activeTab, setActiveTab] = useState("overview");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [spinning, setSpinning] = useState(false);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [integratedData, setIntegratedData] = useState(null);
  const [integratedLoading, setIntegratedLoading] = useState(true);

  const fetchData = useCallback(() => {
    setSpinning(true);
    setIntegratedLoading(true);
    Promise.all([
      api.get("/api/superadmin/mega-stats", { silent: true }),
      api.get("/api/superadmin/users", { silent: true }),
      api.get("/api/superadmin/integrated-metrics", { silent: true }),
    ])
      .then(([sRes, uRes, iRes]) => {
        setStats(sRes.data);
        setUsers(uRes.data);
        setIntegratedData(iRes.data);
        setLastRefresh(new Date());
      })
      .catch(() => {})
      .finally(() => {
        setSpinning(false);
        setIntegratedLoading(false);
      });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <ThemeCtx.Provider value={{ isDark, C }}>
      <DashboardLayout>
        <div className="space-y-6 max-w-full mx-auto pb-16 pt-4 px-8 relative">

          {/* Floating Exit Button */}
          <AnimatePresence>
            {activeTab === "integrated" && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                onClick={() => setActiveTab("overview")}
                className="fixed bottom-10 right-10 z-[100] group flex items-center gap-3 px-6 py-4 rounded-full backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] font-black uppercase tracking-[3px] italic text-[10px] transition-all"
                style={{ background: C.floatBg, border: `1px solid ${C.floatBorderColor}`, color: C.floatText }}
              >
                <RefreshCw size={14} className="text-amber-400 group-hover:rotate-180 transition-transform duration-700" />
                Exit Integrated View
              </motion.button>
            )}
          </AnimatePresence>

          {/* Header */}
          <AnimatePresence>
            {activeTab !== "integrated" && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-5 mb-1.5">
                    <div className="w-2 h-10 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                      style={{ background: "linear-gradient(180deg,#FBBF24,#F472B6)" }} />
                    <div className="flex flex-col">
                      <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none" style={{ color: C.primaryText }}>
                        Mega Dashboard
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-0.5 w-6 rounded-full" style={{ background: C.subtitleBar }} />
                        <p className="text-[10px] font-black tracking-[4px] uppercase italic whitespace-nowrap" style={{ color: C.mutedText }}>
                          Integrated Operations console
                        </p>
                      </div>
                    </div>
                    <span className="self-start text-[10px] font-black px-5 py-1.5 rounded-full border-2 border-[#FBBF24]/30 bg-[#FBBF24]/10 text-[#FBBF24] tracking-[3px] uppercase mt-1">
                      SUPER ADMIN L4
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[3px] mb-0.5" style={{ color: C.dimText }}>
                      Network Status
                    </span>
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      SYNCED {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                  </div>
                  <button
                    onClick={fetchData}
                    className="group flex items-center gap-3 text-[10px] font-black px-6 py-4 rounded-2xl transition-all uppercase tracking-[3px] hover:-translate-y-0.5 active:translate-y-px"
                    style={{ background: C.refreshBg, color: C.refreshColor, border: `1px solid ${C.refreshBorderColor}` }}
                  >
                    <RefreshCw size={14} className={spinning ? "animate-spin text-emerald-400" : "group-hover:rotate-180 transition-transform duration-700"} style={{ color: spinning ? undefined : C.mutedText }} />
                    Full Sync
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab Navigation */}
          <AnimatePresence>
            {activeTab !== "integrated" && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-2 p-2 rounded-[28px] w-fit shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
                style={{ background: C.tabNavBg, border: `1px solid ${C.tabNavBorderColor}` }}
              >
                {TABS.map((t) => (
                  <TabButton key={t.id} active={activeTab === t.id} label={t.l} icon={t.i} onClick={() => setActiveTab(t.id)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content Area */}
          <div className="relative min-h-[700px]">
            <AnimatePresence>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30, filter: "blur(15px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -30, filter: "blur(15px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="w-full">
                  {activeTab === "overview" && <OverviewTab stats={stats} users={users} />}
                  {activeTab === "integrated" && <IntegratedView data={integratedData} loading={integratedLoading} onTabClick={setActiveTab} />}
                  {activeTab === "finance" && <Q title="Finance Dashboard" subtitle="Financial Performance Overview" icon={DollarSign} accent="#4ADE80"><FinanceQ data={integratedData?.finance} loading={integratedLoading} /></Q>}
                  {activeTab === "hr" && <Q title="HR Dashboard" subtitle="Human Resources Metrics" icon={Users} accent="#60A5FA"><HRQ data={integratedData?.hr} loading={integratedLoading} /></Q>}
                  {activeTab === "marketing" && <Q title="Marketing Dashboard" subtitle="Campaign & Lead Performance" icon={Activity} accent="#F472B6"><MarketingQ data={integratedData?.marketing} loading={integratedLoading} /></Q>}
                  {activeTab === "inventory" && <Q title="Inventory Dashboard" subtitle="Inventory & Supply Chain Status" icon={Package} accent="#FBBF24"><InventoryQ data={integratedData?.inventory} loading={integratedLoading} /></Q>}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </DashboardLayout>
    </ThemeCtx.Provider>
  );
}
