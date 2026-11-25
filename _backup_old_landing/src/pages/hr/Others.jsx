import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Award, BookOpen, Megaphone, FileText, ChevronRight, Bell } from 'lucide-react';
import { api } from '../../utils/api';

const tagColor = {
  HR:       'bg-purple-500/10 text-purple-500',
  Policy:   'bg-blue-500/10   text-blue-500',
  Wellness: 'bg-emerald-500/10 text-emerald-500',
  Events:   'bg-amber-500/10  text-amber-600',
};

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];

export default function Others() {
  const [tab,  setTab]  = useState('Announcements');
  const [data, setData] = useState({ announcements: [], trainings: [], awards: [], docs: [] });
  const [loading, setLoading] = useState(true);

  const tabs = ['Announcements', 'Training', 'Awards', 'Documents'];

  useEffect(() => {
    api.get('/api/hr/others')
      .then(res => setData(res.data || { announcements: [], trainings: [], awards: [], docs: [] }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { announcements, trainings, awards, docs } = data;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Others</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Announcements, training, awards & documents.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-all ${
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Announcements */}
            {tab === 'Announcements' && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                    <Megaphone size={32} className="mb-3 opacity-40"/>
                    <p className="text-sm">No announcements yet.</p>
                  </div>
                ) : announcements.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                    className="glass-card p-5 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      a.urgent ? 'bg-rose-500/10' : 'bg-primary/10'
                    }`}>
                      <Bell size={16} className={a.urgent ? 'text-rose-500' : 'text-primary'}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold dark:text-white">{a.title}</p>
                        {a.urgent ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 shrink-0">Urgent</span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor[a.tag] || 'bg-slate-100 text-slate-500'}`}>{a.tag}</span>
                        <span className="text-xs text-slate-400">
                          {new Date(a.created_at).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'})}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-primary transition-colors shrink-0 mt-1"/>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Training */}
            {tab === 'Training' && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {trainings.length === 0 ? (
                  <div className="col-span-2 glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                    <BookOpen size={32} className="mb-3 opacity-40"/>
                    <p className="text-sm">No training programs yet.</p>
                  </div>
                ) : trainings.map((t, i) => {
                  const color = t.color || PALETTE[i % PALETTE.length];
                  return (
                    <motion.div key={t.id}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                      className="glass-card p-6 rounded-2xl hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background:`${color}18`, color }}>
                            <BookOpen size={18}/>
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">{t.title}</p>
                            <p className="text-xs text-slate-400">{t.category} · {t.enrolled} enrolled</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{ color }}>{t.progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width:0 }} animate={{ width:`${t.progress}%` }}
                          transition={{ duration:1, delay:i*0.1 }}
                          className="h-full rounded-full" style={{ background: color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Awards */}
            {tab === 'Awards' && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {awards.length === 0 ? (
                  <div className="col-span-3 glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                    <Award size={32} className="mb-3 opacity-40"/>
                    <p className="text-sm">No awards yet.</p>
                  </div>
                ) : awards.map((a, i) => {
                  const color = a.color || PALETTE[i % PALETTE.length];
                  return (
                    <motion.div key={a.id}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                      className="glass-card p-6 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                        style={{ background:`linear-gradient(135deg,${color},${color}88)`, boxShadow:`0 6px 20px ${color}44` }}>
                        <Award size={24} className="text-white"/>
                      </div>
                      <p className="text-base font-bold dark:text-white">{a.award_title}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color }}>{a.employee_name}</p>
                      <p className="text-xs text-slate-400 mt-1">{a.month}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Documents */}
            {tab === 'Documents' && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-3">
                {docs.length === 0 ? (
                  <div className="glass-card rounded-2xl flex flex-col items-center justify-center py-16 text-slate-400">
                    <FileText size={32} className="mb-3 opacity-40"/>
                    <p className="text-sm">No documents found.</p>
                    <p className="text-xs mt-1 text-slate-300">Upload PDF/Word/Excel files via the File Manager.</p>
                  </div>
                ) : docs.map((d, i) => (
                  <motion.div key={d.id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                    className="glass-card p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText size={18} className="text-primary"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold dark:text-white truncate">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.type?.toUpperCase()} · {d.size}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {d.modified ? new Date(d.modified).toLocaleDateString('en-US',{day:'numeric',month:'short'}) : '—'}
                    </span>
                    <ChevronRight size={14} className="text-slate-400 group-hover:text-primary transition-colors shrink-0"/>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
