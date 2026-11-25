import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import {
  Tag, Trash2, Copy, Plus, Search, CheckCircle,
  Building2, ShieldCheck, Percent, Calendar, X, Clock, KeyRound, BadgeCheck,
} from 'lucide-react';

const daysLeft = (trialEndAt) => {
  if (!trialEndAt) return null;
  const diff = new Date(trialEndAt) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const kycStyle = {
  APPROVED: 'bg-emerald-500/10 text-emerald-600',
  PENDING:  'bg-amber-500/10 text-amber-600',
  REJECTED: 'bg-rose-500/10 text-rose-500',
};

const DISCOUNT_TIERS = [10, 20, 30];

const statusStyle = {
  ACTIVE:  'bg-emerald-500/10 text-emerald-500',
  USED:    'bg-slate-200/60 dark:bg-slate-700/40 text-slate-500',
  EXPIRED: 'bg-rose-500/10 text-rose-500',
};

const subStyle = {
  TRIAL:     'bg-amber-500/10 text-amber-600',
  ACTIVE:    'bg-emerald-500/10 text-emerald-500',
  EXPIRED:   'bg-rose-500/10 text-rose-500',
  SUSPENDED: 'bg-slate-200/60 text-slate-500',
};

export default function Coupons() {
  const toast = useToast();

  /* ── Coupon state ── */
  const [coupons,     setCoupons]     = useState([]);
  const [couponLoad,  setCouponLoad]  = useState(true);
  const [discountPct, setDiscountPct] = useState(10);
  const [expiresAt,   setExpiresAt]   = useState('');
  const [targetEnt,   setTargetEnt]   = useState('');
  const [creating,    setCreating]    = useState(false);

  /* ── Enterprise override state ── */
  const [enterprises, setEnterprises] = useState([]);
  const [entLoad,     setEntLoad]     = useState(false);
  const [search,      setSearch]      = useState('');
  const [overrideEnt, setOverrideEnt] = useState(null);
  const [overrideTier,setOverrideTier]= useState(10);
  const [overriding,  setOverriding]  = useState(false);

  /* ── Load coupons ── */
  const loadCoupons = () =>
    api.get('/api/superadmin/coupons')
      .then(r => setCoupons(r.data || []))
      .catch(() => {})
      .finally(() => setCouponLoad(false));

  useEffect(() => { loadCoupons(); }, []);

  /* ── Load enterprises (debounced on search) ── */
  useEffect(() => {
    const t = setTimeout(() => {
      setEntLoad(true);
      api.get(`/api/superadmin/enterprises${search ? `?search=${encodeURIComponent(search)}` : ''}`)
        .then(r => setEnterprises(r.data || []))
        .catch(() => {})
        .finally(() => setEntLoad(false));
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Create coupon ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post('/api/superadmin/coupons', {
        discount_pct:  discountPct,
        enterprise_id: targetEnt || undefined,
        expires_at:    expiresAt  || undefined,
      });
      setCoupons(prev => [res.data, ...prev]);
      setExpiresAt('');
      setTargetEnt('');
      toast.success(`Coupon ${res.data.code} created (${discountPct}% off)`);
    } catch (err) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setCreating(false);
    }
  };

  /* ── Delete coupon ── */
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon ${code}?`)) return;
    try {
      await api.delete(`/api/superadmin/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('Coupon deleted');
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  /* ── Copy code ── */
  const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => toast.success('Copied!'));
  };

  /* ── Override ── */
  const handleOverride = async () => {
    if (!overrideEnt) return;
    setOverriding(true);
    try {
      const res = await api.post(`/api/superadmin/enterprises/${overrideEnt.id}/override`, {
        discount_tier: overrideTier,
      });
      setEnterprises(prev => prev.map(e => e.id === overrideEnt.id ? res.data : e));
      toast.success(`${overrideEnt.company_name} → ACTIVE (${overrideTier}% discount)`);
      setOverrideEnt(null);
    } catch (err) {
      toast.error(err.message || 'Override failed');
    } finally {
      setOverriding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Coupons & Overrides</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Generate discount coupons and manually activate enterprise subscriptions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── LEFT: Coupon generator + list ── */}
          <div className="space-y-6">

            {/* Generator */}
            <div className="glass-card p-6 rounded-2xl">
              <h2 className="text-base font-bold dark:text-white mb-5 flex items-center gap-2">
                <Tag size={16} className="text-primary" /> Generate Coupon
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">

                {/* Discount tier */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Tier</p>
                  <div className="flex gap-3">
                    {DISCOUNT_TIERS.map(pct => (
                      <button
                        key={pct} type="button"
                        onClick={() => setDiscountPct(pct)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          discountPct === pct
                            ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-primary hover:text-primary'
                        }`}
                      >
                        <Percent size={12} className="inline mr-1" />{pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional expiry */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Expiry Date <span className="font-normal normal-case text-slate-300">(optional)</span>
                  </label>
                  <div className="relative">
                    <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                      className="input-field pl-9 text-sm" />
                  </div>
                </div>

                {/* Optional: lock to enterprise */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Assign to Enterprise <span className="font-normal normal-case text-slate-300">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Enterprise ID or leave blank"
                      value={targetEnt} onChange={e => setTargetEnt(e.target.value)}
                      className="input-field pl-9 text-sm" />
                  </div>
                </div>

                <button type="submit" disabled={creating}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
                  {creating
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating…</>
                    : <><Plus size={16} /> Generate {discountPct}% Coupon</>
                  }
                </button>
              </form>
            </div>

            {/* Coupon list */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold dark:text-white">Active Offers</h2>
                <p className="text-xs text-slate-400 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} total</p>
              </div>

              {couponLoad ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Tag size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">No coupons yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {coupons.map((c, i) => (
                    <motion.div key={c.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Percent size={15} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold dark:text-white font-mono tracking-wide">{c.code}</p>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusStyle[c.status] || ''}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {c.discount_pct}% off
                          {c.enterprise_name ? ` · ${c.enterprise_name}` : ''}
                          {c.expires_at ? ` · Expires ${new Date(c.expires_at).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => copyCode(c.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.code)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Enterprise override ── */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-base font-bold dark:text-white flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-500" /> Manual Override
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Force an enterprise's subscription to ACTIVE with a discount tier.
                </p>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-white/5">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by company name or email…"
                    className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
                  {search && (
                    <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Enterprise list */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                {entLoad ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : enterprises.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Building2 size={24} className="mb-2 opacity-40" />
                    <p className="text-sm">{search ? 'No results found.' : 'No enterprises registered yet.'}</p>
                  </div>
                ) : enterprises.map((ent, i) => (
                  <motion.div key={ent.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors ${
                      overrideEnt?.id === ent.id
                        ? 'bg-primary/5 border-l-2 border-primary'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                    }`}
                    onClick={() => setOverrideEnt(ent.id === overrideEnt?.id ? null : ent)}
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-sm font-bold dark:text-white">
                      {(ent.company_name || ent.first_name || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold dark:text-white truncate">
                        {ent.company_name || ent.first_name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{ent.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${subStyle[ent.subscription_status] || ''}`}>
                        {ent.subscription_status}
                      </span>
                      {ent.subscription_status === 'TRIAL' && ent.trial_end_at && (
                        <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${daysLeft(ent.trial_end_at) <= 2 ? 'text-rose-500' : 'text-slate-400'}`}>
                          <Clock size={10} />
                          {daysLeft(ent.trial_end_at)}d left
                        </span>
                      )}
                      {ent.discount_tier && (
                        <span className="text-[10px] text-slate-400">{ent.discount_tier}% disc.</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Override panel — shown when an enterprise is selected */}
              <AnimatePresence>
                {overrideEnt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold dark:text-white">
                          Override: <span className="text-primary">{overrideEnt.company_name || overrideEnt.first_name}</span>
                        </p>
                        <button onClick={() => setOverrideEnt(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={16} />
                        </button>
                      </div>

                      {/* Info grid: referral code + trial + KYC */}
                      <div className="grid grid-cols-1 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                        {/* Referral code */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <KeyRound size={12} /> Referral Code
                          </span>
                          {overrideEnt.referral_code ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold font-mono dark:text-white tracking-wider">{overrideEnt.referral_code}</span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(overrideEnt.referral_code); toast.success('Copied!'); }}
                                className="p-1 rounded text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          ) : <span className="text-xs text-slate-400 italic">—</span>}
                        </div>

                        {/* Trial period */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock size={12} /> Trial Period
                          </span>
                          <span className="text-xs font-semibold dark:text-white">
                            {overrideEnt.trial_end_at ? (
                              <>
                                {new Date(overrideEnt.trial_start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {' → '}
                                {new Date(overrideEnt.trial_end_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                  daysLeft(overrideEnt.trial_end_at) <= 2 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-600'
                                }`}>
                                  {daysLeft(overrideEnt.trial_end_at)}d left
                                </span>
                              </>
                            ) : <span className="text-slate-400 italic text-xs">No trial set</span>}
                          </span>
                        </div>

                        {/* KYC status */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-slate-500">
                            <BadgeCheck size={12} /> KYC Status
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${kycStyle[overrideEnt.kyc_status] || 'text-slate-400'}`}>
                            {overrideEnt.kyc_status || '—'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Discount Tier</p>
                        <div className="flex gap-2">
                          {DISCOUNT_TIERS.map(pct => (
                            <button key={pct} type="button"
                              onClick={() => setOverrideTier(pct)}
                              className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                                overrideTier === pct
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30'
                                  : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-500 hover:text-emerald-500'
                              }`}>
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <button onClick={handleOverride} disabled={overriding}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                        {overriding
                          ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying…</>
                          : <><CheckCircle size={16} /> Force ACTIVE — {overrideTier}% Discount</>
                        }
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
