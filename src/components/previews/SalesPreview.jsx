import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Briefcase, ChevronRight } from 'lucide-react';

const MetricCard = ({ title, value, trend, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay, duration: 0.5 }}
    className="bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">{trend}</span>
    </div>
    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{title}</p>
    <h3 className="text-xl font-bold dark:text-white mt-1">{value}</h3>
  </motion.div>
);

export default function SalesPreview() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold dark:text-white">Sales Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track revenue and pipeline performance.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricCard title="Total Revenue" value="$124,500" trend="+14.2%" icon={DollarSign} color="#6D5BD0" delay={0.1} />
        <MetricCard title="New Deals" value="48" trend="+8.4%" icon={Briefcase} color="#10B981" delay={0.2} />
        <MetricCard title="Win Rate" value="64%" trend="+2.1%" icon={Target} color="#4F46E5" delay={0.3} />
        <MetricCard title="Active Leads" value="156" trend="+12%" icon={TrendingUp} color="#3B82F6" delay={0.4} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex-1 bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold dark:text-white">Recent Proposals</h3>
          <button className="text-xs font-semibold text-[#6D5BD0] flex items-center">View All <ChevronRight size={14}/></button>
        </div>
        <div className="flex-1 space-y-3 overflow-hidden">
          {[
            { client: 'Acme Corp', amount: '$12,400', status: 'Sent', color: '#3B82F6' },
            { client: 'Globex Inc', amount: '$8,900', status: 'Accepted', color: '#10B981' },
            { client: 'Initech', amount: '$24,000', status: 'Draft', color: '#8892B0' },
          ].map((deal, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.6 + (i * 0.1) }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs" style={{ color: deal.color }}>
                  {deal.client.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{deal.client}</p>
                  <p className="text-xs text-slate-500">{deal.amount}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ background: `${deal.color}15`, color: deal.color }}>
                {deal.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
