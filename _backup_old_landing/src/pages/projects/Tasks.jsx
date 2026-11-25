import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Clock, CheckSquare, Circle, CheckCircle2, AlertTriangle, X, Pencil, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const priorityStyle = {
  Critical: { bg:'bg-rose-500/10',  text:'text-rose-500',  dot:'bg-rose-500'  },
  High:     { bg:'bg-rose-500/10',  text:'text-rose-500',  dot:'bg-rose-500'  },
  Medium:   { bg:'bg-amber-500/10', text:'text-amber-600', dot:'bg-amber-500' },
  Low:      { bg:'bg-blue-500/10',  text:'text-blue-500',  dot:'bg-blue-400'  },
};

const columns = [
  { id:'Todo',        label:'To Do',       color:'#94a3b8', icon: Circle        },
  { id:'In Progress', label:'In Progress', color:'#939BFF', icon: Clock         },
  { id:'Review',      label:'In Review',   color:'#f59e0b', icon: AlertTriangle  },
  { id:'Done',        label:'Done',        color:'#10b981', icon: CheckCircle2  },
];

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—';

// ─── Task Card ────────────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete }) => {
  const pr = priorityStyle[task.priority] || priorityStyle['Medium'];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div whileHover={{ y:-2 }} className="glass-card p-4 rounded-xl cursor-grab group relative" layout>
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pr.bg} ${pr.text}`}>{task.priority}</span>
        {/* ✅ 3-dot menu wired up */}
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <MoreVertical size={13}/>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-6 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl w-32 py-1">
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(task); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <Pencil size={12}/> Edit
              </button>
              <button
                onClick={e => { e.stopPropagation(); setMenuOpen(false); onDelete(task.id); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                <Trash2 size={12}/> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm font-semibold dark:text-white leading-snug mb-3">{task.title}</p>
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-400">{task.status}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Clock size={10}/><span className="text-[10px]">{fmtDate(task.due_date)}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks,     setTasks]     = useState([]);
  const [view,      setView]      = useState('kanban');
  const [search,    setSearch]    = useState('');
  const [prioF,     setPrioF]     = useState('All');
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving,    setSaving]    = useState(false);

  // ✅ Status field removed from create form — backend always sets 'Todo' on INSERT
  const [form, setForm] = useState({ title:'', priority:'Medium', due_date:'' });

  // Edit modal state
  const [editing,  setEditing]  = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    api.get('/api/projects/tasks/list')
      .then(res => setTasks(res.data))
      .finally(() => setLoading(false));
  }, []);

  // ─── Create ─────────────────────────────────────────────────────────────────
  // ✅ No status sent — backend hardcodes status='Todo' in INSERT query
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/projects/tasks/create', {
        title:    form.title,
        priority: form.priority,
        dueDate:  form.due_date, // ✅ camelCase as expected by backend
      });
      setTasks(prev => [...prev, res.data]);
      setShowModal(false);
      setForm({ title:'', priority:'Medium', due_date:'' });
    } catch(err) { console.error(err); }
    finally { setSaving(false); }
  };

  // ─── Update ─────────────────────────────────────────────────────────────────
  // Status CAN be changed on update (backend update accepts status)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/projects/tasks/' + editing.id, {
        title:    editForm.title,
        priority: editForm.priority,
        status:   editForm.status,   // ✅ allowed on update
        dueDate:  editForm.due_date, // ✅ camelCase for backend
      });
      const res = await api.get('/api/projects/tasks/list');
      setTasks(res.data);
      setEditing(null);
    } catch(err) { console.error(err); }
  };

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete('/api/projects/tasks/' + id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch(err) { console.error(err); }
  };

  const openEdit = (task) => {
    setEditing(task);
    setEditForm({
      title:    task.title,
      priority: task.priority || 'Medium',
      status:   task.status   || 'Todo',
      due_date: task.due_date?.split('T')[0] || '',
    });
  };

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (prioF === 'All' || t.priority === prioF)
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
            <h1 className="text-3xl font-bold dark:text-white">Tasks</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{tasks.length} tasks total</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {['kanban','list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 text-xs font-bold transition-all capitalize ${
                    view === v ? 'bg-primary text-white' : 'text-slate-500 hover:text-primary'
                  }`}>{v}</button>
              ))}
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16}/> Add Task
            </button>
          </div>
        </div>

        {/* Sprint summary */}
        <div className="flex flex-wrap gap-3">
          {columns.map(col => {
            const count = tasks.filter(t => t.status === col.id).length;
            return (
              <div key={col.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full" style={{ background:col.color }}/>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{col.label}</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background:`${col.color}18`, color:col.color }}>{count}</span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-1.5 rounded-xl w-48 border border-white/5">
              <Search size={13} className="text-slate-400 shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                className="bg-transparent border-none outline-none text-xs w-full dark:text-white"/>
            </div>
            <div className="flex gap-1">
              {['All','Critical','High','Medium','Low'].map(p => (
                <button key={p} onClick={() => setPrioF(p)}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                    prioF === p ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                  }`}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Kanban ──────────────────────────────────────────────────────────── */}
        {view === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
            {columns.map(col => {
              const colTasks = filtered.filter(t => t.status === col.id);
              const ColIcon  = col.icon;
              return (
                <div key={col.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <ColIcon size={15} style={{ color:col.color }}/>
                      <span className="text-sm font-bold dark:text-white">{col.label}</span>
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background:col.color }}>{colTasks.length}</span>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
                      <Plus size={14}/>
                    </button>
                  </div>
                  <div className="h-0.5 rounded-full" style={{ background:col.color }}/>
                  <div className="space-y-3 min-h-30">
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={handleDelete}/>
                    ))}
                    {colTasks.length === 0 && (
                      <div className="h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <span className="text-xs text-slate-400">No tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── List ────────────────────────────────────────────────────────────── */}
        {view === 'list' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['Task','Priority','Due Date','Status',''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const pr      = priorityStyle[t.priority] || priorityStyle['Medium'];
                    const colInfo = columns.find(c => c.id === t.status);
                    return (
                      <motion.tr key={t.id}
                        initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <CheckSquare size={15} className="text-slate-300 dark:text-slate-600 shrink-0"/>
                            <p className="text-sm font-semibold dark:text-white">{t.title}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pr.bg} ${pr.text}`}>{t.priority}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-400">{fmtDate(t.due_date)}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5"
                            style={{ background:`${colInfo?.color}18`, color:colInfo?.color }}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {/* ✅ 3-dot menu in list view */}
                          <div className="relative group/row">
                            <button
                              onClick={e => { e.stopPropagation(); openEdit(t); }}
                              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg mr-1"
                            >
                              <Pencil size={13}/>
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleDelete(t.id); }}
                              className="text-slate-400 hover:text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                            >
                              <Trash2 size={13}/>
                            </button>
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

      {/* ── Add Task Modal ─────────────────────────────────────────────────────
           ✅ Status field REMOVED — backend always inserts as 'Todo'
           ✅ Only Title, Priority, Due Date shown
      ───────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md"
              onClick={e => e.stopPropagation()}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold dark:text-white">Add Task</h2>
                  {/* ✅ Clear note so users know new tasks always go to To Do */}
                  <p className="text-xs text-slate-400 mt-0.5">New tasks are added to <span className="font-bold text-slate-500">To Do</span></p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18}/></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Task Title *</label>
                  <input required value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))}
                    className="input-field w-full text-sm" placeholder="e.g. Design homepage mockup"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Priority</label>
                  <select value={form.priority} onChange={e => setForm(p=>({...p,priority:e.target.value}))} className="input-field w-full text-sm">
                    {['Critical','High','Medium','Low'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(p=>({...p,due_date:e.target.value}))} className="input-field w-full text-sm"/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">{saving?'Adding…':'Add Task'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Task Modal ────────────────────────────────────────────────────
           ✅ Status CAN be changed on edit (backend update supports it)
      ───────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}>
            <motion.div initial={{scale:0.95}} animate={{scale:1}} exit={{scale:0.95}}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Edit Task</h2>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Task Title</label>
                  <input required value={editForm.title || ''} onChange={e => setEditForm({...editForm, title:e.target.value})} className="input-field w-full"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Priority</label>
                    <select value={editForm.priority || 'Medium'} onChange={e => setEditForm({...editForm, priority:e.target.value})} className="input-field w-full">
                      {['Critical','High','Medium','Low'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    {/* ✅ Status only available on Edit, not on Create */}
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                    <select value={editForm.status || 'Todo'} onChange={e => setEditForm({...editForm, status:e.target.value})} className="input-field w-full">
                      {['Todo','In Progress','Review','Done'].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Due Date</label>
                  <input type="date" value={editForm.due_date || ''} onChange={e => setEditForm({...editForm, due_date:e.target.value})} className="input-field w-full"/>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-2 text-sm font-bold shadow-lg shadow-primary/20">
                  Update Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}