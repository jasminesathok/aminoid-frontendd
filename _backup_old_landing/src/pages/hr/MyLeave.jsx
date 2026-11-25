import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Plus, X, Save, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const LEAVE_TYPES = ['Annual', 'Medical', 'Casual', 'Unpaid', 'Other'];

const STATUS_STYLE = {
  Pending:  'bg-amber-500/10 text-amber-600',
  Approved: 'bg-emerald-500/10 text-emerald-500',
  Rejected: 'bg-rose-500/10 text-rose-500',
};
const STATUS_ICON = { Pending: Clock, Approved: CheckCircle, Rejected: XCircle };

const diffDays = (a, b) => {
  const ms = new Date(b) - new Date(a);
  return ms > 0 ? Math.ceil(ms / 86400000) + 1 : 1;
};

export default function MyLeave() {
  const toast = useToast();
  const [leaves,    setLeaves]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [notLinked, setNotLinked] = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form, setForm] = useState({
    type: 'Annual', startDate: '', endDate: '', reason: '',
  });

  useEffect(() => {
    api.get('/api/hr/my/leave', { silent: true })
      .then(res => setLeaves(res.data))
      .catch(err => { if (err.message?.includes('linked')) setNotLinked(true); })
      .finally(() => setLoading(false));
  }, []);

  const handleApply = async () => {
    if (!form.startDate || !form.endDate) {
      toast.error('Please select start and end dates.');
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be after start date.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/api/hr/my/leave', form);
      setLeaves(prev => [res.data, ...prev]);
      toast.success('Leave application submitted!');
      setShowForm(false);
      setForm({ type: 'Annual', startDate: '', endDate: '', reason: '' });
    } finally {
      setSaving(false);
    }
  };

  const counts = {
    total:    leaves.length,
    pending:  leaves.filter(l => l.status === 'Pending').length,
    approved: leaves.filter(l => l.status === 'Approved').length,
    rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (notLinked) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto mt-20 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle size={28} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Profile Not Linked</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your account is not linked to an employee profile yet. Please contact your HR admin to link your account.
        </p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">My Leave</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Apply for leave and track your requests.</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Apply for Leave
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Total Applied', value: counts.total,    color: '#939BFF' },
            { label: 'Pending',       value: counts.pending,  color: '#f59e0b' },
            { label: 'Approved',      value: counts.approved, color: '#10b981' },
            { label: 'Rejected',      value: counts.rejected, color: '#ef4444' },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}18`, color: c.color }}>
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Leave list */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold dark:text-white">Leave History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Type', 'From', 'To', 'Days', 'Reason', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No leave requests yet.</td></tr>
                )}
                {leaves.map((l, i) => {
                  const Icon = STATUS_ICON[l.status] || Clock;
                  return (
                    <motion.tr key={l.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{l.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(l.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                        {new Date(l.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold dark:text-white">
                        {diffDays(l.start_date, l.end_date)}d
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        {l.reason || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLE[l.status]}`}>
                          <Icon size={11} />{l.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Apply leave slide-over */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setShowForm(false)} />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed right-0 top-0 h-full w-full max-w-md glass-sidebar z-50 p-8 overflow-y-auto"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold dark:text-white">Apply for Leave</h2>
                  <button onClick={() => setShowForm(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Leave Type</label>
                    <div className="flex flex-wrap gap-2">
                      {LEAVE_TYPES.map(t => (
                        <button key={t} type="button"
                          onClick={() => setForm(p => ({ ...p, type: t }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            form.type === t ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                          }`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                      <input type="date" value={form.startDate}
                        onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                        className="input-field" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                      <input type="date" value={form.endDate}
                        onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                        className="input-field" />
                    </div>
                  </div>

                  {/* Days preview */}
                  {form.startDate && form.endDate && new Date(form.endDate) >= new Date(form.startDate) && (
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm text-primary font-semibold text-center">
                      {diffDays(form.startDate, form.endDate)} day{diffDays(form.startDate, form.endDate) > 1 ? 's' : ''} requested
                    </div>
                  )}

                  {/* Reason */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reason <span className="text-slate-400 font-normal">(optional)</span></label>
                    <textarea value={form.reason}
                      onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
                      rows={3} placeholder="Brief reason for leave…"
                      className="input-field resize-none" />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                      Cancel
                    </button>
                    <button onClick={handleApply} disabled={saving}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Save size={15} />}
                      Submit
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
