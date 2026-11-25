import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderTree, Trash2, X } from 'lucide-react';
import { api } from '../../utils/api';

const COLORS  = ['#939BFF','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#ec4899'];
const empty   = { name: '', color: '#939BFF' };

export default function KBCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(empty);
  const [saving,     setSaving]     = useState(false);

  const load = () => api.get('/api/knowledge/categories').then(r => setCategories(r.data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/api/knowledge/categories', form); await load(); setModal(false); setForm(empty); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Articles in it will become uncategorised.')) return;
    await api.delete(`/api/knowledge/categories/${id}`); await load();
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">KB Categories</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage article categories used in the Knowledge Base.</p>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16}/>New Category</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={cat.id}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
              whileHover={{ y:-3 }}
              className="glass-card p-5 rounded-2xl flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:`${cat.color}18`, color:cat.color }}>
                  <FolderTree size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">{cat.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.article_count} article{cat.article_count !== '1' ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(cat.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 size={15} />
              </button>
            </motion.div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-2 text-center py-16 text-slate-400">
              <FolderTree size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No categories yet. Create one to organise your articles.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95,opacity:0 }} animate={{ scale:1,opacity:1 }} exit={{ scale:0.95,opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-bold dark:text-white">New Category</h2>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={18}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Category Name *</label>
                  <input required value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} className="input-field w-full text-sm" placeholder="e.g. Troubleshooting"/>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p=>({...p,color:c}))}
                        className={`w-7 h-7 rounded-lg transition-transform ${form.color===c?'scale-125 ring-2 ring-offset-2 ring-slate-400':''}`}
                        style={{ background:c }}/>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModal(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary text-sm disabled:opacity-60">{saving?'Creating…':'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
