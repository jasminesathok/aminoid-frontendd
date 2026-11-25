import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, DollarSign, MoreVertical, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

const STAGES = ['Prospecting','Qualification','Proposal','Negotiation','Closed Won','Closed Lost'];
const filters = ['All', ...STAGES];
const empty   = { name:'', account_id:'', stage:'Prospecting', value:'', owner:'', close_date:'', probability:'0' };

const stageStyle = {
  Prospecting:   { bg:'bg-violet-500/10', text:'text-violet-500',  dot:'bg-violet-500' },
  Qualification: { bg:'bg-amber-500/10',  text:'text-amber-600',   dot:'bg-amber-500' },
  Proposal:      { bg:'bg-blue-500/10',   text:'text-blue-500',    dot:'bg-blue-500' },
  Negotiation:   { bg:'bg-purple-500/10', text:'text-purple-500',  dot:'bg-purple-500' },
  'Closed Won':  { bg:'bg-emerald-500/10',text:'text-emerald-600', dot:'bg-emerald-500' },
  'Closed Lost': { bg:'bg-rose-500/10',   text:'text-rose-500',    dot:'bg-rose-500' },
};

export default function Deals() {
  const { symbol } = useCurrency();
  const [deals,    setDeals]    = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tab,      setTab]      = useState('All');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(empty);
  const [editing,  setEditing]  = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [saving,   setSaving]   = useState(false);
  const menuRef = useRef(null);
  

  const load = async () => {
    const [d, a] = await Promise.all([api.get('/api/sales/deals'), api.get('/api/sales/accounts')]);
    setDeals(d.data); setAccounts(a.data);
  };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openCreate = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit   = (d) => { setForm({ name:d.name, account_id:d.account_id||'', stage:d.stage, value:d.value, owner:d.owner||'', close_date:d.close_date?.split('T')[0]||'', probability:String(d.probability) }); setEditing(d.id); setModal(true); setMenuOpen(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editing ? await api.put(`/api/sales/deals/${editing}`, form)
              : await api.post('/api/sales/deals', form);
      await load(); setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    await api.delete(`/api/sales/deals/${id}`); setMenuOpen(null); await load();
  };

  const filtered = deals.filter(d =>
    (tab === 'All' || d.stage === tab) && d.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filtered.reduce((s, d) => s + Number(d.value), 0);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Deals</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage your sales pipeline deals.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} />New Deal</button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex gap-2 flex-wrap">
              {filters.map(f => (
                <button key={f} onClick={() => setTab(f)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${tab === f ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'}`}>{f}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">{filtered.length} deals · <span className="font-bold text-slate-700 dark:text-slate-200">${totalValue.toLocaleString()}</span></span>
              <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-52 border border-white/5">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals..."
                  className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Deal','Account','Stage','Value','Owner','Close Date','Probability',''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => {
                  const st = stageStyle[d.stage] || stageStyle['Prospecting'];
                  return (
                    <motion.tr key={d.id}
                      initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <DollarSign size={14} />
                          </div>
                          <p className="text-sm font-bold dark:text-white whitespace-nowrap">{d.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{d.account_name || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{d.stage}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold dark:text-white">${Number(d.value).toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{d.owner || '—'}</td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{d.close_date ? new Date(d.close_date).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full w-16 overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${d.probability}%` }} />
                          </div>
                          <span className="text-xs text-slate-400">{d.probability}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 relative">
                        <button onClick={() => setMenuOpen(menuOpen === d.id ? null : d.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                          <MoreVertical size={16} />
                        </button>
                        <AnimatePresence>
                          {menuOpen === d.id && (
                            <motion.div ref={menuRef} initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0,scale:0.95 }}
                              className="absolute right-4 top-10 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden min-w-[130px]">
                              <button onClick={() => openEdit(d)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"><Pencil size={14} />Edit</button>
                              <button onClick={() => handleDelete(d.id)} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"><Trash2 size={14} />Delete</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400 text-sm">No deals found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.95,opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">{editing ? 'Edit Deal' : 'New Deal'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Deal Name *</label>
                    <input required value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="input-field w-full text-sm" placeholder="e.g. Enterprise License Q3"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Account</label>
                    <select value={form.account_id} onChange={e => setForm(p=>({...p,account_id:e.target.value}))} className="input-field w-full text-sm">
                      <option value="">— None —</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Stage</label>
                    <select value={form.stage} onChange={e => setForm(p=>({...p,stage:e.target.value}))} className="input-field w-full text-sm">
                      {STAGES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{`Value (${symbol})`}</label>
                    <input type="number" min="0" value={form.value} onChange={e => setForm(p=>({...p,value:e.target.value}))} className="input-field w-full text-sm" placeholder="0"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Probability (%)</label>
                    <input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(p=>({...p,probability:e.target.value}))} className="input-field w-full text-sm"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Owner</label>
                    <input value={form.owner} onChange={e => setForm(p=>({...p,owner:e.target.value}))} className="input-field w-full text-sm" placeholder="e.g. Sarah Chen"/>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Close Date</label>
                    <input type="date" value={form.close_date} onChange={e => setForm(p=>({...p,close_date:e.target.value}))} className="input-field w-full text-sm"/>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Deal'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
