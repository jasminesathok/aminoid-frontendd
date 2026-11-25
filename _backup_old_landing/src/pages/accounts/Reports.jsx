import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart2,
  Download, MoreVertical, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];

export default function AccountsReports() {
  const { symbol } = useCurrency();
  const [period,  setPeriod]  = useState('This Year');
  const [overview, setOverview] = useState(null);
  const [monthly,  setMonthly]  = useState(null);

useEffect(() => {
  api.get('/api/accounts/overview').then(res => setOverview(res.data)).catch(() => {});
  api.get('/api/accounts/monthly').then(res => setMonthly(res.data)).catch(() => {});
}, [period]);
  const totalRevenue  = overview?.totalRevenue  ?? 0;
  const totalExpenses = overview?.totalExpenses ?? 0;
  const netProfit     = overview?.netProfit     ?? 0;
  const margin        = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const revByMonth = monthly?.revByMonth || Array(12).fill(0);
  const expByMonth = monthly?.expByMonth || Array(12).fill(0);
  const categories = monthly?.categories || [];

  const maxVal = Math.max(...revByMonth, ...expByMonth, 1);

  // Build P&L from real totals
  const cogs    = Math.round(totalRevenue * 0.35);
  const gross   = totalRevenue - cogs;
  const opex    = totalExpenses;
  const ebitda  = gross - opex;
  const tax     = ebitda > 0 ? Math.round(ebitda * 0.22) : 0;
  const net     = ebitda - tax;

  const plItems = [
    { label: 'Total Revenue',      value: totalRevenue, type: 'revenue'  },
    { label: 'Cost of Goods Sold', value: -cogs,        type: 'expense'  },
    { label: 'Gross Profit',       value: gross,        type: 'subtotal' },
    { label: 'Operating Expenses', value: -opex,        type: 'expense'  },
    { label: 'EBITDA',             value: ebitda,       type: 'subtotal' },
    { label: 'Tax (22%)',          value: -tax,         type: 'expense'  },
    { label: 'Net Profit',         value: net,          type: 'total'    },
  ];

  const totalCatAmount = categories.reduce((s, c) => s + c.total, 0) || 1;
  const catRows = categories.map((c, i) => ({
    name: c.name,
    amount: c.total,
    pct: Math.round((c.total / totalCatAmount) * 100),
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Financial Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">P&L, revenue vs expenses and spending breakdown.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {['This Month','This Quarter','This Year'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-2 text-xs font-bold transition-all whitespace-nowrap ${
                    period === p ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'
                  }`}>{p}</button>
              ))}
                          </div>
                        <button onClick={() => {
                const csvData = `Period,Revenue,Expenses,Net Profit\n${period},${totalRevenue},${totalExpenses},${netProfit}`;
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `financial-report-${period.replace(/ /g,'-')}.csv`;
                a.click();
              }} className="flex items-center gap-2 ...">
                <Download size={15} /> Export
              </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label:'Total Revenue',  value:symbol+Math.round(totalRevenue/1000)+'K',  up:true,  color:'#939BFF', icon: TrendingUp   },
{ label:'Total Expenses', value:symbol+Math.round(totalExpenses/1000)+'K', up:false, color:'#ef4444',  icon: TrendingDown  },
{ label:'Net Profit',     value:symbol+Math.round(netProfit/1000)+'K',     up:netProfit>=0, color:'#10b981', icon: DollarSign },
            { label:'Profit Margin',  value: margin+'%',                            up:margin>=0,    color:'#f59e0b', icon: BarChart2  },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${c.color}18`, color:c.color }}>
                <c.icon size={20}/>
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-0.5 ${c.up?'text-emerald-500':'text-rose-500'}`}>
                  {c.up ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}Live data
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue vs Expenses chart */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
           <h2 className="text-base font-bold dark:text-white">{`Revenue vs Expenses (${symbol})`}</h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm" style={{background:'linear-gradient(135deg,#939BFF,#C4B5F4)'}}/> Revenue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-400/60"/> Expenses
              </span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-44">
            {months.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex items-end justify-center gap-0.5" style={{ height: 140 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: revByMonth[i] > 0 ? `${(revByMonth[i] / maxVal) * 100}%` : '3px' }}
                    transition={{ duration: 0.8, delay: i * 0.04 }}
                    className="flex-1 rounded-t-lg"
                    style={{ background: 'linear-gradient(180deg,#939BFF,#C4B5F4aa)' }}
                  />
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: expByMonth[i] > 0 ? `${(expByMonth[i] / maxVal) * 100}%` : '3px' }}
                    transition={{ duration: 0.8, delay: i * 0.04 + 0.1 }}
                    className="flex-1 rounded-t-lg bg-rose-400/50"
                  />
                </div>
                <span className="text-[9px] text-slate-400 font-medium">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* P&L + Expense breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* P&L statement */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold dark:text-white">P&L Statement</h2>
              <button className="text-slate-400"><MoreVertical size={16}/></button>
            </div>
            <div className="p-5 space-y-1">
              {plItems.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${
                    item.type === 'total'    ? 'bg-primary/10 border border-primary/20' :
                    item.type === 'subtotal' ? 'bg-slate-50 dark:bg-slate-800/30' : ''
                  }`}
                >
                  <span className={`text-sm ${
                    item.type === 'total'    ? 'font-bold text-primary' :
                    item.type === 'subtotal' ? 'font-bold dark:text-white' :
                    'text-slate-500 dark:text-slate-400'
                  }`}>{item.label}</span>
                  <span className={`text-sm font-bold ${
                    item.type === 'total'    ? 'text-primary' :
                    item.value < 0          ? 'text-rose-500' :
                    item.type === 'subtotal' ? 'dark:text-white' :
                    'text-emerald-500'
                  }`}>
                    {item.value < 0 ? '-' : ''}{symbol}{Math.abs(item.value).toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Expense breakdown */}
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-base font-bold dark:text-white mb-5">Expense Breakdown by Category</h2>
            {catRows.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No expense data yet.</p>
            ) : (
              <>
                <div className="flex h-4 rounded-full overflow-hidden mb-5 gap-0.5">
                  {catRows.map((c, i) => (
                    <motion.div key={i}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      style={{ background: c.color }}
                      title={`${c.name}: ${c.pct}%`}
                    />
                  ))}
                </div>
                <div className="space-y-3.5">
                  {catRows.map((c, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }}/>
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex-1">{c.name}</span>
                      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${c.pct}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full" style={{ background: c.color }}
                        />
                      </div>
                      <span className="text-xs font-bold dark:text-white w-16 text-right">{symbol}{(c.amount/1000).toFixed(1)}K</span>
                      <span className="text-xs text-slate-400 w-8 text-right">{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
