import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreVertical, Megaphone, TrendingUp, DollarSign, X, Pencil, Trash2 } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';

const PALETTE = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor = (i) => PALETTE[i % PALETTE.length];

const statusStyle = {
  Active:   { bg:'bg-emerald-500/10', text:'text-emerald-500', dot:'bg-emerald-500' },
  Paused:   { bg:'bg-amber-500/10',   text:'text-amber-600',   dot:'bg-amber-500'   },
  Ended:    { bg:'bg-blue-500/10',    text:'text-blue-500',    dot:'bg-blue-500'    },
  Planning: { bg:'bg-slate-200/60 dark:bg-slate-700/40', text:'text-slate-500', dot:'bg-slate-400' },
};

const CHANNELS  = ['Email','Social','Display','Search','Mixed','Other'];
const STATUSES  = ['Planning','Active','Paused','Ended'];
const filters   = ['All','Active','Paused','Ended','Planning'];
const emptyForm = { name:'', channel:'Email', budget:'', status:'Planning' };

export default function Campaigns() {
  const { symbol } = useCurrency();
  const [campaigns, setCampaigns] = useState([]);
  const [tab,       setTab]       = useState('All');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(emptyForm);
  const [editing,   setEditing]   = useState(null);
  const [menuOpen,  setMenuOpen]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const menuRef = useRef(null);

  const load = () => api.get('/api/marketing/campaigns').then(res => setCampaigns(res.data));

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal(true); };
  const openEdit   = (c) => { setForm({ name: c.name, channel: c.channel, budget: c.budget, status: c.status }); setEditing(c.id); setModal(true); setMenuOpen(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/marketing/campaigns/${editing}`, form);
      } else {
        await api.post('/api/marketing/campaigns', form);
      }
      await load();
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    await api.delete(`/api/marketing/campaigns/${id}`);
    setMenuOpen(null);
    await load();
  };

  const filtered    = campaigns.filter(c =>
    (tab === 'All' || c.status === tab) &&
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const totalBudget = campaigns.reduce((s, c) => s + Number(c.budget), 0);
  const totalSpent  = campaigns.reduce((s, c) => s + Number(c.spent), 0);
  const active      = campaigns.filter(c => c.status === 'Active').length;

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Campaigns</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track all your marketing campaigns.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16}/> New Campaign</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label:'Active Campaigns', value: active,                           color:'#10b981', icon: Megaphone  },
            { label:'Total Budget', value: symbol+totalBudget.toLocaleString(), color:'#939BFF', icon: DollarSign },
{ label:'Total Spent',  value: symbol+totalSpent.toLocaleString(),  color:'#C4B5F4', icon: TrendingUp  },
          ].map((c,i) => (
            <motion.div key={i} whileHover={{ y:-4 }} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${c.color}18`, color:c.color }}>
                <c.icon size={22}/>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">{c.label}</p>
                <p className="text-xl font-bold dark:text-white">{c.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button key={f} onClick={() => setTab(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${tab === f ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'}`}>{f}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-56 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..."
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Campaign','Channel','Budget','Spent','Leads','Conversions','Status',''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const st       = statusStyle[c.status] || statusStyle['Planning'];
                  const color    = getColor(i);
                  const spentPct = c.budget > 0 ? Math.round((c.spent / c.budget) * 100) : 0;
                  return (
                    <motion.tr key={c.id}
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${color}18`, color }}>
                            <Megaphone size={14}/>
                          </div>
                          <p className="text-sm font-bold dark:text-white whitespace-nowrap">{c.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{c.channel}</td>
                      <td className="px-5 py-4 text-sm font-semibold dark:text-white">{symbol}{Number(c.budget).toLocaleString()}</td>
                      <td className="px-5 py-4 min-w-32">
                       <p className="text-sm font-semibold dark:text-white mb-1">{symbol}{Number(c.spent).toLocaleString()}</p>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-24 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${spentPct}%`, background:color }}/>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm dark:text-slate-300">{c.leads}</td>
                      <td className="px-5 py-4 text-sm dark:text-slate-300">{c.conversions}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 relative">
                        <button onClick={() => setMenuOpen(menuOpen === c.id ? null : c.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical size={16}/>
                        </button>
                        <AnimatePresence>
                          {menuOpen === c.id && (
                            <motion.div ref={menuRef} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
                              className="absolute right-4 top-10 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[130px]">
                              <button onClick={() => openEdit(c)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                                <Pencil size={14}/> Edit
                              </button>
                              <button onClick={() => handleDelete(c.id)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                <Trash2 size={14}/> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">No campaigns found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">{editing ? 'Edit Campaign' : 'New Campaign'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Campaign Name *</label>
                  <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    className="input-field w-full text-sm" placeholder="e.g. Summer Sale 2026" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Channel</label>
                  <select value={form.channel} onChange={e => setForm(p => ({...p, channel: e.target.value}))} className="input-field w-full text-sm">
                    {CHANNELS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{`Budget (${symbol})`}</label>
                  <input type="number" min="0" step="0.01" value={form.budget} onChange={e => setForm(p => ({...p, budget: e.target.value}))}
                    className="input-field w-full text-sm" placeholder="0.00" />
                </div>
                {editing && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="input-field w-full text-sm">
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Campaign'}
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
