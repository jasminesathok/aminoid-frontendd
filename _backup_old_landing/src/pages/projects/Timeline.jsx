import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Circle, Flag, FolderKanban } from 'lucide-react';
import { api } from '../../utils/api';

const PALETTE = ['#939BFF','#f59e0b','#10b981','#ef4444','#C4B5F4','#7B99D9','#AEE9FF','#B6EADA'];

const totalDays = 70;
const weeks = Array.from({ length: 10 }, (_, i) => {
  const d = new Date(2026, 2, 1 + i * 7);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
});
const todayDay = (() => {
  const now = new Date();
  const mar1 = new Date(2026, 2, 1);
  const diff = Math.floor((now - mar1) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diff + 1, totalDays));
})();

export default function Timeline() {
  const [zoom,     setZoom]     = useState(1);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const cellW = 64 * zoom;
  const dayW  = cellW / 7;

  useEffect(() => {
    api.get('/api/projects/timeline/all')
      .then(res => {
        const data = (res.data || []).map((p, i) => ({
          ...p,
          color: p.color || PALETTE[i % PALETTE.length],
          phases:     p.phases     || [],
          milestones: p.milestones || [],
        }));
        setProjects(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Timeline</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Project Gantt chart — Live from database</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span>Zoom</span>
              {[0.75, 1, 1.5].map(z => (
                <button key={z} onClick={() => setZoom(z)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-bold ${
                    zoom===z ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 hover:text-primary'
                  }`}>{z===0.75?'−':z===1?'1×':'+'}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
          {[
            { color:'rgba(147,155,255,0.6)',  label:'Completed phase' },
            { color:'rgba(147,155,255,0.25)', label:'Upcoming phase'  },
            { color:'#939BFF',                label:'Milestone', circle:true },
          ].map((l,i) => (
            <div key={i} className="flex items-center gap-2">
              {l.circle
                ? <div className="w-3 h-3 rounded-full" style={{background:l.color}}/>
                : <div className="w-8 h-3 rounded-full" style={{background:l.color}}/>
              }
              {l.label}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-4 bg-rose-500"/>
            <span>Today</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-20 text-slate-400">
            <FolderKanban size={36} className="mb-3 opacity-40"/>
            <p className="text-sm">No projects with timeline data yet.</p>
            <p className="text-xs mt-1 text-slate-300">Add phases & milestones to projects to see them here.</p>
          </div>
        ) : (
          <>
            {/* Gantt chart */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <div style={{ minWidth: 280 + totalDays * dayW }}>

                  {/* Week headers */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30">
                    <div className="w-64 shrink-0 px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-100 dark:border-slate-800">
                      Project
                    </div>
                    <div className="flex relative">
                      {weeks.map((w,i) => (
                        <div key={i} style={{ width: cellW }}
                          className="text-center py-3 text-xs font-semibold text-slate-400 border-r border-slate-100 dark:border-slate-800 shrink-0">
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project rows */}
                  {projects.map((proj, pi) => (
                    <div key={proj.id}
                      className="flex border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group">

                      <div className="w-64 shrink-0 px-5 py-4 flex items-center gap-3 border-r border-slate-100 dark:border-slate-800">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: proj.color }}/>
                        <div className="min-w-0">
                          <p className="text-sm font-bold dark:text-white truncate">{proj.name}</p>
                          <p className="text-[10px] text-slate-400">{proj.status || 'Planning'}</p>
                        </div>
                      </div>

                      <div className="relative flex-1" style={{ height: 64, width: totalDays * dayW }}>
                        {weeks.map((_,wi) => (
                          <div key={wi} className="absolute top-0 bottom-0 border-r border-slate-100 dark:border-slate-800/50"
                            style={{ left: wi * cellW }}/>
                        ))}

                        {/* Today line */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-rose-500/70 z-10"
                          style={{ left: (todayDay - 1) * dayW }}>
                          <div className="w-2 h-2 rounded-full bg-rose-500 -translate-x-[3px] mt-1"/>
                        </div>

                        {/* Phase bars */}
                        {proj.phases.map((ph, phi) => (
                          <motion.div
                            key={phi}
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: pi * 0.1 + phi * 0.1 }}
                            className="absolute flex items-center px-2.5 rounded-lg text-white text-[10px] font-bold cursor-pointer"
                            style={{
                              left:   (ph.start - 1) * dayW,
                              width:  ph.dur * dayW - 2,
                              height: 22,
                              top:    ph.done ? 12 : 30,
                              background: ph.done
                                ? `linear-gradient(90deg,${proj.color},${proj.color}bb)`
                                : `linear-gradient(90deg,${proj.color}44,${proj.color}22)`,
                              border: `1px solid ${proj.color}${ph.done ? 'cc' : '55'}`,
                              transformOrigin: 'left center',
                            }}
                            title={`${ph.name} — ${ph.dur} days`}
                          >
                            <span className="truncate" style={{ color: ph.done ? 'white' : proj.color }}>
                              {ph.name}
                            </span>
                          </motion.div>
                        ))}

                        {/* Milestones */}
                        {proj.milestones.map((ms, mi) => (
                          <div key={mi} className="absolute flex flex-col items-center z-20 group/ms"
                            style={{ left: (ms.day - 1) * dayW - 6, top: 0 }}>
                            <div className="w-3 h-3 rounded-full border-2 border-white dark:border-[#070b14] mt-1"
                              style={{ background: proj.color, boxShadow:`0 0 6px ${proj.color}88` }}/>
                            <div className="absolute top-5 opacity-0 group-hover/ms:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-30 pointer-events-none"
                              style={{ left: '50%', transform: 'translateX(-50%)' }}>
                              {ms.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-5">
                {projects.map(p => (
                  <div key={p.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{background:p.color}}/>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming milestones */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-base font-bold dark:text-white mb-5 flex items-center gap-2">
                <Flag size={16} className="text-primary"/> Upcoming Milestones
              </h2>
              {projects.flatMap(p => p.milestones.map(ms => ({...ms, project: p.name, color: p.color}))).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No milestones defined yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.flatMap(p => p.milestones.map(ms => ({...ms, project: p.name, color: p.color})))
                    .sort((a,b) => a.day - b.day)
                    .map((ms,i) => {
                      const daysAway = ms.day - todayDay;
                      const date = new Date(2026, 2, ms.day);
                      const dateStr = date.toLocaleDateString('en',{month:'short',day:'numeric'});
                      return (
                        <motion.div key={i}
                          initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                          className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{background:`${ms.color}18`,color:ms.color}}>
                            <Flag size={15}/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold dark:text-white truncate">{ms.label}</p>
                            <p className="text-xs text-slate-400 truncate">{ms.project}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold dark:text-white">{dateStr}</p>
                            <p className={`text-[10px] font-semibold ${daysAway < 0 ? 'text-rose-500' : daysAway < 7 ? 'text-amber-500' : 'text-slate-400'}`}>
                              {daysAway < 0 ? `${Math.abs(daysAway)}d overdue` : daysAway === 0 ? 'Today!' : `in ${daysAway}d`}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
