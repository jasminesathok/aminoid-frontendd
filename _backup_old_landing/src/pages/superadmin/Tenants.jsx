import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Building2, Users, Search, Filter, Home, Clock, ChevronRight, ShieldCheck, Activity } from 'lucide-react';
import { api } from '../../utils/api';

// Derive a display-friendly avatar colour from the tenant's name
const AVATAR_COLOURS = [
  'bg-indigo-500/10 text-indigo-400',
  'bg-emerald-500/10 text-emerald-400',
  'bg-amber-500/10 text-amber-400',
  'bg-rose-500/10 text-rose-400',
  'bg-blue-500/10 text-blue-400',
  'bg-purple-500/10 text-purple-400',
  'bg-teal-500/10 text-teal-400',
];
const avatarColour = (name = '') =>
  AVATAR_COLOURS[(name.charCodeAt(0) || 0) % AVATAR_COLOURS.length];

// Map subscription_status → display label
const statusLabel = (raw = '') => {
  const s = raw.toUpperCase();
  if (s === 'ACTIVE')   return 'Active';
  if (s === 'TRIALING') return 'Trialing';
  if (s === 'SUSPENDED' || s === 'CANCELED') return 'Suspended';
  return raw || 'Unknown';
};

export default function Tenants() {
  const [tenants,    setTenants]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');

  // Debounce search so we don't hammer the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const load = useCallback(() => {
    setLoading(true);
    const url = debouncedQ
      ? `/api/superadmin/enterprises?search=${encodeURIComponent(debouncedQ)}`
      : '/api/superadmin/enterprises';
    api.get(url, { silent: true })
      .then(res => setTenants(res.data || []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, [debouncedQ]);

  useEffect(() => { load(); }, [load]);

  // Derive KPIs from live data
  const totalTenants  = tenants.length;
  const activeCount   = tenants.filter(t => t.subscription_status?.toUpperCase() === 'ACTIVE').length;
  const kpis = [
    { label: 'Total Tenants',             value: totalTenants,             color: '#939BFF', icon: Building2 },
    { label: 'Active Subscriptions',      value: activeCount,              color: '#10b981', icon: ShieldCheck },
    { label: 'Trialing',
      value: tenants.filter(t => t.subscription_status?.toUpperCase() === 'TRIALING').length,
      color: '#f59e0b', icon: Clock },
    { label: 'Suspended',
      value: tenants.filter(t => ['SUSPENDED','CANCELED'].includes(t.subscription_status?.toUpperCase())).length,
      color: '#ef4444', icon: Activity },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':    return 'text-emerald-500';
      case 'Trialing':  return 'text-amber-500';
      case 'Suspended': return 'text-rose-500';
      default:          return 'text-slate-500';
    }
  };

  const getActionText  = (status) => status === 'Suspended' ? 'Activate' : 'Suspend';
  const getActionColor = (status) => status === 'Suspended'
    ? 'text-emerald-500 hover:text-emerald-400'
    : 'text-rose-500 hover:text-rose-400';

  // Override (suspend / activate) a tenant
  const handleToggle = async (tenant) => {
    const isSuspended = statusLabel(tenant.subscription_status) === 'Suspended';
    try {
      await api.post(`/api/superadmin/enterprises/${tenant.id}/override`, {
        discount_tier: tenant.discount_tier || null,
        subscription_status: isSuspended ? 'ACTIVE' : 'SUSPENDED',
      });
      await load();
    } catch {
      // api.js already shows error toast
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Tenants Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage workspaces, subscriptions, and tenant access.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl input-field text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#131c2e]/90 border border-slate-200 dark:border-[#1e2d45]/80 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1e2d45]/50 transition-colors shrink-0 shadow-sm">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k, i) => (
            <motion.div key={i} whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${k.color}18`, color: k.color }}>
                <k.icon size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{k.label}</p>
                <p className="text-2xl font-bold dark:text-white mt-0.5">{k.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-20 animate-pulse" />
            <p>Loading tenants…</p>
          </div>
        )}

        {/* Card Grid */}
        {!loading && tenants.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tenants.map((tenant, i) => {
              const name   = tenant.company_name || `${tenant.first_name} ${tenant.last_name}`.trim() || 'Unknown';
              const status = statusLabel(tenant.subscription_status);
              const joined = tenant.created_at
                ? new Date(tenant.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '—';
              const plan = tenant.discount_tier > 0 ? `${tenant.discount_tier}% Discount` : (tenant.subscription_status || 'Free');

              return (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-[20px] p-6 flex flex-col group"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-lg uppercase ${avatarColour(name)}`}>
                        {name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg leading-tight">{name}</h3>
                        <p className="text-slate-500 dark:text-slate-500 text-sm">{tenant.email}</p>
                      </div>
                    </div>
                    <span className="px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 text-xs font-semibold shrink-0">
                      {plan}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 pb-8 mb-6 border-b border-slate-100 dark:border-white/5">
                    <div className="text-center">
                      <p className="text-slate-400 dark:text-slate-500 text-xs mb-1">KYC</p>
                      <p className="text-slate-900 dark:text-slate-200 font-bold text-base capitalize">
                        {tenant.kyc_status || '—'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 dark:text-slate-500 text-xs mb-1">Discount</p>
                      <p className="text-slate-900 dark:text-slate-200 font-bold text-base">
                        {tenant.discount_tier ? `${tenant.discount_tier}%` : 'None'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 dark:text-slate-500 text-xs mb-1">Status</p>
                      <p className={`font-bold text-base ${getStatusColor(status)}`}>
                        {status}
                      </p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                      <Home size={16} className="shrink-0" />
                      <span>{name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                      <Clock size={16} className="shrink-0" />
                      <span>Joined {joined}</span>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-end mt-auto pt-2">
                    <button
                      onClick={() => handleToggle(tenant)}
                      className={`text-sm font-bold transition-colors ${getActionColor(status)}`}
                    >
                      {getActionText(status)}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && tenants.length === 0 && (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
            <p>No tenants found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}