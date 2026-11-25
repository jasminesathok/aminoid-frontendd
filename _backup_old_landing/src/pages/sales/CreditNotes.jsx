import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileMinus, Eye, Pencil, Trash2, X } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';
import { emitToast } from '../../context/ToastContext';

const DEFAULT_FORM = {
  account_id: '',
  invoice_id: '',
  note_no: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  credit_type: 'Account Credit',
  reason: '',
  notes: ''
};

const CREDIT_TYPES = ['Account Credit', 'Refund', 'Discount', 'Write-off'];

export default function CreditNotes() {
  const { symbol } = useCurrency();
  const [notesList, setNotesList] = useState([]);
  const [accounts,  setAccounts]  = useState([]);
  const [invoices,  setInvoices]  = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  
  const [modal,     setModal]     = useState(false);
  const [deleting,  setDeleting]  = useState(null);
  const [viewing,   setViewing]   = useState(null);
  
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = async () => {
    try {
      const [nRes, aRes, iRes] = await Promise.all([
        api.get('/api/sales/credit-notes'),
        api.get('/api/sales/accounts'),
        api.get('/api/sales/invoices')
      ]);
      setNotesList(nRes.data);
      setAccounts(aRes.data);
      setInvoices(iRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, invoice_id: form.invoice_id || null };
      if (form.id) {
        await api.put('/api/sales/credit-notes/' + form.id, payload);
        emitToast('success', 'Credit note updated successfully');
      } else {
        await api.post('/api/sales/credit-notes', payload);
        emitToast('success', 'Credit note created successfully');
      }
      await loadData();
      setModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this credit note?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/sales/credit-notes/' + id);
      setNotesList(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Credit note deleted');
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const openNewModal = () => {
    setForm(DEFAULT_FORM);
    setModal(true);
  };

  const openEditModal = async (note) => {
    try {
      const res = await api.get('/api/sales/credit-notes/' + note.id);
      const data = res.data;
      setForm({
        id: data.id,
        account_id: data.account_id || '',
        invoice_id: data.invoice_id || '',
        note_no: data.note_no || '',
        amount: data.amount || '',
        date: data.date?.split('T')[0] || '',
        credit_type: data.credit_type || 'Account Credit',
        reason: data.reason || '',
        notes: data.notes || ''
      });
      setModal(true);
    } catch(err) { console.error(err); }
  };

  const filtered = notesList.filter(n => 
    n.note_no.toLowerCase().includes(search.toLowerCase()) || 
    (n.account_name && n.account_name.toLowerCase().includes(search.toLowerCase()))
  );
  
  // Filter invoices for the selected customer only
  const customerInvoices = invoices.filter(i => i.account_id === form.account_id);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Credit Notes</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage sales credits, refunds, and adjustments.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Credit Note
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search credit notes..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Credit Note #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((note, i) => (
                  <motion.tr key={note.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">{note.note_no}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{note.account_name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-500">{symbol}{Number(note.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(note.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{note.credit_type || 'Account Credit'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={async () => {
                          const res = await api.get('/api/sales/credit-notes/' + note.id);
                          setViewing(res.data);
                        }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Eye size={14}/></button>
                        <button onClick={() => openEditModal(note)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(note.id)} disabled={deleting === note.id} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-12 overflow-y-auto">
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl my-8">
              <div className=" bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 rounded-t-3xl">
                <h2 className="text-2xl font-bold dark:text-white">{form.id ? 'Edit Credit Note' : 'New Credit Note'}</h2>
                <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Customer / Account *</label>
                    <select required value={form.account_id} onChange={e => {
                        setForm({...form, account_id:e.target.value, invoice_id: ''}); // Reset invoice when customer changes
                      }} className="input-field w-full">
                      <option value="">Select Customer</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Credit Type</label>
                    <select value={form.credit_type} onChange={e => setForm({...form, credit_type:e.target.value})} className="input-field w-full">
                      {CREDIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Apply to Invoice (Optional)</label>
                    <select value={form.invoice_id} onChange={e => setForm({...form, invoice_id:e.target.value})} className="input-field w-full" disabled={!form.account_id}>
                      <option value="">Do not apply to specific invoice</option>
                      {customerInvoices.map(i => <option key={i.id} value={i.id}>{i.invoice_no} ({symbol}{i.amount})</option>)}
                    </select>
                    {!form.account_id && <p className="text-xs text-slate-500 ml-1 mt-1">Select a customer first to see invoices.</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Reference / Credit No. *</label>
                    <input required value={form.note_no} onChange={e => setForm({...form, note_no:e.target.value})} className="input-field w-full" placeholder="CR-0001"/>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Credit Amount *</label>
                    <input type="number" step="0.01" min="0.01" required value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} className="input-field w-full" placeholder="0.00"/>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Credit Date *</label>
                    <input required type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="input-field w-full"/>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Reason / Description</label>
                    <textarea rows="3" value={form.reason} onChange={e => setForm({...form, reason:e.target.value})} className="input-field w-full" placeholder="Enter reason for credit..."/>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Internal Notes</label>
                    <textarea rows="2" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className="input-field w-full" placeholder="For internal use only..."/>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3  bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-4 rounded-b-3xl">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary px-6 py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary/20">
                    {form.id ? 'Save Changes' : 'Save Credit Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 py-12 overflow-y-auto"
            onClick={() => setViewing(null)}>
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <FileMinus className="text-emerald-500" size={28}/>
                    Credit Note
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">#{viewing.note_no}</p>
                </div>
                <button onClick={() => setViewing(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500"><X size={20}/></button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-bold dark:text-slate-200 text-lg">{viewing.account_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                    <p className="font-bold text-emerald-500 text-2xl">{symbol}{Number(viewing.amount).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="font-bold dark:text-slate-200">{new Date(viewing.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Credit Type</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {viewing.credit_type || 'Account Credit'}
                    </span>
                  </div>
                  
                  {viewing.invoice_no && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Applied To Invoice</p>
                      <p className="font-bold text-primary">{viewing.invoice_no}</p>
                    </div>
                  )}
                </div>

                {(viewing.reason || viewing.notes) && (
                  <div className="pt-6 border-t-2 border-slate-100 dark:border-slate-800 space-y-6">
                    {viewing.reason && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reason / Description</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                          {viewing.reason}
                        </p>
                      </div>
                    )}
                    
                    {viewing.notes && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Internal Notes</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500 whitespace-pre-wrap">{viewing.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
