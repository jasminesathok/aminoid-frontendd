import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, TrendingUp, Users,
  Download, ArrowUpRight, MoreVertical,
} from 'lucide-react';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS  = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9'];

export default function SalesReport() {
  const [period,    setPeriod]    = useState('This Year');
  const [salesData, setSalesData] = useState(null);
  const [loading,   setLoading]   = useState(true);

  const fetchData = (p) => {
    setLoading(true);
    const params = p === 'This Month' ? '?period=month' : p === 'This Quarter' ? '?period=quarter' : '?period=year';
    api.get('/api/reports/sales' + params)
      .then(res => setSalesData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(period); }, []);

  const handlePeriodChange = (p) => { setPeriod(p); fetchData(p); };

  const byMonth    = salesData?.byMonth    || [];
  const topClients = salesData?.topClients || [];
  const totalRevenue = salesData?.totalSales ?? 0;

  // Build 12-month array from API data (0 for months with no data)
  const revenueByMonth = Array.from({ length: 12 }, (_, i) => {
    const entry = byMonth.find(r => months.indexOf(r.month) === i);
    return entry ? entry.amount / 1000 : 0; // convert to $K
  });
  const maxRev = Math.max(...revenueByMonth, 1);
  const peakIdx = revenueByMonth.indexOf(Math.max(...revenueByMonth));

  const maxClientRevenue = topClients.length ? topClients[0].total : 1;

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Sales Report</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Revenue, orders and client performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {['This Month','This Quarter','This Year'].map(p => (
                <button key={p} onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    period === p ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'
                  }`}>{p}</button>
              ))}
            </div>
            <button
              onClick={() => {
                const csv = ['Month,Revenue', ...byMonth.map(r => r.month + ',$' + Number(r.amount).toLocaleString())].join('\n');
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
                a.download = 'sales-report.csv'; a.click();
              }}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Download size={15} /> Export
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Total Revenue',  value: '$' + (totalRevenue/1000).toFixed(1) + 'K', icon: DollarSign, color: '#939BFF' },
            { title: 'Top Clients',    value: topClients.length + ' clients',              icon: Users,      color: '#C4B5F4' },
            { title: 'Peak Month',     value: revenueByMonth[peakIdx] > 0 ? months[peakIdx] + ' $' + revenueByMonth[peakIdx].toFixed(0) + 'K' : '—', icon: TrendingUp, color: '#10b981' },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-xl" style={{ background: `${c.color}18`, color: c.color }}>
                  <c.icon size={22} />
                </div>
                <button className="text-slate-400"><MoreVertical size={16} /></button>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{c.title}</p>
                <h3 className="text-2xl font-bold dark:text-white mt-1">{c.value}</h3>
              </div>
              <span className="flex items-center text-xs font-bold w-fit text-emerald-500">
                <ArrowUpRight size={13} />Live data
              </span>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart + top clients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Monthly revenue bar chart */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold dark:text-white">Monthly Revenue ($K)</h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg,#939BFF,#C4B5F4)' }} />
                  Paid Invoices
                </span>
                {peakIdx >= 0 && revenueByMonth[peakIdx] > 0 && (
                  <span className="text-slate-400">Peak: ${revenueByMonth[peakIdx].toFixed(0)}K ({months[peakIdx]})</span>
                )}
              </div>
            </div>
            <div className="flex items-end gap-2 h-48">
              {revenueByMonth.map((v, i) => {
                const isMax = i === peakIdx && v > 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="w-full flex items-end justify-center" style={{ height: 160 }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: v > 0 ? `${(v / maxRev) * 100}%` : '4px' }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                        className="w-full rounded-t-lg relative overflow-hidden cursor-pointer"
                        style={{
                          background: isMax
                            ? 'linear-gradient(180deg,#939BFF,#C4B5F4)'
                            : v > 0
                              ? 'linear-gradient(180deg,rgba(147,155,255,0.6),rgba(196,181,244,0.35))'
                              : 'rgba(148,163,184,0.15)',
                          border: isMax ? '1px solid rgba(147,155,255,0.5)' : 'none',
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </motion.div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{months[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top clients */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold dark:text-white">Top Clients</h2>
              <button className="text-slate-400"><MoreVertical size={16} /></button>
            </div>
            {topClients.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No paid invoices yet.</p>
            ) : (
              <div className="space-y-3.5">
                {topClients.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold dark:text-white truncate max-w-36">{c.client}</span>
                      <span className="text-xs font-bold dark:text-white shrink-0">${(c.total/1000).toFixed(1)}K</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.total / maxClientRevenue) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full rounded-full" style={{ background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly data table */}
        {byMonth.length > 0 && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold dark:text-white">Revenue by Month</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['Month','Revenue'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {byMonth.map((r, i) => (
                    <motion.tr key={i}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold dark:text-white">{r.month}</td>
                      <td className="px-5 py-3.5 text-sm font-bold text-emerald-500">${Number(r.amount).toLocaleString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}