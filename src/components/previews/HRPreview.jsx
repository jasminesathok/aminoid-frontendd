import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, MoreVertical } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay, duration: 0.5 }}
    className="bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col gap-3"
  >
    <div className="flex items-start">
      <div className="p-2.5 rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{title}</p>
      <h3 className="text-xl font-bold dark:text-white mt-1">{value}</h3>
    </div>
  </motion.div>
);

export default function HRPreview() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold dark:text-white">HR Dashboard</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Overview of your human resources.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Total Employees" value="142" icon={Users} color="#4F46E5" delay={0.1} />
        <StatCard title="Present Today" value="130" icon={UserCheck} color="#10B981" delay={0.2} />
        <StatCard title="On Leave" value="12" icon={UserX} color="#F59E0B" delay={0.3} />
        <StatCard title="Pending Leaves" value="4" icon={Clock} color="#6D5BD0" delay={0.4} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex-1 bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold dark:text-white">Headcount by Department</h3>
          <MoreVertical size={16} className="text-slate-400" />
        </div>
        <div className="flex-1 space-y-3">
          {[
            { dept: 'Engineering', count: 45, color: '#4F46E5' },
            { dept: 'Marketing', count: 28, color: '#10B981' },
            { dept: 'Sales', count: 35, color: '#3B82F6' },
            { dept: 'HR & Ops', count: 12, color: '#6D5BD0' },
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-20 shrink-0">{d.dept}</span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.count / 50) * 100}%` }}
                  transition={{ delay: 0.6 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
