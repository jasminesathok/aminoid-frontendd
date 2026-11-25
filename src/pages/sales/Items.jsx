import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Box, Eye, Pencil, Trash2, X, Tag, Package } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';

export default function Items() {
  const { symbol } = useCurrency();
  const [items,    setItems]    = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [deleting, setDeleting] = useState(null);
const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState({ name:'', description:'', rate:0, unit:'pcs', category:'', tax_rate:0, code:'' });

  const loadData = async () => {
    try {
      const res = await api.get('/api/sales/items');
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/sales/items', form);
      loadData();
      setModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
  if (!window.confirm('Delete this item?')) return;
  setDeleting(id);
  try {
    await api.delete('/api/sales/items/' + id);
    setItems(prev => prev.filter(x => x.id !== id));
  } catch (err) { console.error(err); }
  finally { setDeleting(null); }
};

const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    await api.put('/api/sales/items/' + editing.id, form);
    await loadData();
    setEditing(null);
  } catch (err) { console.error(err); }
};

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || (i.category && i.category.toLowerCase().includes(search.toLowerCase())));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Items</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your product and service catalog.</p>
          </div>
          <button onClick={async () => {
  try {
    const res = await api.get('/api/sales/items/generate-code');
    setForm({ name:'', description:'', rate:0, unit:'pcs', category:'', tax_rate:0, code: res.data.data.code });
  } catch (err) {
    setForm({ name:'', description:'', rate:0, unit:'pcs', category:'', tax_rate:0, code: '' });
  }
  setModal(true);
}} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Item
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search items..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Item Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Tax %</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                          <Package size={16}/>
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-slate-200">{item.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{item.code ? `${item.code} • ` : ''}{item.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">{symbol}{Number(item.rate).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 uppercase">{item.unit}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.tax_rate}%</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
  onClick={() => { setEditing(item); setForm({ name: item.name, description: item.description || '', rate: item.rate, unit: item.unit, category: item.category || '', tax_rate: item.tax_rate, code: item.code || '' }); }}
  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
<button
  onClick={() => handleDelete(item.id)}
  disabled={deleting === item.id}
  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold dark:text-white">New Item</h2>
                <button onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Item Code</label>
                    <input required value={form.code} onChange={e => setForm({...form, code:e.target.value})} className="input-field w-full" placeholder="E.g. ITM-123456"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Item Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field w-full" placeholder="E.g. Cloud Storage"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} className="input-field w-full h-20" placeholder="Product or service description..."/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{`Rate (${symbol})`}</label>
                    <input type="number" required value={form.rate} onChange={e => setForm({...form, rate:e.target.value})} className="input-field w-full"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Unit</label>
                    <input value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} className="input-field w-full" placeholder="E.g. pcs, hr, mo"/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Category</label>
                    <input value={form.category} onChange={e => setForm({...form, category:e.target.value})} className="input-field w-full" placeholder="E.g. Cloud, Service"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Tax Rate (%)</label>
                    <input type="number" value={form.tax_rate} onChange={e => setForm({...form, tax_rate:e.target.value})} className="input-field w-full"/>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm font-bold shadow-lg shadow-primary/20">Add Item</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
<AnimatePresence>
  {editing && (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setEditing(null)}>
      <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">Edit Item</h2>
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
        </div>
        <form onSubmit={handleUpdate} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Item Code</label>
              <input required value={form.code} onChange={e => setForm({...form, code:e.target.value})} className="input-field w-full" placeholder="E.g. ITM-123456"/>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Item Name</label>
              <input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} className="input-field w-full" placeholder="E.g. Cloud Storage"/>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} className="input-field w-full h-20" placeholder="Product or service description..."/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
             <label className="text-sm font-bold text-slate-600 dark:text-slate-400">{`Rate (${symbol})`}</label>
              <input type="number" required value={form.rate} onChange={e => setForm({...form, rate:e.target.value})} className="input-field w-full"/>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Unit</label>
              <input value={form.unit} onChange={e => setForm({...form, unit:e.target.value})} className="input-field w-full" placeholder="E.g. pcs, hr, mo"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Category</label>
              <input value={form.category} onChange={e => setForm({...form, category:e.target.value})} className="input-field w-full" placeholder="E.g. Cloud, Service"/>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Tax Rate (%)</label>
              <input type="number" value={form.tax_rate} onChange={e => setForm({...form, tax_rate:e.target.value})} className="input-field w-full"/>
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm font-bold shadow-lg shadow-primary/20">Update Item</button>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </DashboardLayout>
  );
}
