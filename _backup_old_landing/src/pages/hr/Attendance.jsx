import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, Search, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor    = (i) => PALETTE[i % PALETTE.length];
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const statusConfig = {
  Present:   { bg:'bg-emerald-500/10', text:'text-emerald-500', icon: CheckCircle },
  Absent:    { bg:'bg-rose-500/10',    text:'text-rose-500',    icon: XCircle     },
  Late:      { bg:'bg-amber-500/10',   text:'text-amber-600',   icon: AlertCircle },
  'On Leave':{ bg:'bg-blue-500/10',    text:'text-blue-500',    icon: Clock       },
  Holiday:   { bg:'bg-purple-500/10',  text:'text-purple-500',  icon: Clock       },
};

const fmtTime = (t) => t ? t.slice(0, 5) : '—';

export default function Attendance() {
  const [records,   setRecords]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { user } = useAuth();
const isSA = user?.role === 'super_admin';
  const [editing, setEditing] = useState(null);

  const [marking, setMarking] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [markForm, setMarkForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'Present'
  });

  useEffect(() => {
    Promise.all([
      api.get('/api/hr/attendance'),
      api.get('/api/hr/employees'),
    ]).then(([a, e]) => {
      setRecords(a.data);
      setEmployees(e.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (e) => {
  e.preventDefault();
  await api.put('/api/hr/attendance/' + editing.id, {
    checkIn: editing.check_in,
    checkOut: editing.check_out,
    status: editing.status,
  });
  setEditing(null);
  // re-fetch attendance list
  const res = await api.get('/api/hr/attendance');
  setRecords(res.data);  // ✅
};

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this attendance record?')) return;
  setDeleting(id);
  try {
    await api.delete('/api/hr/attendance/' + id);
    setRecords(prev => prev.filter(r => r.id !== id));
  } finally {
    setDeleting(null);
  }
};

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!markForm.employeeId) return alert('Select an employee');
    
    try {
      await api.post('/api/hr/attendance', {
        employeeId: markForm.employeeId,
        date: markForm.date,
        checkIn: markForm.checkIn || undefined,
        checkOut: markForm.checkOut || undefined,
        status: markForm.status
      });
      setMarking(false);
      setMarkForm({ employeeId: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'Present' });
      // re-fetch attendance list
      const res = await api.get('/api/hr/attendance');
      setRecords(res.data);
    } catch (err) {
      alert('Failed to mark attendance');
    }
  };

  const empMap = employees.reduce((m, e) => {
    // employees list may use id or employee_id as key
    m[e.id] = e;
    if (e.employee_id) m[e.employee_id] = e;
    return m;
  }, {});

  const rows = records.map((r) => {
    const emp = empMap[r.employee_id] || empMap[r.id] || {};
    // Use employee_name from record directly if available (backend join),
    // else look up from employees list, else fall back to id
    const name = r.employee_name ||
                 (emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : null) ||
                 emp.name ||
                 r.employee_id ||
                 'Unknown';
    return { ...r, name };
  });

  const filtered = rows.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.employee_code?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = isSA ? filtered.reduce((acc, r) => {
  const key = r.enterprise_id || 'unknown';
  const label = r.owner_first ? `${r.owner_first} ${r.owner_last}` : key;
  if (!acc[key]) acc[key] = { label, rows: [] };
  acc[key].rows.push(r);
  return acc;
}, {}) : null;
const groupList = grouped ? Object.values(grouped) : [];

  const counts = { Present:0, Absent:0, Late:0, 'On Leave':0 };
  rows.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Attendance</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Daily attendance tracking</p>
          </div>
          <button onClick={() => { setMarking(true); setFilterDept(''); setFilterBranch(''); }} className="btn-primary flex items-center gap-2 text-sm">
            <CheckCircle size={16} /> Mark Attendance
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:'Present',  value: counts['Present'],   color:'#10b981', bg:'bg-emerald-500/10', icon: CheckCircle },
            { label:'Absent',   value: counts['Absent'],    color:'#ef4444', bg:'bg-rose-500/10',    icon: XCircle     },
            { label:'Late',     value: counts['Late'],      color:'#f59e0b', bg:'bg-amber-500/10',   icon: AlertCircle },
            { label:'On Leave', value: counts['On Leave'],  color:'#3b82f6', bg:'bg-blue-500/10',    icon: Clock       },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`} style={{ color: c.color }}>
                <c.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400 font-medium">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold dark:text-white">Attendance Records</h2>
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-52 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                 {['Employee','Date','Check In','Check Out','Status',''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>

                {isSA ? (
  groupList.map((group, gi) => (
    <React.Fragment key={gi}>
      <tr>
        <td colSpan={6} className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{group.label}</span>
            <span className="ml-1 text-xs text-slate-400">{group.rows.length} records</span>
          </div>
        </td>
      </tr>
      {group.rows.map((r, i) => {
  const cfg = statusConfig[r.status] || statusConfig['Absent'];
  return (
    <motion.tr key={r.id}
      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
      transition={{ delay: i * 0.05 }}
      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background:`linear-gradient(135deg,${getColor(i)},${getColor(i)}88)` }}>
            {getInitials(r.name)}
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">{r.name}</p>
            {r.employee_code && <p className="text-xs text-slate-400">{r.employee_code}</p>}
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
        {new Date(r.date).toLocaleDateString()}
      </td>
      <td className="px-5 py-3.5 text-sm font-semibold dark:text-slate-300">{fmtTime(r.check_in)}</td>
      <td className="px-5 py-3.5 text-sm font-semibold dark:text-slate-300">{fmtTime(r.check_out)}</td>
      <td className="px-5 py-3.5">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
          {r.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2">
          <button onClick={() => setEditing(r)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
            <Pencil size={14} />
          </button>
          <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
            {deleting === r.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <Trash2 size={14} />}
          </button>
        </div>
      </td>
    </motion.tr>
  );
})}
    </React.Fragment>
  ))
) : (
  filtered.map((r, i) => {
                  const cfg = statusConfig[r.status] || statusConfig['Absent'];
                  return (
                    <motion.tr key={r.id}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background:`linear-gradient(135deg,${getColor(i)},${getColor(i)}88)` }}>
                            {getInitials(r.name)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold dark:text-white">{r.name}</p>
                            {r.employee_code && <p className="text-xs text-slate-400">{r.employee_code}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold dark:text-slate-300">{fmtTime(r.check_in)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold dark:text-slate-300">{fmtTime(r.check_out)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditing(r)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50">
                            {deleting === r.id ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"/> : <Trash2 size={14} />}
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

      {editing && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setEditing(null)}>
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl"
      onClick={e => e.stopPropagation()}>
      <h2 className="text-xl font-bold dark:text-white mb-4">Edit Attendance</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <input type="time" value={editing.check_in || ''} onChange={e => setEditing({...editing, check_in: e.target.value})} className="input-field w-full" placeholder="Check In" />
        <input type="time" value={editing.check_out || ''} onChange={e => setEditing({...editing, check_out: e.target.value})} className="input-field w-full" placeholder="Check Out" />
        <select value={editing.status || ''} onChange={e => setEditing({...editing, status: e.target.value})} className="input-field w-full">
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
          <option value="Half Day">Half Day</option>
        </select>
        <button type="submit" className="btn-primary w-full">Update</button>
      </form>
    </div>
  </div>
)}

      {marking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setMarking(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold dark:text-white mb-4">Mark Attendance</h2>
            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Department</label>
                  <select value={filterDept} onChange={e => { setFilterDept(e.target.value); setMarkForm({...markForm, employeeId: ''}); }} className="input-field w-full">
                    <option value="">All</option>
                    {[...new Set(employees.map(e => e.department).filter(Boolean))].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Branch</label>
                  <select value={filterBranch} onChange={e => { setFilterBranch(e.target.value); setMarkForm({...markForm, employeeId: ''}); }} className="input-field w-full">
                    <option value="">All</option>
                    {[...new Set(employees.map(e => e.branch).filter(Boolean))].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Employee</label>
                <select value={markForm.employeeId} onChange={e => setMarkForm({...markForm, employeeId: e.target.value})} className="input-field w-full" required>
                  <option value="">Select Employee</option>
                  {employees.filter(e => (!filterDept || e.department === filterDept) && (!filterBranch || e.branch === filterBranch)).map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name || (emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : 'Unknown')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date</label>
                <input type="date" value={markForm.date} onChange={e => setMarkForm({...markForm, date: e.target.value})} className="input-field w-full" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Check In</label>
                  <input type="time" value={markForm.checkIn} onChange={e => setMarkForm({...markForm, checkIn: e.target.value})} className="input-field w-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Check Out</label>
                  <input type="time" value={markForm.checkOut} onChange={e => setMarkForm({...markForm, checkOut: e.target.value})} className="input-field w-full" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select value={markForm.status} onChange={e => setMarkForm({...markForm, status: e.target.value})} className="input-field w-full">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMarking(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-primary py-2 text-sm">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}