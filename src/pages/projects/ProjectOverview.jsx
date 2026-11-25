import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  FolderKanban, CheckSquare, AlertTriangle,
  ArrowUpRight, ArrowDownRight, MoreVertical, Flag,
  TrendingUp, Pencil, Trash2, X,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const PALETTE = ['#939BFF', '#C4B5F4', '#AEE9FF', '#B6EADA', '#7B99D9', '#f59e0b', '#10b981', '#ef4444'];
const getColor = i => PALETTE[i % PALETTE.length];

const statusStyle = {
  'In Progress': { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  'Planning':    { bg: 'bg-blue-500/10',    text: 'text-blue-500'    },
  'Completed':   { bg: 'bg-slate-500/10',   text: 'text-slate-500'   },
  'On Hold':     { bg: 'bg-amber-500/10',   text: 'text-amber-600'   },
  'Cancelled':   { bg: 'bg-rose-500/10',    text: 'text-rose-500'    },
};

const StatCard = ({ title, value, change, trend, icon: Icon, color, sub }) => (
  <motion.div whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
    <div className="flex items-start">
  <div className="p-3 rounded-xl" style={{ background: `${color}18`, color }}>
    <Icon size={22} />
  </div>
</div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold dark:text-white mt-1">{value ?? '—'}</h3>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {change && (
      <div className="flex items-center gap-2">
        <span className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{change}
        </span>
        <span className="text-xs text-slate-400">from database</span>
      </div>
    )}
  </motion.div>
);

export default function ProjectOverview() {
  const [projects, setProjects] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [editing,  setEditing]  = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    Promise.all([
      api.get('/api/projects'),
      api.get('/api/projects/tasks/list'),
    ]).then(([pRes, tRes]) => {
      setProjects(pRes.data);
      setTasks(tRes.data);
    }).finally(() => setLoading(false));
  }, []);

  // Register document click listener only once to close the dropdown
  useEffect(() => {
    const close = () => setMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/projects/' + id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
      setMenuOpen(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // ✅ Send dueDate (camelCase) as expected by the backend controller
      await api.put('/api/projects/' + editing.id, {
        name:     editForm.name,
        status:   editForm.status,
        priority: editForm.priority,
        progress: editForm.progress,
        dueDate:  editForm.due_date, // ✅ renamed from due_date → dueDate for backend
      });
      const res = await api.get('/api/projects');
      setProjects(res.data);
      setEditing(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Derived stats
  const activeProjects    = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalTasks        = tasks.length;
  const completedTasks    = tasks.filter(t => t.status === 'Done').length;
  const overdueTasks      = tasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date() && t.status !== 'Done';
  }).length;

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
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Project Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            All projects at a glance — {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Projects"  value={projects.length} icon={FolderKanban}  color="#939BFF" sub={`${completedProjects} completed`} />
          <StatCard title="Active Projects" value={activeProjects}  icon={TrendingUp}    color="#10b981" sub="In Progress" />
          <StatCard title="Total Tasks"     value={totalTasks}      icon={CheckSquare}   color="#C4B5F4" sub={`${completedTasks} done`} />
          <StatCard title="Overdue Tasks"   value={overdueTasks}    icon={AlertTriangle} color="#ef4444" sub="Needs attention" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* All Projects */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold dark:text-white">All Projects</h2>
              <a href="/projects/list" className="text-xs font-bold text-primary hover:underline">Manage →</a>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <FolderKanban size={32} className="mb-3 opacity-40" />
                <p className="text-sm">No projects yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 6).map((p, i) => {
                  const st = statusStyle[p.status] || statusStyle['Planning'];
                  const progress = Number(p.progress) || 0;
                  return (
                    <div key={p.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 cursor-pointer transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: getColor(i) }} />
                          <div>
                            <p className="text-sm font-bold dark:text-white">{p.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {p.due_date
                                ? `Due ${new Date(p.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
                                : 'No due date'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>{p.status}</span>
                          <div className="relative">
                            {/* ✅ stopPropagation prevents document listener from closing menu immediately */}
                            <button
                              onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}
                              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {menuOpen === p.id && (
                              <div className="absolute right-0 top-7 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl w-36 py-1">
                                {/* ✅ stopPropagation on Edit button too */}
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
                                  <Pencil size={13} /> Edit
                                </button>
                                {/* ✅ stopPropagation on Delete button too */}
                                <button
                                  onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                                  disabled={deleting === p.id}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-40"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${getColor(i)}, ${getColor(i)}99)` }}
                          />
                        </div>
                        <span className="text-xs font-bold dark:text-white w-8 text-right">{progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Task Status */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold dark:text-white">Task Status</h2>
              <Flag size={16} className="text-slate-400" />
            </div>
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckSquare size={28} className="mb-3 opacity-40" />
                <p className="text-sm text-center">No tasks yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {['Todo', 'In Progress', 'Review', 'Done'].map((status, i) => {
                  const count = tasks.filter(t => t.status === status).length;
                  const pct   = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{status}</span>
                        <span className="text-sm font-bold dark:text-white">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: getColor(i) }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">By Priority</p>
                  {['High', 'Medium', 'Low'].map((priority) => {
                    const count = tasks.filter(t => t.priority === priority).length;
                    const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
                    return (
                      <div key={priority} className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: colors[priority] }} />
                          <span className="text-xs text-slate-500 dark:text-slate-400">{priority}</span>
                        </div>
                        <span className="text-xs font-bold dark:text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects Summary Table */}
        {projects.length > 0 && (
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-base font-bold dark:text-white mb-5">Projects Summary</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    {['Project', 'Status', 'Priority', 'Progress', 'Due Date'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-slate-400 uppercase tracking-wide pb-3 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => {
                    const st = statusStyle[p.status] || statusStyle['Planning'];
                    const progress = Number(p.progress) || 0;
                    const prioColors = { High: 'text-rose-500', Medium: 'text-amber-500', Low: 'text-emerald-500' };
                    return (
                      <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-none">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: getColor(i) }} />
                            <span className="font-semibold dark:text-white truncate max-w-[180px]">{p.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>{p.status}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold ${prioColors[p.priority] || 'text-slate-400'}`}>{p.priority || 'Medium'}</span>
                        </td>
                        <td className="py-3 pr-4 w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: getColor(i) }} />
                            </div>
                            <span className="text-xs font-bold dark:text-white">{progress}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400 text-xs">
                          {p.due_date
                            ? new Date(p.due_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">Edit Project</h2>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Project Name</label>
                  <input
                    required
                    value={editForm.name || ''}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="input-field w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                    <select
                      value={editForm.status || 'Planning'}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      className="input-field w-full"
                    >
                      {['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Priority</label>
                    <select
                      value={editForm.priority || 'Medium'}
                      onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                      className="input-field w-full"
                    >
                      {['Low', 'Medium', 'High'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Progress (%)</label>
                    <input
                      type="number" min="0" max="100"
                      value={editForm.progress ?? 0}
                      onChange={e => setEditForm({ ...editForm, progress: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Due Date</label>
                    {/* ✅ Stored as due_date locally for display, sent as dueDate to backend in handleUpdate */}
                    <input
                      type="date"
                      value={editForm.due_date || ''}
                      onChange={e => setEditForm({ ...editForm, due_date: e.target.value })}
                      className="input-field w-full"
                    />
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