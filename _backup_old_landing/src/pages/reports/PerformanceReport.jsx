import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  Target, Award, MoreVertical,
  CheckCircle, AlertCircle, Download,
} from 'lucide-react';

const DEPT_COLORS = ['#939BFF', '#C4B5F4', '#AEE9FF', '#B6EADA', '#7B99D9', '#f59e0b', '#10b981'];

const kpis = [
  { category: 'Revenue',     name: 'Monthly Revenue Target', current: '$131K', target: '$120K', pct: 109, status: 'Exceeded'  },
  { category: 'Revenue',     name: 'New MRR',                current: '$22K',  target: '$20K',  pct: 110, status: 'Exceeded'  },
  { category: 'Product',     name: 'Feature Velocity',       current: '18',    target: '20',    pct: 90,  status: 'On Track'  },
  { category: 'Product',     name: 'Bug Resolution Rate',    current: '94%',   target: '95%',   pct: 99,  status: 'On Track'  },
  { category: 'Customer',    name: 'NPS Score',              current: '62',    target: '60',    pct: 103, status: 'Exceeded'  },
  { category: 'Customer',    name: 'Churn Rate',             current: '3.2%',  target: '< 3%',  pct: 68,  status: 'Below'     },
  { category: 'Operations',  name: 'Uptime SLA',             current: '99.9%', target: '99.5%', pct: 100, status: 'Exceeded'  },
  { category: 'Operations',  name: 'Support Ticket Avg. Time',current:'4.2h',  target: '< 6h',  pct: 100, status: 'Exceeded'  },
  { category: 'Team',        name: 'Employee Satisfaction',  current: '4.2/5', target: '4.0/5', pct: 105, status: 'Exceeded'  },
  { category: 'Team',        name: 'Retention Rate',         current: '88%',   target: '90%',   pct: 98,  status: 'On Track'  },
];

const statusConfig = {
  Exceeded:  { bg:'bg-emerald-500/10', text:'text-emerald-500', icon: CheckCircle  },
  'On Track':{ bg:'bg-blue-500/10',    text:'text-blue-500',    icon: CheckCircle  },
  Below:     { bg:'bg-rose-500/10',    text:'text-rose-500',    icon: AlertCircle  },
};

const categories = ['All','Revenue','Product','Customer','Operations','Team'];

export default function PerformanceReport() {
  const [catFilter, setCatFilter]   = useState('All');
  const [perfData,  setPerfData]    = useState(null);

  useEffect(() => {
    api.get('/api/reports/performance')
      .then(res => setPerfData(res.data))
      .catch(() => {});
  }, []);

  const filteredKPIs = kpis.filter(k => catFilter === 'All' || k.category === catFilter);
  const exceeded = kpis.filter(k => k.status === 'Exceeded').length;

  const depts = perfData?.departments || [];
  const totalHeadcount = depts.reduce((s, d) => s + d.headcount, 0) || 1;
  const topEmps = perfData?.topEmployees || [];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Performance Report</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">KPI tracking, team scorecards and goal progress — Q1 2026</p>
          </div>
          <button
            onClick={() => {
              const rows = kpis.map(k => k.category+','+k.name+','+k.current+','+k.target+','+k.pct+'%,'+k.status);
              const csv = ['Category,KPI,Current,Target,Progress,Status',...rows].join('\n');
              const a = document.createElement('a');
              a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
              a.download = 'performance-report.csv'; a.click();
            }}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl btn-primary">
            <Download size={15} /> Export PDF
          </button>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label:'Goals Exceeded',     value: exceeded,                              color:'#10b981', icon: CheckCircle },
            { label:'Project Completion', value: perfData?.projectCompletionRate ?? '—', color:'#3b82f6', icon: Target      },
            { label:'Task Completion',    value: perfData?.taskCompletionRate    ?? '—', color:'#939BFF', icon: AlertCircle },
          ].map((c,i) => (
            <motion.div key={i} whileHover={{y:-4}} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{background:`${c.color}18`,color:c.color}}><c.icon size={22}/></div>
              <div>
                <p className="text-3xl font-bold dark:text-white">{c.value}</p>
                <p className="text-sm text-slate-400">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Department headcount scorecard */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold dark:text-white">Department Headcount</h2>
            <button className="text-slate-400"><MoreVertical size={16}/></button>
          </div>
          {depts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No employee data yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {depts.map((d, i) => {
                const color = DEPT_COLORS[i % DEPT_COLORS.length];
                const pct   = Math.round((d.headcount / totalHeadcount) * 100);
                return (
                  <motion.div key={i}
                    initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                    className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <div className="relative w-16 h-16 mb-3">
                      <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none"
                          stroke="currentColor" strokeWidth="3"
                          className="text-slate-100 dark:text-slate-800"/>
                        <motion.circle cx="18" cy="18" r="15.9" fill="none"
                          stroke={color} strokeWidth="3"
                          strokeDasharray="100" strokeLinecap="round"
                          initial={{strokeDashoffset:100}}
                          animate={{strokeDashoffset:100-pct}}
                          transition={{duration:1.2,delay:i*0.1}}/>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold dark:text-white">{d.headcount}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold dark:text-white mb-1">{d.dept}</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                      {pct}% of team
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* KPI tracker */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 justify-between">
            <h2 className="text-base font-bold dark:text-white">KPI Targets <span className="text-xs font-normal text-slate-400">(example)</span></h2>
            <div className="flex gap-2 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    catFilter===c ? 'bg-primary text-white shadow-sm shadow-primary/30'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                  }`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Category','KPI','Current','Target','Progress','Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredKPIs.map((k, i) => {
                  const st = statusConfig[k.status];
                  const StIcon = st.icon;
                  const barColor = k.status==='Exceeded'?'#10b981':k.status==='On Track'?'#3b82f6':'#ef4444';
                  return (
                    <motion.tr key={i}
                      initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">{k.category}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold dark:text-white">{k.name}</td>
                      <td className="px-5 py-3.5 text-sm font-bold dark:text-white">{k.current}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{k.target}</td>
                      <td className="px-5 py-3.5 min-w-35">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{width:0}}
                              animate={{width:`${Math.min(k.pct,100)}%`}}
                              transition={{duration:0.8,delay:i*0.04+0.2}}
                              className="h-full rounded-full" style={{background:barColor}}/>
                          </div>
                          <span className="text-xs font-bold w-8" style={{color:barColor}}>{k.pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                          <StIcon size={11}/>{k.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top employees */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold dark:text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400"/> Top Employees by Seniority
            </h2>
          </div>
          {topEmps.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No employee data yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topEmps.map((p, i) => {
                const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                const color    = DEPT_COLORS[i % DEPT_COLORS.length];
                return (
                  <motion.div key={i}
                    initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                        style={{background:`linear-gradient(135deg,${color},${color}88)`,boxShadow:`0 4px 14px ${color}44`}}>
                        {initials}
                      </div>
                      {i === 0 && (
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                          <span className="text-[8px]">👑</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-slate-400">{p.dept}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">{p.role}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}