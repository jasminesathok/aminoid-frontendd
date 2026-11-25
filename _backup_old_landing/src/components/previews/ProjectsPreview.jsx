import React from 'react';
import { motion } from 'framer-motion';
import { Folder, CheckCircle, Clock, Users, MoreHorizontal } from 'lucide-react';

const ProjectCard = ({ title, progress, members, status, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    transition={{ delay, duration: 0.5 }}
    className="bg-white/90 dark:bg-[#121A2E]/90 backdrop-blur-md p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ background: `${color}18`, color }}>
          <Folder size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
      </div>
      <MoreHorizontal size={16} className="text-slate-400" />
    </div>
    <div className="mb-2 flex justify-between items-end">
      <div className="flex -space-x-2">
        {[...Array(members)].map((_, i) => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#121A2E] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[9px] font-bold">
            U{i+1}
          </div>
        ))}
      </div>
      <span className="text-xs font-bold" style={{ color }}>{progress}%</span>
    </div>
    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }} 
        animate={{ width: `${progress}%` }} 
        transition={{ delay: delay + 0.3, duration: 0.8 }}
        className="h-full rounded-full" 
        style={{ backgroundColor: color }} 
      />
    </div>
  </motion.div>
);

export default function ProjectsPreview() {
  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-hidden rounded-[26px]">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold dark:text-white">Projects</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage tasks and track team progress.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/90 dark:bg-[#121A2E]/90 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-2">
          <Folder size={20} className="text-[#10B981]" />
          <h3 className="text-xl font-bold dark:text-white">12</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Active</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/90 dark:bg-[#121A2E]/90 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-2">
          <CheckCircle size={20} className="text-[#4F46E5]" />
          <h3 className="text-xl font-bold dark:text-white">45</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Completed</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/90 dark:bg-[#121A2E]/90 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-2">
          <Clock size={20} className="text-[#F59E0B]" />
          <h3 className="text-xl font-bold dark:text-white">3</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Delayed</p>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <h3 className="text-sm font-bold dark:text-white mb-1">Recent Projects</h3>
        <ProjectCard title="Website Redesign" progress={75} members={4} status="In Progress" color="#10B981" delay={0.4} />
        <ProjectCard title="Mobile App Launch" progress={30} members={3} status="Planning" color="#4F46E5" delay={0.5} />
      </div>
    </div>
  );
}
