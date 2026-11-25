import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Building2, Users, DollarSign, TrendingUp, GitBranch, Target } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';


const stageColors = {
  Prospecting:   '#939BFF',
  Qualification: '#f59e0b',
  Proposal:      '#3b82f6',
  Negotiation:   '#8b5cf6',
};

const dealStageStyle = {
  Prospecting:   { bg: 'bg-violet-500/10',  text: 'text-violet-500',  dot: 'bg-violet-500' },
  Qualification: { bg: 'bg-amber-500/10',   text: 'text-amber-600',   dot: 'bg-amber-500' },
  Proposal:      { bg: 'bg-blue-500/10',    text: 'text-blue-500',    dot: 'bg-blue-500' },
  Negotiation:   { bg: 'bg-purple-500/10',  text: 'text-purple-500',  dot: 'bg-purple-500' },
  'Closed Won':  { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  'Closed Lost': { bg: 'bg-rose-500/10',    text: 'text-rose-500',    dot: 'bg-rose-500' },
};

export default function SalesOverview() {
  const { fmt } = useCurrency();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/sales/overview').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const kpis = [
    { label: 'Total Accounts', value: data?.accounts ?? 0,            color: '#939BFF', icon: Building2  },
    { label: 'Total Contacts', value: data?.contacts ?? 0,            color: '#3b82f6', icon: Users      },
    { label: 'Pipeline Value', value: fmt(data?.totalValue),     color: '#10b981', icon: DollarSign },
    { label: 'Win Rate',       value: `${data?.winRate ?? 0}%`,       color: '#f59e0b', icon: Target     },
    { label: 'Deals Won',      value: data?.won ?? 0,                 color: '#10b981', icon: TrendingUp },
    { label: 'Deals Lost',     value: data?.lost ?? 0,                color: '#ef4444', icon: GitBranch  },
  ];

  const pipeline = data?.pipeline || [];
  const totalPipelineValue = pipeline.reduce((s, p) => s + Number(p.value), 0);

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Sales Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your CRM pipeline at a glance.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpis.map((k, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${k.color}18`, color: k.color }}>
                <k.icon size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold dark:text-white mt-0.5">{k.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Pipeline Funnel */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold dark:text-white mb-5">Active Pipeline by Stage</h3>
            {pipeline.length === 0
              ? <p className="text-slate-400 text-sm">No active deals in pipeline.</p>
              : <div className="space-y-4">
                  {pipeline.map((p, i) => {
                    const pct = totalPipelineValue > 0
                      ? Math.round((Number(p.value) / totalPipelineValue) * 100) : 0;
                    const color = stageColors[p.stage] || '#939BFF';
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold dark:text-slate-300">{p.stage}</span>
                          <span className="text-slate-400">{fmt(p.value)} · {p.count} deal{p.count !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full rounded-full" style={{ background: color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
            }
          </div>

          {/* Recent Deals */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold dark:text-white">Recent Deals</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {(data?.recentDeals || []).map((d, i) => {
                const st = dealStageStyle[d.stage] || dealStageStyle['Prospecting'];
                return (
                  <motion.div key={d.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div>
                      <p className="text-sm font-semibold dark:text-white">{d.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{d.account_name || '—'} · {d.owner || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold dark:text-white">{fmt(d.value)}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg mt-0.5 ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{d.stage}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {(!data?.recentDeals?.length) && (
                <p className="px-5 py-8 text-center text-slate-400 text-sm">No deals yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
