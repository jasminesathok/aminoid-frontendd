import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { UserCheck, Clock } from 'lucide-react';
import { api } from '../../utils/api';

const DASHBOARDS = [
  { key: 'marketing', label: 'Marketing' },
  { key: 'sales', label: 'Sales' },
  { key: 'projects', label: 'Project Management' },
];

const MemberRequests = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    // Use existing /api/setup/users — filter only members
    api.get('/api/setup/users')
      .then(res => {
        const allUsers = res.data || [];
        const memberUsers = allUsers
          .filter(u => u.role === 'member')
          .map(u => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
            email: u.email,
            status: u.approved_sections ? 'approved' : 'pending',
            dashboardAccess: u.approved_sections
              ? JSON.parse(u.approved_sections)
              : [],
          }));
        setMembers(memberUsers);
      })
      .catch(err => console.error(err));
  }, []);

  const toggleDashboard = (memberId, dashKey) => {
    setMembers(prev => prev.map(m =>
      m.id === memberId
        ? { ...m, dashboardAccess: m.dashboardAccess.includes(dashKey)
            ? m.dashboardAccess.filter(d => d !== dashKey)
            : [...m.dashboardAccess, dashKey] }
        : m
    ));
  };

  const approve = async (memberId) => {
    const member = members.find(m => m.id === memberId);
    try {
      // Save approved_sections via existing PUT /api/setup/users/:id
      await api.put(`/api/setup/users/${memberId}`, {
        approved_sections: JSON.stringify(member.dashboardAccess),
      });
      setMembers(prev => prev.map(m =>
        m.id === memberId ? { ...m, status: 'approved' } : m
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const pending  = members.filter(m => m.status === 'pending');
  const approved = members.filter(m => m.status === 'approved');

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-1 dark:text-white">Individual Requests</h1>
        <p className="text-slate-500 text-sm mb-6">{pending.length} pending approval</p>

        {pending.length === 0 && (
          <p className="text-slate-400 text-sm">No pending requests.</p>
        )}

        {pending.map(m => (
          <div key={m.id} className="glass-card rounded-2xl p-5 mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-600 font-bold">
                {m.name[0]}
              </div>
              <div>
                <p className="font-semibold dark:text-white">{m.name}</p>
                <p className="text-xs text-slate-400">{m.email}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                <Clock size={12} /> Pending
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Grant access to:</p>
              <div className="flex gap-4">
                {DASHBOARDS.map(d => (
                  <label key={d.key} className="flex items-center gap-2 text-sm cursor-pointer dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={m.dashboardAccess.includes(d.key)}
                      onChange={() => toggleDashboard(m.id, d.key)}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => approve(m.id)}
              className="btn-primary flex items-center gap-2 w-fit text-sm px-4 py-2"
            >
              <UserCheck size={16} /> Approve Individual
            </button>
          </div>
        ))}

        {approved.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-slate-400 mb-3">Recently Approved</h2>
            {approved.map(m => (
              <div key={m.id} className="glass-card rounded-xl p-4 mb-2 flex items-center gap-3 opacity-60">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {m.name[0]}
                </div>
                <span className="text-sm dark:text-white">{m.name}</span>
                <span className="ml-auto text-xs text-emerald-500">
                  ✓ Approved — {m.dashboardAccess.join(', ') || 'No access'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberRequests;