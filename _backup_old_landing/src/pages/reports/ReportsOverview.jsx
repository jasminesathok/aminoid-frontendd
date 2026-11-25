import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  BarChart2, TrendingUp, Users, DollarSign, Activity,
  Download, Clock, RefreshCw, ChevronRight, Star, Play,
  FileText, PieChart, Zap, Calendar,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const reportCards = [
  {
    title: 'Sales Report',       icon: DollarSign,  color: '#939BFF',
    desc: 'Revenue, orders, top products and regional breakdown.',
    lastRun: '2 hours ago', freq: 'Daily', path: '/reports/sales', starred: true,
  },
  {
    title: 'Analytics Report',   icon: BarChart2,   color: '#C4B5F4',
    desc: 'Traffic sources, user behaviour, funnel conversion.',
    lastRun: '1 day ago',   freq: 'Weekly', path: '/reports/analytics', starred: true,
  },
  {
    title: 'Performance Report', icon: TrendingUp,  color: '#10b981',
    desc: 'Team KPIs, goal progress and departmental scorecards.',
    lastRun: '3 days ago',  freq: 'Monthly', path: '/reports/performance', starred: false,
  },
  {
    title: 'Custom Report',      icon: Zap,         color: '#f59e0b',
    desc: 'Build any report from scratch with filters and export.',
    lastRun: '5 days ago',  freq: 'On demand', path: '/reports/custom', starred: false,
  },
];

const recentRuns = [
  { report: 'Sales Report',        ran: 'Today, 09:14',   rows: 1240, status: 'Success', color: '#939BFF' },
  { report: 'Analytics Report',    ran: 'Yesterday, 18:00',rows: 8420, status: 'Success', color: '#C4B5F4' },
  { report: 'Sales Report',        ran: 'Yesterday, 09:12',rows: 1198, status: 'Success', color: '#939BFF' },
  { report: 'Performance Report',  ran: '3 days ago',     rows: 248,  status: 'Success', color: '#10b981' },
  { report: 'Custom Report',       ran: '5 days ago',     rows: 320,  status: 'Failed',  color: '#f59e0b' },
];

const scheduled = [
  { report: 'Sales Report',       next: 'Today, 21:00',    freq: 'Daily',   icon: DollarSign,  color: '#939BFF' },
  { report: 'Analytics Report',   next: 'Mon, 08:00',      freq: 'Weekly',  icon: BarChart2,   color: '#C4B5F4' },
  { report: 'Performance Report', next: '01 Apr, 09:00',   freq: 'Monthly', icon: TrendingUp,  color: '#10b981' },
];

export default function ReportsOverview() {
  const navigate  = useNavigate();
  const toast     = useToast();
  const [search,   setSearch]   = useState('');
  const [overview, setOverview] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/reports/overview')
      .then(res => setOverview(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = reportCards.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const runs = overview?.recentRuns || [];

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              All your business reports in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-56 border border-white/5">
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search reports..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Projects',  value: overview?.totalProjects  ?? '0', color: '#939BFF', icon: FileText  },
            { label: 'Total Tasks',     value: overview?.totalTasks     ?? '0', color: '#C4B5F4', icon: Calendar  },
            { label: 'Total Employees', value: overview?.totalEmployees ?? '0', color: '#10b981', icon: RefreshCw },
            { label: 'Total Invoices',  value: overview?.totalInvoices  ?? '0', color: '#f59e0b', icon: Download  },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}
              className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400 font-medium">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Report cards grid */}
        <div>
          <h2 className="text-base font-bold dark:text-white mb-4">All Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.a
                  key={i} href={r.path}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="glass-card p-6 rounded-2xl flex items-start gap-5 group cursor-pointer no-underline"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                    style={{ background: `linear-gradient(135deg,${r.color},${r.color}88)`, boxShadow: `0 6px 20px ${r.color}44` }}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold dark:text-white">{r.title}</p>
                          {r.starred && <Star size={13} className="text-amber-400 fill-amber-400" />}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
                      </div>
                      <ChevronRight size={16}
                        className="text-slate-400 group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock size={12} /> Frequency: <span className="font-semibold">{r.freq}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${r.color}18`, color: r.color }}>{r.freq}</span>
                      </div>
                      <button
                        className="ml-auto flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        onClick={e => { e.preventDefault(); navigate(r.path); }}>
                        <Play size={11} fill="currentColor" /> Run now
                      </button>
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent runs */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-base font-bold dark:text-white mb-5">Recent Activity Reports</h2>
            <div className="space-y-3">
              {runs.map((r, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${r.color}18`, color: r.color }}>
                    <FileText size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold dark:text-white truncate">{r.report}</p>
                    <p className="text-xs text-slate-400">{r.ran} · {r.rows.toLocaleString()} rows processed</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'Success'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}>{r.status}</span>
                    <button className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors">
                      <Download size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {runs.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">No recent activity found.</div>
              )}
            </div>
          </div>

          {/* Scheduled reports */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold dark:text-white">Scheduled Reports</h2>
              <button
                className="text-xs font-bold text-primary hover:underline"
                onClick={() => toast.info('Scheduled reports coming soon.')}>
                + Schedule
              </button>
            </div>
            <div className="space-y-3">
              {scheduled.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${s.color}18`, color: s.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold dark:text-white">{s.report}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-400">Next: <span className="font-semibold">{s.next}</span></p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{ background: `${s.color}18`, color: s.color }}>{s.freq}</span>
                  </div>
                );
              })}
            </div>

            {/* Quick export row */}
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Export</p>
              <div className="flex gap-2 flex-wrap">
                {['PDF','CSV','Excel','JSON'].map(fmt => (
                  <button key={fmt}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
                    <Download size={12} /> {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}