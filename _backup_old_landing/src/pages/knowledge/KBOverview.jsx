import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { BookOpenText, FileText, Eye, FolderTree, TrendingUp } from 'lucide-react';
import { api } from '../../utils/api';

export default function KBOverview() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/knowledge/overview').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const kpis = [
    { label: 'Total Articles',     value: data?.total ?? 0,      color: '#939BFF', icon: BookOpenText },
    { label: 'Published',          value: data?.published ?? 0,  color: '#10b981', icon: FileText    },
    { label: 'Drafts',             value: data?.drafts ?? 0,     color: '#f59e0b', icon: FileText    },
    { label: 'Total Views',        value: (data?.totalViews ?? 0).toLocaleString(), color: '#3b82f6', icon: Eye },
    { label: 'Categories',         value: data?.categories ?? 0, color: '#8b5cf6', icon: FolderTree  },
  ];

  const statusStyle = {
    Published: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    Draft:     { bg: 'bg-amber-500/10',   text: 'text-amber-600',   dot: 'bg-amber-500'   },
    Archived:  { bg: 'bg-slate-200/70 dark:bg-slate-700/40', text: 'text-slate-500', dot: 'bg-slate-400' },
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Knowledge Base</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Documentation and help articles for your team.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card p-5 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${k.color}18`, color: k.color }}>
                <k.icon size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{k.label}</p>
                <p className="text-xl font-bold dark:text-white">{k.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Articles by Category */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold dark:text-white mb-5 flex items-center gap-2">
              <FolderTree size={16} className="text-primary" /> Articles by Category
            </h3>
            <div className="space-y-4">
              {(data?.byCategory || []).map((cat, i) => {
                const maxCount = Math.max(...(data?.byCategory || []).map(c => Number(c.count)), 1);
                const pct = Math.round((Number(cat.count) / maxCount) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold dark:text-slate-300">{cat.name}</span>
                      <span className="text-slate-400">{cat.count} article{cat.count !== '1' ? 's' : ''}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full" style={{ background: cat.color || '#939BFF' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Articles */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />
              <h3 className="text-sm font-bold dark:text-white">Recent Articles</h3>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {(data?.recent || []).map((a, i) => {
                const st = statusStyle[a.status] || statusStyle['Draft'];
                return (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold dark:text-white truncate">{a.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.category_name || 'Uncategorised'} · {a.author}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1"><Eye size={11} />{a.views}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${st.bg} ${st.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{a.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
