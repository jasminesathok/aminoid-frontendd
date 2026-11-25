import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, User, MoreVertical, Pencil, Trash2, X, Mail, Phone } from 'lucide-react';
import { api } from '../../utils/api';

const empty = { name:'', email:'', phone:'', title:'', account_id:'', status:'Active' };

export default function Contacts() {
  const [contacts,  setContacts]  = useState([]);
  const [accounts,  setAccounts]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(empty);
  const [editing,   setEditing]   = useState(null);
  const [menuOpen,  setMenuOpen]  = useState(null);
  const [saving,    setSaving]    = useState(false);
  const menuRef = useRef(null);

  const load = async () => {
    const [c, a] = await Promise.all([api.get('/api/sales/contacts'), api.get('/api/sales/accounts')]);
    setContacts(c.data); setAccounts(a.data);
  };
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openCreate = () => { setForm(empty); setEditing(null); setModal(true); };
  const openEdit   = (c) => { setForm({ name:c.name, email:c.email, phone:c.phone||'', title:c.title||'', account_id:c.account_id||'', status:c.status }); setEditing(c.id); setModal(true); setMenuOpen(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      editing ? await api.put(`/api/sales/contacts/${editing}`, form)
              : await api.post('/api/sales/contacts', form);
      await load(); setModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    await api.delete(`/api/sales/contacts/${id}`); setMenuOpen(null); await load();
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const AVATAR_COLORS = ['#939BFF','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6'];

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Contacts</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">All CRM contacts linked to your accounts.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} />Add Contact</button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-xl w-72">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c, i) => {
            const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const initials = c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
            return (
              <motion.div key={c.id}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y:-3 }}
                className="glass-card p-5 rounded-2xl relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: color }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold dark:text-white">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.title || '—'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Mail size={12} className="shrink-0" />{c.email}
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Phone size={12} className="shrink-0" />{c.phone}
                    </div>
                  )}
                  {c.account_name && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">{c.account_name}</span>
                    </div>
                  )}
                </div>
                <div className={`absolute top-4 left-0 w-1 h-8 rounded-r-full ${c.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <User size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No contacts found.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.95,opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">{editing ? 'Edit Contact' : 'New Contact'}</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {[
                  { label:'Full Name *', key:'name', required:true, placeholder:'e.g. Emily Carter' },
                  { label:'Email *',     key:'email', required:true, placeholder:'email@company.com', type:'email' },
                  { label:'Phone',       key:'phone', placeholder:'+1 415 555 0100' },
                  { label:'Job Title',   key:'title', placeholder:'e.g. CTO' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{f.label}</label>
                    <input required={f.required} type={f.type||'text'} value={form[f.key]}
                      onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                      className="input-field w-full text-sm" placeholder={f.placeholder} />
                  </div>
                ))}
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Account</label>
                  <select value={form.account_id} onChange={e => setForm(p => ({...p, account_id:e.target.value}))} className="input-field w-full text-sm">
                    <option value="">— None —</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">
                    {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Contact'}
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
