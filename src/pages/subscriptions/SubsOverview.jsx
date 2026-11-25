import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { CreditCard, Star, Calendar, Zap, ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const planColors = { Starter:'#10b981', Pro:'#939BFF', Enterprise:'#f59e0b' };
const statusStyle = {
  Active:    { bg:'bg-emerald-500/10', text:'text-emerald-600', dot:'bg-emerald-500' },
  Trialing:  { bg:'bg-blue-500/10',   text:'text-blue-500',    dot:'bg-blue-500'    },
  Cancelled: { bg:'bg-rose-500/10',   text:'text-rose-500',    dot:'bg-rose-500'    },
  'Past Due':{ bg:'bg-amber-500/10',  text:'text-amber-600',   dot:'bg-amber-500'   },
};

function UsageBar({ label, used, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const warn = pct >= 80;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-semibold dark:text-slate-300">{label}</span>
        <span className={warn ? 'text-amber-500 font-bold' : 'text-slate-400'}>{used} / {total} ({pct}%)</span>
      </div>
      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1 }}
          className="h-full rounded-full" style={{ background: warn ? '#f59e0b' : color }} />
      </div>
    </div>
  );
}

export default function SubsOverview() {
  const [sub,     setSub]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/subscriptions').then(r => setSub(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div></DashboardLayout>;

  if (!sub) return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto text-center py-20">
        <Star size={48} className="mx-auto mb-4 text-primary opacity-50" />
        <h2 className="text-xl font-bold dark:text-white mb-2">No Active Subscription</h2>
        <p className="text-slate-500 mb-6">Get started with a plan that fits your team.</p>
        <button onClick={() => navigate('/subscriptions/plans')} className="btn-primary">View Plans</button>
      </div>
    </DashboardLayout>
  );

  const planColor = planColors[sub.plan] || '#939BFF';
  const st = statusStyle[sub.status] || statusStyle['Active'];
  const daysLeft = Math.max(0, Math.round((new Date(sub.renewal_date) - new Date()) / (1000*60*60*24)));

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Subscription</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your plan, billing and usage.</p>
        </div>

        {/* Plan Banner */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
          className="glass-card p-6 rounded-2xl border-l-4" style={{ borderLeftColor:planColor }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:`${planColor}18`, color:planColor }}>
                <Star size={26} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold dark:text-white">{sub.plan} Plan</h2>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{sub.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">${sub.amount}/{sub.billing_cycle === 'Annual' ? 'yr' : 'mo'} · {sub.billing_cycle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">Renews in</p>
                <p className={`text-lg font-bold ${daysLeft <= 7 ? 'text-amber-500' : 'dark:text-white'}`}>{daysLeft} days</p>
              </div>
              <button onClick={() => navigate('/subscriptions/plans')}
                className="btn-primary flex items-center gap-2 text-sm">
                <ArrowUpRight size={15}/>Upgrade
              </button>
            </div>
          </div>
        </motion.div>

        {/* Renewal + Quick Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label:'Next Bill',   value: sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : '—', icon:Calendar, color:'#939BFF' },
            { label:'Amount',      value: `$${sub.amount}`,  icon:CreditCard, color:'#10b981' },
            { label:'Billing',     value: sub.billing_cycle, icon:Zap,        color:'#f59e0b' },
          ].map((k,i) => (
            <motion.div key={i} whileHover={{ y:-3 }} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
              className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${k.color}18`, color:k.color }}>
                <k.icon size={18}/>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{k.label}</p>
                <p className="text-lg font-bold dark:text-white">{k.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage Gauges */}
        <div className="glass-card p-6 rounded-2xl space-y-5">
          <h3 className="text-sm font-bold dark:text-white">Usage</h3>
          <UsageBar label="Seats" used={sub.seats_used} total={sub.seats_total} color={planColor}/>
          <UsageBar label={`Storage (GB)`} used={Number(sub.storage_used_gb).toFixed(1)} total={Number(sub.storage_total_gb).toFixed(1)} color={planColor}/>
          <UsageBar label="API Calls" used={sub.api_calls_used.toLocaleString()} total={sub.api_calls_total.toLocaleString()} color={planColor}/>
        </div>
      </div>
    </DashboardLayout>
  );
}
