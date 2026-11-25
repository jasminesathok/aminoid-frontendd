import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, HardDrive, Activity } from 'lucide-react';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

function GaugeCard({ label, used, total, unit, color, icon: Icon }) {
  const num_used  = parseFloat(used)  || 0;
  const num_total = parseFloat(total) || 1;
  const pct = Math.min(100, Math.round((num_used / num_total) * 100));
  const warn = pct >= 80;
  const crit = pct >= 95;
  const barColor = crit ? '#ef4444' : warn ? '#f59e0b' : color;

  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800"/>
          <motion.circle cx="60" cy="60" r={radius} fill="none" stroke={barColor} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: offset }} transition={{ duration: 1.2 }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon size={20} style={{ color }} />
          <span className={`text-xl font-bold mt-1 ${crit?'text-rose-500':warn?'text-amber-500':'dark:text-white'}`}>{pct}%</span>
        </div>
      </div>
      <h3 className="text-sm font-bold dark:text-white">{label}</h3>
      <p className="text-xs text-slate-400 mt-1">{used} {unit} used of {total} {unit}</p>
      {warn && !crit && <p className="text-[10px] font-bold text-amber-500 mt-2">Approaching limit</p>}
      {crit && <p className="text-[10px] font-bold text-rose-500 mt-2">⚠ Critical — upgrade soon</p>}
    </div>
  );
}

export default function Usage() {
  const [usage,   setUsage]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/subscriptions/usage').then(r => setUsage(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Usage</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor your plan resource consumption.</p>
          </div>
          <button onClick={() => navigate('/subscriptions/plans')} className="btn-primary text-sm">Upgrade Plan</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <GaugeCard label="Team Seats" used={usage?.seats_used} total={usage?.seats_total} unit="seats" color="#939BFF" icon={Users}/>
          <GaugeCard label="Storage" used={Number(usage?.storage_used_gb).toFixed(1)} total={Number(usage?.storage_total_gb).toFixed(1)} unit="GB" color="#10b981" icon={HardDrive}/>
          <GaugeCard label="API Calls" used={usage?.api_calls_used?.toLocaleString()} total={usage?.api_calls_total?.toLocaleString()} unit="" color="#f59e0b" icon={Activity}/>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <h3 className="text-sm font-bold dark:text-white mb-4">Usage Details</h3>
          <div className="space-y-3">
            {[
              { label:'Seats Used',      value:`${usage?.seats_used} / ${usage?.seats_total}`,                    pct: Math.round((usage?.seats_used/usage?.seats_total)*100), color:'#939BFF' },
              { label:'Storage Used',    value:`${Number(usage?.storage_used_gb).toFixed(1)} / ${Number(usage?.storage_total_gb).toFixed(1)} GB`, pct: Math.round((usage?.storage_used_gb/usage?.storage_total_gb)*100), color:'#10b981' },
              { label:'API Calls',       value:`${Number(usage?.api_calls_used).toLocaleString()} / ${Number(usage?.api_calls_total).toLocaleString()}`, pct: Math.round((usage?.api_calls_used/usage?.api_calls_total)*100), color:'#f59e0b' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-slate-500 dark:text-slate-400 w-32 shrink-0">{row.label}</span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width:0 }} animate={{ width:`${row.pct||0}%` }} transition={{ duration:1, delay:i*0.1 }}
                    className="h-full rounded-full" style={{ background: row.color }}/>
                </div>
                <span className="text-xs text-slate-400 w-28 text-right">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
