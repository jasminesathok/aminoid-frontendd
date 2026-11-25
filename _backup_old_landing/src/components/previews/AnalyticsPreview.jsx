import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, PieChart, Activity, Users } from 'lucide-react';

const ChartBar = ({ height, delay, color }) => (
  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm flex items-end">
    <motion.div 
      initial={{ height: 0 }} 
      animate={{ height: `${height}%` }} 
      transition={{ delay, duration: 1, ease: "easeOut" }}
      className="w-full rounded-t-sm opacity-80"
      style={{ backgroundColor: color }}
    />
  </div>
);

export default function AnalyticsPreview() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold dark:text-white">Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time performance metrics.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/90 dark:bg-[#121A2E]/90 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Users size={20}/></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Traffic</p>
            <h3 className="text-lg font-bold dark:text-white">24.5K</h3>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/90 dark:bg-[#121A2E]/90 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><Activity size={20}/></div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Conversion</p>
            <h3 className="text-lg font-bold dark:text-white">3.2%</h3>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex-1 bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-5 shadow-sm flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold dark:text-white">Revenue Growth</h3>
          <div className="flex gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          </div>
        </div>
        
        {/* Mock Chart */}
        <div className="flex-1 flex items-end gap-2 pt-4">
          {[40, 60, 45, 80, 55, 90, 70, 100].map((h, i) => (
            <ChartBar key={i} height={h} delay={0.4 + (i * 0.05)} color={i % 2 === 0 ? '#4F46E5' : '#10B981'} />
          ))}
        </div>
        <div className="flex justify-between mt-3 text-[10px] text-slate-400 font-medium">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
        </div>
      </motion.div>
    </div>
  );
}
