import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Clock, UserPlus, MoreVertical, ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor  = (i) => PALETTE[i % PALETTE.length];
const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl flex flex-col gap-4">
    <div className="flex items-start">
      <div className="p-3 rounded-xl" style={{ background: `${color}18`, color }}>
        <Icon size={22} />
      </div>
    </div>
    <div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold dark:text-white mt-1">{value ?? '—'}</h3>
    </div>
    <div className="flex items-center gap-2">
      <span className="flex items-center text-xs font-bold text-emerald-500"><ArrowUpRight size={13} />Live</span>
      <span className="text-xs text-slate-400">from database</span>
    </div>
  </motion.div>
);

export default function HRDashboard() {
  const navigate                  = useNavigate();
  const { user } = useAuth();
const isSA = user?.role === 'super_admin';
  const [stats,     setStats]     = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/hr/stats'),
      api.get('/api/hr/employees'),
    ]).then(([s, e]) => {
      setStats(s.data);
      setEmployees(e.data);
    }).finally(() => setLoading(false));
  }, []);

  const deptCounts = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});
  const deptList = Object.entries(deptCounts).map(([dept, count]) => ({ dept, count }));
  const maxDept  = Math.max(...deptList.map(d => d.count), 1);
  const grouped = employees.reduce((acc, e) => {
  const key = e.enterprise_id || 'unknown';
  const label = e.owner_first ? `${e.owner_first} ${e.owner_last}` : key;
  if (!acc[key]) acc[key] = { label, employees: [] };
  acc[key].employees.push(e);
  return acc;
}, {});
const groupList = Object.values(grouped);

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
          <h1 className="text-3xl font-bold dark:text-white">HR Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Overview of your human resources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Employees" value={stats?.totalEmployees} icon={Users}     color="#939BFF" />
          <StatCard title="Present Today"   value={stats?.todayPresent}   icon={UserCheck} color="#B6EADA" />
          <StatCard title="On Leave"        value={stats?.onLeave}        icon={UserX}     color="#7B99D9" />
          <StatCard title="Pending Leaves"  value={stats?.pendingLeaves}  icon={Clock}     color="#C4B5F4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department chart */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold dark:text-white">Headcount by Department</h2>
              <button className="text-slate-400"><MoreVertical size={18} /></button>
            </div>
            <div className="space-y-4">
              {deptList.map((d, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 w-28 shrink-0">{d.dept}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${(d.count / maxDept) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: getColor(i) }}
                    />
                  </div>
                  <span className="text-sm font-bold dark:text-white w-6 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent employees */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold dark:text-white">Employees</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate('/hr/employees/add')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
                  <UserPlus size={12} /> Add
                </button>
                <button onClick={() => navigate('/hr/employees')}
                  className="text-xs font-semibold text-primary hover:underline">View All</button>
              </div>
            </div>
            
            <div className="space-y-4">
  {isSA ? (
    groupList.map((group, gi) => (
      <div key={gi} className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{group.label}</span>
          <span className="text-xs text-slate-400">({group.employees.length})</span>
        </div>
        {group.employees.slice(0, 3).map((e, i) => (
          <div key={e.id} className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: `linear-gradient(135deg, ${getColor(i)}, ${getColor(i)}99)` }}>
                {getInitials(e.name)}
              </div>
              <div>
                <p className="text-sm font-semibold dark:text-white">{e.name}</p>
                <p className="text-xs text-slate-400">{e.role} · {e.department}</p>
              </div>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-600'
            }`}>{e.status}</span>
          </div>
        ))}
      </div>
    ))
  ) : (
    employees.slice(0, 6).map((e, i) => (
      <div key={e.id} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${getColor(i)}, ${getColor(i)}99)` }}>
            {getInitials(e.name)}
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">{e.name}</p>
            <p className="text-xs text-slate-400">{e.role} · {e.department}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
          e.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-600'
        }`}>{e.status}</span>
      </div>
    ))
  )}
</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
