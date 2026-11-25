import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, FolderKanban, X, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor = (i) => PALETTE[i % PALETTE.length];

const statusStyle = {
  'In Progress': { bg:'bg-emerald-500/10', text:'text-emerald-500', dot:'bg-emerald-500' },
  Planning:      { bg:'bg-blue-500/10',    text:'text-blue-500',    dot:'bg-blue-500'    },
  Review:        { bg:'bg-amber-500/10',   text:'text-amber-600',   dot:'bg-amber-500'   },
  Completed:     { bg:'bg-slate-200/60 dark:bg-slate-700/40', text:'text-slate-500', dot:'bg-slate-400' },
  'On Hold':     { bg:'bg-rose-500/10',    text:'text-rose-500',    dot:'bg-rose-500'    },
};

const priorityStyle = {
  Critical: 'bg-rose-500/10 text-rose-500',
  High:     'bg-rose-500/10 text-rose-500',
  Medium:   'bg-amber-500/10 text-amber-600',
  Low:      'bg-slate-100 dark:bg-slate-800 text-slate-500',
};

const filters = ['All','Planning','In Progress','Review','Completed','On Hold'];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';

export default function Projects() {
  const [projects,  setProjects]  = useState([]);
  const [filter,    setFilter]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [view,      setView]      = useState('grid');
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);

  // Create form state
  const [form, setForm] = useState({ name:'', description:'', status:'Planning', priority:'Medium', due_date:'' });

  // 3-dot dropdown state
  const [menuOpen,  setMenuOpen]  = useState(null); // project id
  const [editing,   setEditing]   = useState(null); // project object
  const [deleting,  setDeleting]  = useState(null); // project id
  const [editForm,  setEditForm]  = useState({});

  useEffect(() => {
    api.get('/api/projects')
      .then(res => setProjects(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  // ─── Create ───────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // ✅ Send dueDate (camelCase) as expected by backend model & controller
      const res = await api.post('/api/projects', {
        name:        form.name,
        description: form.description,
        status:      form.status,
        priority:    form.priority,
        dueDate:     form.due_date, // ✅ fixed: was sending due_date, backend needs dueDate
      });
      setProjects(prev => [...prev, res.data]);
      setShowModal(false);
      setForm({ name:'', description:'', status:'Planning', priority:'Medium', due_date:'' });
    } catch(err) { console.error(err); }
    finally { setSaving(false); }
  };

  // ─── Update ───────────────────────────────────────────────────────────────
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // ✅ Send dueDate (camelCase) as expected by backend model & controller
      await api.put('/api/projects/' + editing.id, {
        name:     editForm.name,
        status:   editForm.status,
        priority: editForm.priority,
        progress: Number(editForm.progress),
        dueDate:  editForm.due_date, // ✅ fixed: backend expects dueDate not due_date
      });
      // Refresh project list to reflect changes
      const res = await api.get('/api/projects');
      setProjects(res.data);
      setEditing(null);
    } catch(err) { console.error(err); }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/projects/' + id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch(err) { console.error(err); }
    finally { setDeleting(null); setMenuOpen(null); }
  };

  const filtered = projects.filter(p =>
    (filter === 'All' || p.status === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Projects</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all your projects.</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16}/> New Project
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  filter === f ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                }`}>{f}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-56 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
            </div>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {['grid','list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-2 text-xs font-bold transition-all capitalize ${
                    view === v ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'
                  }`}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid View ───────────────────────────────────────────────────── */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p, i) => {
              const st = statusStyle[p.status] || statusStyle['Planning'];
              const color = getColor(i);
              return (
                <motion.div key={p.id}
                  initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                  transition={{ delay: i*0.07 }} whileHover={{ y:-4 }}
                  className="glass-card p-6 rounded-2xl flex flex-col gap-4 cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background:`${color}18`, color }}>
                        <FolderKanban size={20}/>
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white leading-tight">{p.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{p.id.slice(0,8)}</p>
                      </div>
                    </div>

                    {/* ✅ 3-dot menu — fully wired up */}
                    <div className="relative">
                      <button
                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}
                        className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      >
                        <MoreVertical size={16}/>
                      </button>
                      {menuOpen === p.id && (
                        <div className="absolute right-0 top-7 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl w-36 py-1">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setEditing(p);
                              setEditForm({
                                name:     p.name,
                                status:   p.status,
                                priority: p.priority || 'Medium',
                                progress: p.progress || 0,
                                due_date: p.due_date?.split('T')[0] || '',
                              });
                              setMenuOpen(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            <Pencil size={13}/> Edit
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                            disabled={deleting === p.id}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-40"
                          >
                            <Trash2 size={13}/> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Progress</span>
                      <span className="font-bold dark:text-white">{p.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width:0 }} animate={{ width:`${p.progress}%` }}
                        transition={{ duration:1, delay:i*0.07+0.3 }}
                        className="h-full rounded-full"
                        style={{ background:`linear-gradient(90deg,${color},${color}88)` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-[10px] text-slate-400">Due</p>
                      {/* ✅ Now shows correctly once backend sends dueDate properly */}
                      <p className="text-xs font-bold dark:text-white">{fmtDate(p.due_date)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                      <p className="text-[10px] text-slate-400">Priority</p>
                      <p className="text-xs font-bold dark:text-white">{p.priority}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityStyle[p.priority]}`}>{p.priority}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{p.status}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── List View ───────────────────────────────────────────────────── */}
        {view === 'list' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['Project','Status','Priority','Progress','Due Date',''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const st = statusStyle[p.status] || statusStyle['Planning'];
                    const color = getColor(i);
                    return (
                      <motion.tr key={p.id}
                        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background:`${color}18`, color }}>
                              <FolderKanban size={14}/>
                            </div>
                            <p className="text-sm font-bold dark:text-white">{p.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${priorityStyle[p.priority]}`}>{p.priority}</span>
                        </td>
                        <td className="px-5 py-3.5 min-w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${p.progress}%`, background:color }}/>
                            </div>
                            <span className="text-xs font-bold dark:text-white w-8">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-400">{fmtDate(p.due_date)}</td>
                        <td className="px-5 py-3.5">
                          {/* ✅ 3-dot menu in list view — fully wired up */}
                          <div className="relative">
                            <button
                              onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}
                              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                            >
                              <MoreVertical size={15}/>
                            </button>
                            {menuOpen === p.id && (
                              <div className="absolute right-0 top-7 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl w-36 py-1">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setEditing(p);
                                    setEditForm({
                                      name:     p.name,
                                      status:   p.status,
                                      priority: p.priority || 'Medium',
                                      progress: p.progress || 0,
                                      due_date: p.due_date?.split('T')[0] || '',
                                    });
                                    setMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                  <Pencil size={13}/> Edit
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                                  disabled={deleting === p.id}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-40"
                                >
                                  <Trash2 size={13}/> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── New Project Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">New Project</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18}/></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Project Name *</label>
                  <input required value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
                    className="input-field w-full text-sm" placeholder="e.g. Website Redesign"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}
                    className="input-field w-full text-sm resize-none" placeholder="Brief description…"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))} className="input-field w-full text-sm">
                      {['Planning','In Progress','Review','Completed','On Hold'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Priority</label>
                    <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))} className="input-field w-full text-sm">
                      {['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(p=>({...p,due_date:e.target.value}))} className="input-field w-full text-sm"/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">{saving?'Creating…':'Create Project'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Project Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Edit Project</h2>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Project Name</label>
                  <input required value={editForm.name || ''} onChange={e => setEditForm({...editForm, name:e.target.value})} className="input-field w-full"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                    <select value={editForm.status || 'Planning'} onChange={e => setEditForm({...editForm, status:e.target.value})} className="input-field w-full">
                      {['Planning','In Progress','Review','On Hold','Completed','Cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Priority</label>
                    <select value={editForm.priority || 'Medium'} onChange={e => setEditForm({...editForm, priority:e.target.value})} className="input-field w-full">
                      {['Critical','High','Medium','Low'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {/* ✅ Progress field — was completely missing before */}
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Progress (%)</label>
                    <input type="number" min="0" max="100"
                      value={editForm.progress ?? 0}
                      onChange={e => setEditForm({...editForm, progress:e.target.value})}
                      className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Due Date</label>
                    {/* ✅ Stored as due_date in state, sent as dueDate to backend */}
                    <input type="date" value={editForm.due_date || ''} onChange={e => setEditForm({...editForm, due_date:e.target.value})} className="input-field w-full"/>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2 text-sm font-bold shadow-lg shadow-primary/20">
                  Update Project
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}