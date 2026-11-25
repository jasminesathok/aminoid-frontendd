import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { UserCheck, AlertCircle, Briefcase, Building2, DollarSign, Calendar, Mail, Hash } from 'lucide-react';
import { api } from '../../utils/api';

export default function MyProfile() {
  const [emp,       setEmp]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [notLinked, setNotLinked] = useState(false);
  const [editing, setEditing]   = useState(false);
const [form,    setForm]      = useState({});

const handleEdit = () => setForm({ phone: emp?.phone || '', emergency_contact: emp?.emergency_contact || '' });
const startEdit  = () => { handleEdit(); setEditing(true); };

const handleSave = async () => {
  try {
    await api.put('/api/hr/my/employee', form);
    setEmp(prev => ({ ...prev, ...form }));
    setEditing(false);
  } catch (err) { console.error(err); }
};

  useEffect(() => {
    api.get('/api/hr/my/employee', { silent: true })
      .then(res => setEmp(res.data))
      .catch(err => { if (err.message?.includes('linked') || err.message?.includes('No employee')) setNotLinked(true); })
      .finally(() => setLoading(false));
  }, []);

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

  const fields = [
    { label: 'Employee ID',  value: emp?.employee_code || '—', icon: Hash,       color: '#939BFF' },
    { label: 'Role',         value: emp?.role         || '—',                  icon: Briefcase,  color: '#10b981' },
    { label: 'Department',   value: emp?.department   || '—',                  icon: Building2,  color: '#f59e0b' },
    { label: 'Status',       value: emp?.status       || '—',                  icon: UserCheck,  color: '#3b82f6' },
    { label: 'Salary',       value: emp?.salary ? `$${Number(emp.salary).toLocaleString()}` : '—', icon: DollarSign, color: '#8b5cf6' },
    { label: 'Joined',       value: emp?.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—', icon: Calendar, color: '#ec4899' },
  ];

  const initials = emp?.name
    ? emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 px-2">

        <div>
          <h1 className="text-3xl font-bold dark:text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your employee record.</p>
        </div>

        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold text-primary">{initials}</span>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold dark:text-white">{emp?.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{emp?.role} · {emp?.department}</p>
            <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-lg ${
              emp?.status === 'Active'
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-rose-500/10 text-rose-500'
            }`}>{emp?.status}</span>
          </div>
        </motion.div>

        {/* Detail grid */}
        {/* Detail grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="glass-card p-5 rounded-2xl flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${f.color}18`, color: f.color }}>
                <f.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{f.label}</p>
                <p className="text-sm font-bold dark:text-white mt-0.5">{f.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Edit button — OUTSIDE the map, after the grid */}
        <div className="flex justify-end">
          {!editing ? (
            <button onClick={startEdit} className="btn-primary text-sm px-4 py-2">Edit Profile</button>
          ) : (
            <div className="flex gap-2">
              <div className="glass-card rounded-xl p-4 flex flex-col gap-3 sm:col-span-2">
                <p className="text-sm font-semibold dark:text-white">Edit Contact Info</p>
                <input
                  className="input-field"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
                <input
                  className="input-field"
                  placeholder="Emergency Contact"
                  value={form.emergency_contact}
                  onChange={e => setForm(f => ({ ...f, emergency_contact: e.target.value }))}
                />
              </div>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-4 py-2">Cancel</button>
              <button onClick={handleSave} className="btn-primary text-sm px-4 py-2">Save</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}