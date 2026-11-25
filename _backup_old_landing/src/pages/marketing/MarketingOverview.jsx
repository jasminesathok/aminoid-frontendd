import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, BarChart3, CircleDollarSign, Megaphone, MousePointer2,
  MoreVertical, Plus, RefreshCw, Target, TrendingUp, UsersRound,
} from 'lucide-react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';

const COLORS = ['#6D5EF7', '#16A394', '#F59E0B', '#EC6A5C', '#3B82F6', '#A855F7'];

const formatNumber = (value) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));

function ActionMenu({ onRefresh, onExport, detailsTo, label }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const toggle = (event) => {
    event.stopPropagation();
    if (!open) {
      const rect = event.currentTarget.getBoundingClientRect();
      const menuHeight = 150;
      const top = rect.bottom + 6 + menuHeight > window.innerHeight ? rect.top - menuHeight - 6 : rect.bottom + 6;
      setPosition({ top, right: window.innerWidth - rect.right });
    }
    setOpen(!open);
  };

  useEffect(() => {
    const close = () => setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return <>
    <div className="relative">
      <button onClick={toggle} aria-label={`Actions for ${label}`}
        className="w-8 h-8 -mr-2 -mt-1 rounded-lg grid place-items-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors">
        <MoreVertical size={18} />
      </button>
    </div>
    {open && position && createPortal(<div onClick={(event) => event.stopPropagation()} style={position} className="fixed z-[100] w-36 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/20">
        <Link to={detailsTo} onClick={() => setOpen(false)} className="block px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">View details</Link>
        <button onClick={() => { onRefresh(); setOpen(false); }} className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Refresh</button>
        <button onClick={() => { onExport(); setOpen(false); }} className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Export</button>
        <Link to="/setup/company" onClick={() => setOpen(false)} className="block px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">Settings</Link>
      </div>, document.body)}
  </>;
}

function MetricCard({ label, value, caption, icon: Icon, tone, delay, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="glass-card rounded-2xl p-5 min-h-[154px] flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <div className="flex items-start gap-1"><span className="w-10 h-10 rounded-xl grid place-items-center" style={{ color: tone, background: `${tone}18` }}><Icon size={20} /></span><ActionMenu {...actions} label={label} /></div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</p>
        <p className="mt-1.5 text-xs text-slate-400">{caption}</p>
      </div>
    </motion.div>
  );
}

function RevenueTrend({ trend, onRefresh }) {
  const width = 720;
  const height = 220;
  const padding = { top: 22, right: 20, bottom: 32, left: 20 };
  const maxValue = Math.max(...trend.map(item => Number(item.value || 0)), 1);
  const points = trend.map((item, index) => ({
    x: padding.left + (index * (width - padding.left - padding.right)) / Math.max(1, trend.length - 1),
    y: padding.top + (height - padding.top - padding.bottom) * (1 - Number(item.value || 0) / maxValue),
    ...item,
  }));
  const line = points.map(({ x, y }) => `${x},${y}`).join(' ');
  const area = `${padding.left},${height - padding.bottom} ${line} ${points.at(-1)?.x || width - padding.right},${height - padding.bottom}`;

  const exportPng = () => {
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = width * scale; canvas.height = height * scale;
    const context = canvas.getContext('2d');
    context.scale(scale, scale);
    context.fillStyle = '#131c2e'; context.fillRect(0, 0, width, height);
    context.strokeStyle = '#26344d'; context.lineWidth = 1;
    [padding.top, height / 2, height - padding.bottom].forEach(y => { context.beginPath(); context.moveTo(padding.left, y); context.lineTo(width - padding.right, y); context.stroke(); });
    const gradient = context.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(109, 94, 247, .38)'); gradient.addColorStop(1, 'rgba(109, 94, 247, 0)');
    context.beginPath(); context.moveTo(padding.left, height - padding.bottom); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.lineTo(point.x, point.y)); context.lineTo(points.at(-1)?.x || width - padding.right, height - padding.bottom); context.closePath(); context.fillStyle = gradient; context.fill();
    context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.strokeStyle = '#8b7cf6'; context.lineWidth = 3; context.lineJoin = 'round'; context.stroke();
    context.fillStyle = '#aebbd0'; context.font = '12px sans-serif'; context.textAlign = 'center'; points.forEach(point => context.fillText(point.label, point.x, height - 9));
    const link = document.createElement('a'); link.download = 'marketing-revenue-trend.png'; link.href = canvas.toDataURL('image/png'); link.click();
  };

  return <section className="glass-card rounded-2xl p-6">
    <div className="flex items-start justify-between gap-3">
      <div><h2 className="font-bold text-slate-900 dark:text-white">Revenue trend</h2><p className="mt-1 text-sm text-slate-400">Closed-won lead value over the last six months.</p></div>
      <ActionMenu onRefresh={onRefresh} onExport={exportPng} detailsTo="/marketing/leads" label="Revenue trend" />
    </div>
    <div className="mt-5 overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="block min-w-[560px] w-full h-56" role="img" aria-label="Revenue trend chart">
        <defs><linearGradient id="revenue-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6D5EF7" stopOpacity=".38" /><stop offset="100%" stopColor="#6D5EF7" stopOpacity="0" /></linearGradient></defs>
        {[padding.top, height / 2, height - padding.bottom].map(y => <line key={y} x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="3 4" />)}
        <polygon points={area} fill="url(#revenue-area)" />
        <polyline points={line} fill="none" stroke="#8b7cf6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(point => <g key={point.label}><circle cx={point.x} cy={point.y} r="4" fill="#8b7cf6" stroke="white" strokeWidth="2" className="dark:stroke-[#131c2e]" /><text x={point.x} y={height - 8} textAnchor="middle" className="fill-slate-400 text-[12px]">{point.label}</text></g>)}
      </svg>
    </div>
  </section>;
}

function EmptyState({ children }) {
  return <div className="min-h-36 grid place-items-center text-center text-sm text-slate-400 px-5">{children}</div>;
}

export default function MarketingOverview() {
  const { symbol } = useCurrency();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    try {
      const response = await api.get('/api/marketing/stats');
      setStats(response.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const channels = useMemo(() => (stats?.channels || []).map((channel, index) => ({
    ...channel,
    color: COLORS[index % COLORS.length],
  })), [stats]);
  const funnel = stats?.funnel || [];
  const totalSpend = Number(stats?.totalSpent || 0);
  const totalBudget = Number(stats?.totalBudget || 0);
  const budgetPercent = totalBudget ? Math.min(100, Math.round((totalSpend / totalBudget) * 100)) : 0;
  const topChannel = channels[0];
  const exportSnapshot = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total leads', stats?.totalLeads || 0], ['Closed won', stats?.closedWon || 0],
      ['Conversion rate', `${stats?.conversionRate || '0.0'}%`], ['Campaign budget', totalBudget], ['Campaign spend', totalSpend],
      [], ['Channel', 'Leads', 'Spend'], ...channels.map(({ name, leads, spend }) => [name, leads, spend]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'marketing-overview.csv'; link.click(); URL.revokeObjectURL(link.href);
  };
  const cardActions = (detailsTo) => ({ onRefresh: () => loadStats(true), onExport: exportSnapshot, detailsTo });

  if (loading) return (
    <DashboardLayout><div className="h-64 grid place-items-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>
  );

  return (
    <DashboardLayout>
      <main className="max-w-[1500px] mx-auto space-y-6 px-1 pb-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary">Marketing workspace</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Marketing overview</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A clear picture of your pipeline, campaigns and acquisition performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => loadStats(true)} disabled={refreshing} className="btn-secondary !px-3 flex items-center gap-2 text-sm disabled:opacity-60" aria-label="Refresh dashboard">
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link to="/marketing/campaigns" className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> New campaign</Link>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard label="Total leads" value={formatNumber(stats?.totalLeads)} caption="Leads captured across all sources" icon={UsersRound} tone="#6D5EF7" delay={0.03} actions={cardActions('/marketing/leads')} />
          <MetricCard label="Closed won" value={formatNumber(stats?.closedWon)} caption="Leads converted to customers" icon={Target} tone="#16A394" delay={0.08} actions={cardActions('/marketing/leads')} />
          <MetricCard label="Conversion rate" value={`${stats?.conversionRate || '0.0'}%`} caption="From lead to closed-won" icon={MousePointer2} tone="#F59E0B" delay={0.13} actions={cardActions('/marketing/leads')} />
          <MetricCard label="Campaign budget" value={`${symbol}${formatNumber(totalBudget)}`} caption={`${budgetPercent}% of budget spent`} icon={CircleDollarSign} tone="#EC6A5C" delay={0.18} actions={cardActions('/marketing/campaigns')} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3 glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">Conversion funnel</h2>
                <p className="mt-1 text-sm text-slate-400">How leads move through your marketing pipeline.</p>
              </div>
              <div className="flex items-center gap-2"><Link to="/marketing/leads" className="text-primary text-sm font-semibold inline-flex items-center gap-1 hover:opacity-80">View leads <ArrowRight size={15} /></Link><ActionMenu {...cardActions('/marketing/leads')} label="Conversion funnel" /></div>
            </div>
            {!funnel.length ? <EmptyState>Lead activity will appear here once your team starts adding leads.</EmptyState> : (
              <div className="mt-7 space-y-4">
                {funnel.map((item, index) => {
                  const color = COLORS[index % COLORS.length];
                  return <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{formatNumber(item.value)} <span className="font-medium text-slate-400">({item.pct}%)</span></span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: .65, delay: index * .08 }} className="h-full rounded-full" style={{ backgroundColor: color }} />
                    </div>
                  </div>;
                })}
              </div>
            )}
          </div>

          <div className="xl:col-span-2 rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6556e8 0%, #8b7cf6 100%)' }}>
            <div className="absolute -right-10 -bottom-12 h-44 w-44 rounded-full border-[28px] border-white/10" />
            <div className="relative h-full flex flex-col">
              <div className="flex justify-between"><span className="w-10 h-10 rounded-xl grid place-items-center bg-white/15"><TrendingUp size={20} /></span><ActionMenu {...cardActions('/marketing/campaigns')} label="Top acquisition channel" /></div>
              <p className="mt-7 text-sm text-white/70">Top acquisition channel</p>
              <h2 className="mt-1 text-2xl font-bold">{topChannel?.name || 'No data yet'}</h2>
              {topChannel ? <p className="mt-2 text-sm text-white/75"><strong className="text-white">{formatNumber(topChannel.leads)}</strong> leads generated · {topChannel.spend || `${symbol}0`} spent</p> : <p className="mt-2 text-sm text-white/75">Create a campaign to start tracking channel performance.</p>}
              <Link to="/marketing/campaigns" className="mt-auto pt-8 inline-flex items-center gap-2 text-sm font-bold hover:opacity-80">Explore campaigns <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        <RevenueTrend trend={stats?.revenueTrend || []} onRefresh={() => loadStats(true)} />

        <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          <div className="xl:col-span-3 glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="font-bold text-slate-900 dark:text-white">Performance by channel</h2><p className="mt-1 text-sm text-slate-400">Lead volume generated by each campaign channel.</p></div>
              <div className="flex items-center gap-2"><BarChart3 className="text-slate-400" size={20} /><ActionMenu {...cardActions('/marketing/campaigns')} label="Performance by channel" /></div>
            </div>
            {!channels.length ? <EmptyState>Campaign channels will appear here when campaign activity is available.</EmptyState> : (
              <div className="mt-7 space-y-5">
                {channels.map((channel) => <div className="grid grid-cols-[110px_1fr_66px] sm:grid-cols-[135px_1fr_90px] gap-3 items-center" key={channel.name}>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate"><i className="inline-block w-2 h-2 mr-2 rounded-full" style={{ backgroundColor: channel.color }} />{channel.name || 'Other'}</span>
                  <div className="h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${channel.pct}%` }} transition={{ duration: .65 }} className="h-full rounded-full" style={{ backgroundColor: channel.color }} /></div>
                  <span className="text-right text-sm font-bold text-slate-700 dark:text-white">{formatNumber(channel.leads)} <span className="hidden sm:inline text-xs font-medium text-slate-400">leads</span></span>
                </div>)}
              </div>
            )}
          </div>

          <div className="xl:col-span-2 glass-card rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><h2 className="font-bold text-slate-900 dark:text-white">Budget health</h2><p className="mt-1 text-sm text-slate-400">Spend across all campaigns.</p></div><div className="flex items-center gap-2"><Megaphone size={20} className="text-slate-400" /><ActionMenu {...cardActions('/marketing/campaigns')} label="Budget health" /></div></div>
            <div className="mt-8 flex items-end justify-between"><div><p className="text-sm text-slate-500">Total spent</p><p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{symbol}{formatNumber(totalSpend)}</p></div><span className="text-sm font-bold text-primary">{budgetPercent}% used</span></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${budgetPercent}%` }} transition={{ duration: .7 }} className="h-full rounded-full bg-primary" /></div>
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm"><span className="text-slate-400">Remaining budget</span><span className="font-bold text-slate-800 dark:text-white">{symbol}{formatNumber(Math.max(0, totalBudget - totalSpend))}</span></div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
