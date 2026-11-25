import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

export default function AccountsOverview() {
  const { fmt } = useCurrency();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/accounts/overview')
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const cards = [
    { label:'Total Revenue',    value: fmt(stats?.totalRevenue),   color:'#939BFF', icon: DollarSign,   },
    { label:'Total Expenses',   value: fmt(stats?.totalExpenses),  color:'#ef4444', icon: TrendingDown, },
    { label:'Net Profit',       value: fmt(stats?.netProfit),      color:'#10b981', icon: TrendingUp,   },
    { label:'Outstanding',      value: fmt(stats?.outstanding),    color:'#f59e0b', icon: AlertCircle,  },
    { label:'Paid Invoices',    value: stats?.paidInvoices ?? 0,         color:'#10b981', icon: CheckCircle,  },
    { label:'Overdue Invoices', value: stats?.overdueInvoices ?? 0,      color:'#ef4444', icon: FileText,     },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Accounts Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Financial summary at a glance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((c, i) => (
            <motion.div key={i} whileHover={{ y:-4 }}
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${c.color}18`, color:c.color }}>
                <c.icon size={22}/>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{c.label}</p>
                <p className="text-2xl font-bold dark:text-white mt-0.5">{c.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold dark:text-white mb-4">Profit Margin</h3>
            {stats?.totalRevenue > 0 ? (
              <>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-400">Net / Revenue</span>
                  <span className="font-bold dark:text-white">
                    {Math.round((stats.netProfit / stats.totalRevenue) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width:0 }}
                    animate={{ width:`${Math.max(0, Math.round((stats.netProfit / stats.totalRevenue) * 100))}%` }}
                    transition={{ duration:1.2 }}
                    className="h-full rounded-full bg-linear-to-r from-primary to-violet-400"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">No revenue data yet.</p>
            )}
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold dark:text-white mb-4">Invoice Health</h3>
            <div className="space-y-3">
              {[
                { label:'Paid',    value: stats?.paidInvoices ?? 0,    color:'#10b981' },
                { label:'Overdue', value: stats?.overdueInvoices ?? 0, color:'#ef4444' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background:row.color }}/>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{row.label}</span>
                  </div>
                  <span className="text-sm font-bold dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}