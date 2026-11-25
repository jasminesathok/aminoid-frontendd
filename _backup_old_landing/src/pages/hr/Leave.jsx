import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, CheckCircle, XCircle, Search, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9'];
const getColor    = (i) => PALETTE[i % PALETTE.length];
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const statusStyle = {
  Approved: { bg:'bg-emerald-500/10', text:'text-emerald-500' },
  Pending:  { bg:'bg-amber-500/10',   text:'text-amber-600'   },
  Rejected: { bg:'bg-rose-500/10',    text:'text-rose-500'    },
};
const leaveTypes = ['All','Annual','Medical','Casual','Unpaid','Other'];
const leaveTypeOptions = ['Annual','Medical','Casual','Unpaid','Other'];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) : '—';

// Helper to format a date string/object to yyyy-MM-dd for <input type="date">
const toInputDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().split('T')[0];
};

export default function Leave() {
  const toast = useToast();
  const { user } = useAuth();
const isSA = user?.role === 'super_admin';
  const [leaves,    setLeaves]    = useState([]);
  const [filter,    setFilter]    = useState('All');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState(null);
  const [employees, setEmployees] = useState([]);
  const [deleting,  setDeleting]  = useState(null);
  const [editing,   setEditing]   = useState(null); // leave record being edited

  useEffect(() => {
    Promise.all([
      api.get('/api/hr/leaves'),
      api.get('/api/hr/employees'),
    ]).then(([lRes, eRes]) => {
      setLeaves(lRes.data);
      setEmployees(eRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      const res = await api.put(`/api/hr/leaves/${id}`, { status });
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: res.data.status ?? res.data?.data?.status ?? status } : l));
      toast.success(`Leave ${status.toLowerCase()}.`);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave record?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/hr/leaves/' + id);
      setLeaves(prev => prev.filter(l => l.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/hr/leaves/' + editing.id, {
        status:    editing.status,
        type:      editing.type,
        startDate: editing.start_date,
        endDate:   editing.end_date,
        reason:    editing.reason,
      });
      // re-fetch to get updated data with employee names
      const res = await api.get('/api/hr/leaves');
      setLeaves(res.data);
      toast.success('Leave record updated.');
    } finally {
      setEditing(null);
    }
  };

  const empMap = employees.reduce((m, e) => { m[e.id] = e; return m; }, {});

  const rows = leaves.map((l, i) => {
    const emp = empMap[l.employee_id] || {};
    const name = l.employee_name ||
                 (emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : null) ||
                 emp.name || l.employee_id || 'Unknown';
    return { ...l, name, colorIdx: i };
  });

  const filtered = rows.filter(l =>
    (filter === 'All' || l.type === filter) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) ||
     l.employee_code?.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = isSA ? filtered.reduce((acc, l) => {
  const key = l.enterprise_id || 'unknown';
  const label = l.owner_first ? `${l.owner_first} ${l.owner_last}` : key;
  if (!acc[key]) acc[key] = { label, leaves: [] };
  acc[key].leaves.push(l);
  return acc;
}, {}) : null;
const groupList = grouped ? Object.values(grouped) : [];

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
          <h1 className="text-3xl font-bold dark:text-white">Leave Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Review and approve employee leave requests.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:'Total Requests', value: rows.length,                                   color:'#939BFF', icon: CalendarDays },
            { label:'Approved',       value: rows.filter(l=>l.status==='Approved').length,  color:'#10b981', icon: CheckCircle  },
            { label:'Pending',        value: rows.filter(l=>l.status==='Pending').length,   color:'#f59e0b', icon: Clock        },
            { label:'Rejected',       value: rows.filter(l=>l.status==='Rejected').length,  color:'#ef4444', icon: XCircle      },
          ].map((c,i) => (
            <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${c.color}18`, color: c.color }}>
                <c.icon size={20}/>
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              {leaveTypes.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    filter === t ? 'bg-primary text-white shadow-md shadow-primary/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary'
                  }`}>{t}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-52 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search employee…" className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Employee','Type','From','To','Reason','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isSA ? (
  groupList.map((group, gi) => (
    <React.Fragment key={gi}>
      <tr>
        <td colSpan={7} className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{group.label}</span>
            <span className="ml-1 text-xs text-slate-400">{group.leaves.length} requests</span>
          </div>
        </td>
      </tr>
      {group.leaves.map((l, i) => {
  const st = statusStyle[l.status] || statusStyle['Pending'];
  const busy = updating === l.id;
  return (
    <motion.tr key={l.id}
      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: i * 0.04 }}
      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
       <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background:`linear-gradient(135deg,${getColor(l.colorIdx)},${getColor(l.colorIdx)}88)` }}>
                            {getInitials(l.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold dark:text-white">{l.name}</p>
                            <p className="text-xs text-slate-400">
                              {l.employee_code ? `${l.employee_code} · ` : ''}
                              {l.department || ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{l.type}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{fmtDate(l.start_date)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{fmtDate(l.end_date)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400 max-w-40 truncate">{l.reason || '—'}</td>

                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>{l.status}</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Approve / Reject — only for pending */}
                          {l.status === 'Pending' && (
                            <>
                              <button
                                disabled={busy}
                                onClick={() => handleStatus(l.id, 'Approved')}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
                                {busy ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <CheckCircle size={12}/>}
                                Approve
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => handleStatus(l.id, 'Rejected')}
                                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                                <XCircle size={12}/> Reject
                              </button>
                            </>
                          )}

                          {/* Edit icon */}
                          <button
                            onClick={() => setEditing({ ...l, start_date: toInputDate(l.start_date), end_date: toInputDate(l.end_date) })}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                            title="Edit">
                            <Pencil size={14}/>
                          </button>

                          {/* Delete icon */}
                          <button
                            disabled={deleting === l.id}
                            onClick={() => handleDelete(l.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                            title="Delete">
                            {deleting === l.id
                              ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                              : <Trash2 size={14}/>}
                          </button>
                        </div>
                      </td>
    </motion.tr>
  );
})}
    </React.Fragment>
  ))
) : (
  filtered.map((l, i) => {
    const st = statusStyle[l.status] || statusStyle['Pending'];
    const busy = updating === l.id;
    return (
      <motion.tr key={l.id}
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        transition={{ delay: i * 0.04 }}
        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">

        <td className="px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background:`linear-gradient(135deg,${getColor(l.colorIdx)},${getColor(l.colorIdx)}88)` }}>
              {getInitials(l.name)}
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white">{l.name}</p>
              <p className="text-xs text-slate-400">
                {l.employee_code ? `${l.employee_code} · ` : ''}
                {l.department || ''}
              </p>
            </div>
          </div>
        </td>

        <td className="px-5 py-3.5">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{l.type}</span>
        </td>
        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{fmtDate(l.start_date)}</td>
        <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">{fmtDate(l.end_date)}</td>
        <td className="px-5 py-3.5 text-sm text-slate-400 max-w-40 truncate">{l.reason || '—'}</td>

        <td className="px-5 py-3.5">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>{l.status}</span>
        </td>

        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            {l.status === 'Pending' && (
              <>
                <button
                  disabled={busy}
                  onClick={() => handleStatus(l.id, 'Approved')}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
                  {busy ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <CheckCircle size={12}/>}
                  Approve
                </button>
                <button
                  disabled={busy}
                  onClick={() => handleStatus(l.id, 'Rejected')}
                  className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                  <XCircle size={12}/> Reject
                </button>
              </>
            )}
            <button
              onClick={() => setEditing({ ...l, start_date: toInputDate(l.start_date), end_date: toInputDate(l.end_date) })}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
              title="Edit">
              <Pencil size={14}/>
            </button>
            <button
              disabled={deleting === l.id}
              onClick={() => handleDelete(l.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
              title="Delete">
              {deleting === l.id
                ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                : <Trash2 size={14}/>}
            </button>
          </div>
        </td>
      </motion.tr>
    );
  })
)}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setEditing(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold dark:text-white mb-4">Edit Leave</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Leave Type</label>
                <select
                  value={editing.type || ''}
                  onChange={e => setEditing({ ...editing, type: e.target.value })}
                  className="input-field w-full">
                  {leaveTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">From</label>
                <input
                  type="date"
                  value={editing.start_date || ''}
                  onChange={e => setEditing({ ...editing, start_date: e.target.value })}
                  className="input-field w-full"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">To</label>
                <input
                  type="date"
                  value={editing.end_date || ''}
                  onChange={e => setEditing({ ...editing, end_date: e.target.value })}
                  className="input-field w-full"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Reason</label>
                <input
                  type="text"
                  value={editing.reason || ''}
                  onChange={e => setEditing({ ...editing, reason: e.target.value })}
                  placeholder="Reason"
                  className="input-field w-full"/>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Status</label>
                <select
                  value={editing.status || ''}
                  onChange={e => setEditing({ ...editing, status: e.target.value })}
                  className="input-field w-full">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">Update</button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}