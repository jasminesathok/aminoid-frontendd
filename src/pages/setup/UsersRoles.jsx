import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { UserCog, Copy, CheckCircle } from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ROLES = ['member', 'admin', 'super_admin'];

const roleStyle = {
  member:      { bg: 'bg-slate-200/70 dark:bg-slate-700/40', text: 'text-slate-500' },
  admin:       { bg: 'bg-blue-500/10',  text: 'text-blue-600'  },
  super_admin: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
};

export default function UsersRoles() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const [copied,   setCopied]   = useState(false);
  const { user: me } = useAuth();
  const toast = useToast();

  const load = () => api.get('/api/setup/users').then(r => setUsers(r.data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleRoleChange = async (userId, role) => {
    setUpdating(userId);
    try {
      await api.put(`/api/setup/users/${userId}/role`, { role });
      await load();
    } finally {
      setUpdating(null);
    }
  };

  // Fixed: was pointing to wrong /api/projects/users/ endpoint
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/setup/users/${id}`);
      await load();
      toast.success('User deleted.');
    } catch (err) {
      console.error(err);
    }
  };

  // Copy enterprise ID (admin's own user id) to clipboard
  const copyEnterpriseId = () => {
    if (!me?.id) return;
    navigator.clipboard.writeText(me.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <UserCog size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Users & Roles</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-0.5">Manage team member roles and permissions.</p>
          </div>
        </div>

        {/* ── Enterprise ID banner — admin only ────────────────────────────── */}
        {me?.role === 'admin' && (
          <div className="glass-card rounded-2xl p-5 border border-primary/20 bg-primary/5">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Your Enterprise ID</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Share this ID with team members so they can link their account to your workspace during sign-up.
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono dark:text-white break-all">
                {me.id}
              </code>
              <button
                onClick={copyEnterpriseId}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
              >
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold dark:text-white">{users.length} Individuals</h3>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {users.map((u, i) => {
              const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase();
              const COLORS = ['#939BFF', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];
              const color  = COLORS[i % COLORS.length];
              const isSelf = u.id === me?.id;
              const rs     = roleStyle[u.role] || roleStyle['member'];
              return (
                <motion.div key={u.id}
                  initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ background: color }}>{initials}</div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">
                        {u.first_name} {u.last_name}
                        {isSelf && <span className="text-[10px] ml-1.5 text-primary font-semibold">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-lg  ${rs.text}`}>
  {u.role === 'admin' ? 'Enterprise' : u.role === 'member' ? 'Individual' : u.role.replace('_', ' ')}
</span>
                    {!isSelf && (
                      <>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                          Remove
                        </button>
                      </>
                    )}
                    {isSelf && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">Can't edit own role</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
