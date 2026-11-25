import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Eye, MousePointerClick, Users, Clock,
  Download, Globe, Smartphone, Monitor, ArrowUpRight,
  MoreVertical,
} from 'lucide-react';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const PALETTE  = ['#939BFF', '#C4B5F4', '#AEE9FF', '#B6EADA', '#7B99D9', '#f59e0b', '#10b981'];

const devices = [
  { type: 'Desktop', pct: 58, icon: Monitor,    color: '#939BFF' },
  { type: 'Mobile',  pct: 36, icon: Smartphone, color: '#C4B5F4' },
  { type: 'Tablet',  pct:  6, icon: Globe,      color: '#AEE9FF' },
];

export default function AnalyticsReport() {
  const [period,    setPeriod]    = useState('Last 7 Days');
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const fetchData = (p) => {
    setLoading(true);
    const params = p === 'Last 7 Days' ? '?days=7' : p === 'Last 30 Days' ? '?days=30' : '?days=90';
    api.get('/api/reports/analytics' + params)
      .then(res => setAnalytics(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(period); }, []);

  const handlePeriodChange = (p) => { setPeriod(p); fetchData(p); };

  const weeklySessions = analytics?.weeklySessions || Array(7).fill(0);
  const channels = (analytics?.channels || []).map((c, i) => ({ ...c, color: PALETTE[i % PALETTE.length] }));
  const funnel   = (analytics?.funnel   || []).map((f, i) => ({ ...f, color: PALETTE[i % PALETTE.length] }));

  const maxWeek = Math.max(...weeklySessions, 1);
  const peakIdx = weeklySessions.indexOf(Math.max(...weeklySessions));

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Analytics Report</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Traffic, user behaviour and conversion funnel.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {['Last 7 Days', 'Last 30 Days', 'Last 90 Days'].map(p => (
                <button key={p} onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    period === p ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'
                  }`}>{p}</button>
              ))}
            </div>
            <button
              onClick={() => {
                const csv = ['Day,Sessions', ...weeklySessions.map((v,i) => weekDays[i]+','+v)].join('\n');
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                a.download = 'analytics-report.csv'; a.click();
              }}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Page Views',      value: analytics?.pageViews?.toLocaleString()      ?? '—', color: '#939BFF', icon: Eye              },
            { label: 'Unique Visitors', value: analytics?.uniqueVisitors?.toLocaleString() ?? '—', color: '#C4B5F4', icon: Users            },
            { label: 'Avg. Session',    value: analytics?.avgSessionDuration               ?? '—', color: '#10b981', icon: Clock            },
            { label: 'Bounce Rate',     value: analytics?.bounceRate                       ?? '—', color: '#f59e0b', icon: MousePointerClick },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
                <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 mt-0.5">
                  <ArrowUpRight size={10} />Live data
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Weekly chart + device split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold dark:text-white">New Leads — Last 7 Days</h2>
              <button className="text-slate-400"><MoreVertical size={16} /></button>
            </div>
            <div className="flex items-end gap-3 h-44">
              {weeklySessions.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">{v}</span>
                  <div className="w-full flex items-end justify-center" style={{ height: 140 }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: v > 0 ? `${(v / maxWeek) * 100}%` : '3px' }}
                      transition={{ duration: 0.8, delay: i * 0.07 }}
                      className="w-full rounded-t-xl cursor-pointer relative overflow-hidden"
                      style={{
                        background: i === peakIdx && v > 0
                          ? 'linear-gradient(180deg,#939BFF,#C4B5F4)'
                          : v > 0
                            ? 'linear-gradient(180deg,rgba(147,155,255,0.45),rgba(196,181,244,0.22))'
                            : 'rgba(148,163,184,0.15)',
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{weekDays[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-base font-bold dark:text-white mb-5">Device Breakdown</h2>
            <div className="flex h-5 rounded-full overflow-hidden mb-5 gap-0.5">
              {devices.map((d, i) => (
                <motion.div key={i}
                  initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
                  transition={{ duration: 1, delay: i * 0.15 }}
                  style={{ background: d.color }} title={`${d.type}: ${d.pct}%`}
                />
              ))}
            </div>
            <div className="space-y-3.5">
              {devices.map((d, i) => {
                const Icon = d.icon;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${d.color}18`, color: d.color }}>
                      <Icon size={15} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold dark:text-white">{d.type}</span>
                        <span className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
                          transition={{ duration: 1, delay: i * 0.15 + 0.3 }}
                          className="h-full rounded-full" style={{ background: d.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Traffic sources + conversion funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-base font-bold dark:text-white mb-5">Leads by Channel</h2>
            {channels.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No campaign data yet.</p>
            ) : (
              <div className="space-y-3.5">
                {channels.map((t, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="text-sm text-slate-500 dark:text-slate-400 w-32 shrink-0">{t.source}</span>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${t.pct}%` }}
                        transition={{ duration: 1, delay: i * 0.09 }}
                        className="h-full rounded-full" style={{ background: t.color }}
                      />
                    </div>
                    <span className="text-sm font-bold dark:text-white w-16 text-right">
                      {Number(t.sessions).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-base font-bold dark:text-white mb-5">Lead Conversion Funnel</h2>
            {funnel.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No lead data yet.</p>
            ) : (
              <div className="space-y-2.5">
                {funnel.map((f, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold dark:text-white">{f.stage}</span>
                      <span className="font-bold" style={{ color: f.color }}>
                        {Number(f.users).toLocaleString()}
                      </span>
                    </div>
                    <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.pct}%` }}
                        transition={{ duration: 1, delay: i * 0.12 }}
                        className="h-full rounded-xl flex items-center px-3"
                        style={{ background: `linear-gradient(90deg,${f.color},${f.color}88)` }}
                      >
                        <span className="text-white text-[9px] font-bold">{f.pct}%</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}