import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { DollarSign, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation'];

const stageConfig = {
  Prospecting:   { color: '#939BFF', light: '#939BFF18' },
  Qualification: { color: '#f59e0b', light: '#f59e0b18' },
  Proposal:      { color: '#3b82f6', light: '#3b82f618' },
  Negotiation:   { color: '#8b5cf6', light: '#8b5cf618' },
};

export default function Pipeline() {
  const [deals,   setDeals]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/sales/deals').then(r => setDeals(r.data)).finally(() => setLoading(false));
  }, []);

  const moveStage = async (deal, direction) => {
    const idx = STAGES.indexOf(deal.stage);
    const next = STAGES[idx + direction];
    if (!next) return;
    await api.put(`/api/sales/deals/${deal.id}`, { stage: next });
    setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: next } : d));
  };

  const columns = STAGES.map(stage => ({
    stage,
    deals: deals.filter(d => d.stage === stage),
    total: deals.filter(d => d.stage === stage).reduce((s, d) => s + Number(d.value), 0),
  }));

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Drag deals across stages to update their status.</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(({ stage, deals: colDeals, total }) => {
            const cfg = stageConfig[stage];
            return (
              <div key={stage} className="flex-shrink-0 w-72">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                    <span className="text-sm font-bold dark:text-white">{stage}</span>
                    <span className="text-xs text-slate-400 font-medium">({colDeals.length})</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: cfg.color }}>
                    ${total.toLocaleString()}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[200px]">
                  {colDeals.map((deal, i) => (
                    <motion.div key={deal.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="glass-card p-4 rounded-xl border-l-4 group hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: cfg.color }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-bold dark:text-white leading-snug">{deal.name}</p>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.light, color: cfg.color }}>
                          <DollarSign size={13} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">{deal.account_name || '—'}</p>
                      <p className="text-sm font-bold mb-3" style={{ color: cfg.color }}>
                        ${Number(deal.value).toLocaleString()}
                      </p>

                      {/* Probability */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Win probability</span><span>{deal.probability}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${deal.probability}%`, background: cfg.color }} />
                        </div>
                      </div>

                      {/* Move buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {STAGES.indexOf(deal.stage) > 0 && (
                          <button onClick={() => moveStage(deal, -1)}
                            className="flex-1 text-[10px] font-bold py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1">
                            <ChevronRight size={10} className="rotate-180" />Prev
                          </button>
                        )}
                        {STAGES.indexOf(deal.stage) < STAGES.length - 1 && (
                          <button onClick={() => moveStage(deal, 1)}
                            className="flex-1 text-[10px] font-bold py-1 rounded-lg text-white flex items-center justify-center gap-1 transition-colors"
                            style={{ background: cfg.color }}>
                            Next<ChevronRight size={10} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {colDeals.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl h-24 flex items-center justify-center">
                      <p className="text-xs text-slate-400">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
