import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import {
  Package, Plus, Search, MoreVertical, Edit2, Trash2,
  Monitor, Cpu, HardDrive, Smartphone, CheckCircle,
  Clock, AlertCircle, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext';

const TYPES    = ['Hardware', 'Software', 'Furniture', 'Other'];
const STATUSES = ['Available', 'In Use', 'Under Repair', 'Retired'];

const statusStyle = {
  Available: 'text-emerald-500 bg-emerald-500/10',
  'In Use':  'text-blue-500   bg-blue-500/10',
  'Under Repair':'text-amber-500 bg-amber-500/10',
  Retired:   'text-slate-500  bg-slate-500/10',
};

const getIcon = (type) => {
  switch (type) {
    case 'Hardware':  return <Monitor   size={18} />;
    case 'Software':  return <Cpu       size={18} />;
    case 'Furniture': return <Package   size={18} />;
    default:          return <HardDrive size={18} />;
  }
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const empty = { name: '', type: 'Hardware', serial_no: '', status: 'Available', assigned_to: '', purchase_date: '', value: '' };

export default function AssetManagement() {
  const { symbol } = useCurrency();
  const [assets,      setAssets]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType,  setFilterType]  = useState('All');
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState(empty);
  const [editing,     setEditing]     = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(null);
  const menuRef = useRef(null);
  const toast = useToast();

  // ── Load assets from backend → GET /api/assets
  const load = () =>
    api.get('/api/assets')
      .then(res => setAssets(res.data))
      .catch(err => console.error('Load assets error:', err));

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCreate = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit   = (asset) => {
    setForm({
      name:          asset.name,
      type:          asset.type,
      serial_no:     asset.serial_no || '',
      status:        asset.status,
      assigned_to:   asset.assigned_to || '',
      purchase_date: asset.purchase_date?.slice(0, 10) || '',
      value:         asset.value || '',
    });
    setEditing(asset.id);
    setModal(true);
    setMenuOpen(null);
  };

  // ── Create → POST /api/assets
  // ── Update → PUT  /api/assets/:id
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/assets/${editing}`, form);
        toast.success('Asset updated!');
      } else {
        await api.post('/api/assets', form);
        toast.success('Asset added!');
      }
      await load();
      setModal(false);
    } catch (err) {
      console.error('Save asset error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete → DELETE /api/assets/:id
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset?')) return;
    try {
      await api.delete(`/api/assets/${id}`);
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success('Asset deleted');
    } catch (err) {
      console.error('Delete asset error:', err);
    }
    setMenuOpen(null);
  };

  const filtered = assets.filter(a => {
    const matchSearch = a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (a.serial_no || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchType   = filterType === 'All' || a.type === filterType;
    return matchSearch && matchType;
  });

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full space-y-6 px-2">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Asset Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage company physical and digital assets.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Add New Asset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Assets', value: assets.length,                                   icon: Package,      color: '#939BFF' },
            { label: 'Available',    value: assets.filter(a => a.status === 'Available').length, icon: CheckCircle, color: '#10b981' },
            { label: 'Under Repair', value: assets.filter(a => a.status === 'Under Repair').length, icon: Clock,       color: '#f59e0b' },
            { label: 'Retired',      value: assets.filter(a => a.status === 'Retired').length,   icon: AlertCircle, color: '#ef4444' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }}
              className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}18`, color: s.color }}>
                <s.icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-white/5">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or serial number…"
              className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
            />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="input-field text-sm">
            <option value="All">All Types</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Asset', 'Type', 'Serial No.', 'Status', 'Assigned To', 'Purchase Date', 'Value', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset, i) => (
                  <motion.tr key={asset.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getIcon(asset.type)}
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white">{asset.name}</p>
                          <p className="text-xs text-slate-400">{asset.description || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{asset.type}</td>
                    <td className="px-5 py-4">
                      <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-300">
                        {asset.serial_no || '—'}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle[asset.status] || statusStyle['Available']}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current" />{asset.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{asset.assigned_to || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{fmtDate(asset.purchase_date)}</td>
                    <td className="px-5 py-4 text-sm font-bold dark:text-white">
                      {asset.value ? `${symbol}${Number(asset.value).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-5 py-4 relative">
                      <button onClick={() => setMenuOpen(menuOpen === asset.id ? null : asset.id)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {menuOpen === asset.id && (
                          <motion.div ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-4 top-10 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[130px]">
                            <button onClick={() => openEdit(asset)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                              <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => handleDelete(asset.id)}
                              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                              <Trash2 size={14} /> Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">{editing ? 'Edit Asset' : 'Add New Asset'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Asset Name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field w-full text-sm" placeholder="e.g. MacBook Pro 14" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-field w-full text-sm">
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field w-full text-sm">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Serial Number</label>
                  <input value={form.serial_no} onChange={e => setForm(p => ({ ...p, serial_no: e.target.value }))}
                    className="input-field w-full text-sm" placeholder="e.g. SN-2024-001" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Assigned To</label>
                  <input value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))}
                    className="input-field w-full text-sm" placeholder="Employee name" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Purchase Date</label>
                    <input type="date" value={form.purchase_date} onChange={e => setForm(p => ({ ...p, purchase_date: e.target.value }))}
                      className="input-field w-full text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{`Value (${symbol})`}</label>
                    <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                      className="input-field w-full text-sm" placeholder="0.00" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Asset'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}