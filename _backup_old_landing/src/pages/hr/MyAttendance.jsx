import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, AlertCircle, CalendarDays, LogIn, LogOut, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

const STATUS_STYLE = {
  Present:    'bg-emerald-500/10 text-emerald-500',
  Absent:     'bg-rose-500/10 text-rose-500',
  Late:       'bg-amber-500/10 text-amber-600',
  'On Leave': 'bg-sky-500/10 text-sky-500',
  Holiday:    'bg-violet-500/10 text-violet-500',
};

const STATUS_ICON = {
  Present:    CheckCircle,
  Absent:     XCircle,
  Late:       AlertCircle,
  'On Leave': CalendarDays,
  Holiday:    CalendarDays,
};

const fmtTime = t => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
};

const todayStr = () => new Date().toISOString().split('T')[0];
const nowTimeStr = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
};

export default function MyAttendance() {
  const [records,    setRecords]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [notLinked,  setNotLinked]  = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut,setCheckingOut]= useState(false);
  const [todayRec,   setTodayRec]   = useState(null); // today's attendance record if exists

  const load = useCallback(() => {
    return api.get('/api/hr/my/attendance', { silent: true })
      .then(res => {
        setRecords(res.data);
        // Find today's record
        const today = todayStr();
        const rec = res.data.find(r => r.date?.split('T')[0] === today || r.date === today);
        setTodayRec(rec || null);
      })
      .catch(err => { if (err.message?.includes('linked')) setNotLinked(true); });
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await api.post('/api/hr/my/attendance', {
        date:    todayStr(),
        checkIn: nowTimeStr(),
        status:  isLate() ? 'Late' : 'Present',
      });
      await load();
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await api.post('/api/hr/my/attendance', {
        date:     todayStr(),
        checkOut: nowTimeStr(),
        status:   todayRec?.status || 'Present',
      });
      await load();
    } finally {
      setCheckingOut(false);
    }
  };

  // Consider late if checking in after 9:30 AM
  const isLate = () => {
    const now = new Date();
    return now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
  };

  const hasCheckedIn  = !!todayRec?.check_in;
  const hasCheckedOut = !!todayRec?.check_out;

  const counts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

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

        <div>
          <h1 className="text-3xl font-bold dark:text-white">My Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Your attendance history.</p>
        </div>

        {/* ── Today's Check-In / Check-Out Card ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left — date + status */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Today</p>
                <p className="text-lg font-bold dark:text-white">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {hasCheckedIn && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      In: <span className="font-bold text-emerald-500">{fmtTime(todayRec.check_in)}</span>
                    </span>
                  )}
                  {hasCheckedOut && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Out: <span className="font-bold text-rose-400">{fmtTime(todayRec.check_out)}</span>
                    </span>
                  )}
                  {!hasCheckedIn && (
                    <span className="text-xs text-slate-400">Not checked in yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right — buttons */}
            <div className="flex items-center gap-3">
              {/* Check In */}
              <button
                onClick={handleCheckIn}
                disabled={hasCheckedIn || checkingIn}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
                  bg-emerald-500 text-white hover:bg-emerald-600 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {checkingIn
                  ? <Loader2 size={16} className="animate-spin" />
                  : <LogIn size={16} />}
                {hasCheckedIn ? 'Checked In ✓' : 'Check In'}
              </button>

              {/* Check Out */}
              <button
                onClick={handleCheckOut}
                disabled={!hasCheckedIn || hasCheckedOut || checkingOut}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
                  bg-rose-500 text-white hover:bg-rose-600 transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
              >
                {checkingOut
                  ? <Loader2 size={16} className="animate-spin" />
                  : <LogOut size={16} />}
                {hasCheckedOut ? 'Checked Out ✓' : 'Check Out'}
              </button>
            </div>
          </div>

          {/* Status bar */}
          <AnimatePresence>
            {todayRec && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
              >
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${STATUS_STYLE[todayRec.status] || 'bg-slate-100 text-slate-500'}`}>
                  {React.createElement(STATUS_ICON[todayRec.status] || Clock, { size: 12 })}
                  Today's status: {todayRec.status}
                </span>
                {todayRec.status === 'Late' && (
                  <span className="text-xs text-slate-400">Check-in was after 9:30 AM</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Present',   value: counts.Present        || 0, color: '#10b981' },
            { label: 'Absent',    value: counts.Absent         || 0, color: '#ef4444' },
            { label: 'Late',      value: counts.Late           || 0, color: '#f59e0b' },
            { label: 'On Leave',  value: counts['On Leave']    || 0, color: '#939BFF' },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}18`, color: c.color }}>
                <Clock size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Records table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold dark:text-white">Attendance Records</h2>
            <p className="text-xs text-slate-400 mt-0.5">{records.length} records total</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Date', 'Check In', 'Check Out', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm">No attendance records found.</td></tr>
                )}
                {records.map((rec, i) => {
                  const Icon = STATUS_ICON[rec.status] || Clock;
                  const isToday = rec.date?.split('T')[0] === todayStr();
                  return (
                    <motion.tr key={rec.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className={`border-b border-slate-50 dark:border-slate-800/50 transition-colors
                        ${isToday ? 'bg-primary/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'}`}>
                      <td className="px-5 py-3.5 text-sm font-semibold dark:text-white">
                        {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {isToday && <span className="ml-2 text-xs font-bold text-primary">Today</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{fmtTime(rec.check_in)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{fmtTime(rec.check_out)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${STATUS_STYLE[rec.status] || 'bg-slate-100 text-slate-500'}`}>
                          <Icon size={11} />{rec.status}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}