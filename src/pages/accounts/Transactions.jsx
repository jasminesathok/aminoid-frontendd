import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ArrowUpRight, ArrowDownLeft, Eye, Pencil, Trash2, X,
  Upload, FileText, CheckCircle2, Clock, Tag, CreditCard, Landmark, User, Calendar
} from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { emitToast } from '../../context/ToastContext';

const typeStyle = {
  Credit: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: ArrowUpRight },
  Debit:  { bg: 'bg-rose-500/10',    text: 'text-rose-500',    border: 'border-rose-500/20',    icon: ArrowDownLeft  },
};

const CATEGORY_OPTIONS = [
  'Sales Income', 'Consulting Services', 'Software Subscription', 'Office Supplies',
  'Marketing & Ads', 'Rent & Utilities', 'Salaries & Payroll', 'Travel & Expense',
  'Equipment & Hardware', 'Professional Fees', 'Other'
];

const METHOD_OPTIONS = [
  'Bank Transfer', 'Credit Card', 'Debit Card', 'Cash', 'Check', 'PayPal', 'Stripe', 'Other'
];

const ACCOUNT_OPTIONS = [
  'Operating Bank Account', 'Primary Checking Account', 'Petty Cash', 'Savings Account', 'Corporate Credit Card'
];

const STATUS_OPTIONS = ['Completed', 'Pending', 'Processing', 'Cancelled'];

const DEFAULT_FORM = {
  type: 'Credit',
  amount: '',
  category: 'Sales Income',
  method: 'Bank Transfer',
  party: '',
  account_name: 'Operating Bank Account',
  reference_id: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().split(' ')[0].substring(0, 5),
  description: '',
  status: 'Completed',
  tags: '',
  notes: '',
  attachment_path: ''
};

export default function Transactions() {
  const { symbol } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = async () => {
    try {
      const res = await api.get('/api/accounts/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (transactionId) => {
    if (!selectedFile) return null;
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      const res = await api.post(`/api/accounts/transactions/${transactionId}/attachment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.file_path;
    } catch (err) {
      console.error('File upload error:', err);
      emitToast('error', 'File upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount) || 0,
      };

      let txnId = form.id;
      let res;

      if (txnId) {
        res = await api.put('/api/accounts/transactions/' + txnId, payload);
        emitToast('success', 'Transaction updated successfully');
      } else {
        res = await api.post('/api/accounts/transactions', payload);
        txnId = res.data.id;
        emitToast('success', 'Transaction created successfully');
      }

      if (selectedFile && txnId) {
        await handleFileUpload(txnId);
      }

      await loadData();
      setModal(false);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/accounts/transactions/' + id);
      setTransactions(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Transaction deleted');
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const openNewModal = () => {
    setForm(DEFAULT_FORM);
    setSelectedFile(null);
    setModal(true);
  };

  const openEditModal = async (txn) => {
    try {
      const res = await api.get('/api/accounts/transactions/' + txn.id);
      const data = res.data;
      setForm({
        id: data.id,
        type: data.type || 'Credit',
        amount: data.amount || '',
        category: data.category || 'Sales Income',
        method: data.method || 'Bank Transfer',
        party: data.party || '',
        account_name: data.account_name || 'Operating Bank Account',
        reference_id: data.reference_id || '',
        date: data.date ? data.date.split('T')[0] : '',
        time: data.time || '12:00',
        description: data.description || '',
        status: data.status || 'Completed',
        tags: data.tags || '',
        notes: data.notes || '',
        attachment_path: data.attachment_path || ''
      });
      setSelectedFile(null);
      setModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = transactions.filter(t => {
    const matchesSearch =
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      (t.party && t.party.toLowerCase().includes(search.toLowerCase())) ||
      (t.reference_id && t.reference_id.toLowerCase().includes(search.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalCredits = transactions
    .filter(t => t.type === 'Credit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalDebits = transactions
    .filter(t => t.type === 'Debit')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Transactions</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track cash inflow, outflow, and account ledger.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> Add Transaction
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inflow (Credits)</p>
              <h3 className="text-2xl font-black text-emerald-500 mt-1">{symbol}{totalCredits.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <ArrowUpRight size={24}/>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Outflow (Debits)</p>
              <h3 className="text-2xl font-black text-rose-500 mt-1">{symbol}{totalDebits.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
              <ArrowDownLeft size={24}/>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Cash Movement</p>
              <h3 className={`text-2xl font-black mt-1 ${totalCredits - totalDebits >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {symbol}{(totalCredits - totalDebits).toLocaleString(undefined, {minimumFractionDigits: 2})}
              </h3>
            </div>
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Landmark size={24}/>
            </div>
          </div>
        </div>

        {/* Main Table Card */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search transactions..."/>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {['All', 'Credit', 'Debit'].map(tf => (
                <button key={tf} onClick={() => setTypeFilter(tf)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${typeFilter === tf ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Party / Category</th>
                  <th className="px-6 py-4">Ref / Account</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((txn, i) => {
                  const ts = typeStyle[txn.type] || typeStyle.Credit;
                  const Icon = ts.icon;
                  return (
                    <motion.tr key={txn.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold dark:text-slate-200">{new Date(txn.date).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-400">{txn.time || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${ts.bg} ${ts.text}`}>
                          <Icon size={12}/> {txn.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold dark:text-slate-200">{txn.party || '—'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{txn.category || txn.description || 'Uncategorized'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{txn.reference_id || '—'}</p>
                        <p className="text-xs text-slate-400">{txn.account_name || 'Operating Account'}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                          {txn.method || 'Bank Transfer'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold text-right ${txn.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {txn.type === 'Credit' ? '+' : '-'}{symbol}{Number(txn.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={async () => {
                            const res = await api.get('/api/accounts/transactions/' + txn.id);
                            setViewing(res.data);
                          }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Eye size={14}/></button>
                          <button onClick={() => openEditModal(txn)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
                          <button onClick={() => handleDelete(txn.id)} disabled={deleting === txn.id} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT SLIDE-OVER MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale:0.95, opacity:0, x: 20 }} animate={{ scale:1, opacity:1, x: 0 }} exit={{ scale:0.95, opacity:0, x: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl my-8 ml-auto h-[90vh] flex flex-col">
              
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10 rounded-t-3xl shrink-0">
                <h2 className="text-2xl font-bold dark:text-white">{form.id ? 'Edit Transaction' : 'Add New Transaction'}</h2>
                <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <form id="txnForm" onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Transaction Type Selector */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Transaction Type *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setForm({ ...form, type: 'Credit' })}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold transition-all ${form.type === 'Credit' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-md' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                        <ArrowUpRight size={20}/> Income / Credit
                      </button>
                      <button type="button" onClick={() => setForm({ ...form, type: 'Debit' })}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-3 font-bold transition-all ${form.type === 'Debit' ? 'border-rose-500 bg-rose-500/10 text-rose-500 shadow-md' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
                        <ArrowDownLeft size={20}/> Expense / Debit
                      </button>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Financial Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Amount *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{symbol}</span>
                          <input type="number" step="0.01" min="0.01" required value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} className="input-field w-full pl-8 font-bold text-lg" placeholder="0.00"/>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Category</label>
                        <select value={form.category} onChange={e => setForm({...form, category:e.target.value})} className="input-field w-full">
                          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Party (Vendor / Customer / Payee)</label>
                        <input value={form.party} onChange={e => setForm({...form, party:e.target.value})} className="input-field w-full" placeholder="e.g. Acme Corp or John Doe"/>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Payment Method</label>
                        <select value={form.method} onChange={e => setForm({...form, method:e.target.value})} className="input-field w-full">
                          {METHOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Account</label>
                        <select value={form.account_name} onChange={e => setForm({...form, account_name:e.target.value})} className="input-field w-full">
                          {ACCOUNT_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Reference / Transaction ID</label>
                        <input value={form.reference_id} onChange={e => setForm({...form, reference_id:e.target.value})} className="input-field w-full" placeholder="e.g. TXN-99481 or Check #104"/>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Date *</label>
                        <input type="date" required value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="input-field w-full"/>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Time</label>
                        <input type="time" value={form.time} onChange={e => setForm({...form, time:e.target.value})} className="input-field w-full"/>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Status</label>
                        <select value={form.status} onChange={e => setForm({...form, status:e.target.value})} className="input-field w-full">
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Tags</label>
                        <input value={form.tags} onChange={e => setForm({...form, tags:e.target.value})} className="input-field w-full" placeholder="e.g. #marketing #q3"/>
                      </div>
                    </div>
                  </div>

                  {/* Description & Notes */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">Description & Notes</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Brief Description</label>
                      <input value={form.description} onChange={e => setForm({...form, description:e.target.value})} className="input-field w-full" placeholder="Summary of purpose..."/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Detailed Notes</label>
                      <textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className="input-field w-full" placeholder="Additional details, tax invoice notes, etc..."/>
                    </div>
                  </div>

                  {/* Attachment Section */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">Attachment (Receipt / Invoice)</h3>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/30">
                      <Upload className="mx-auto text-slate-400 mb-2" size={28}/>
                      <p className="text-sm font-bold dark:text-slate-300">Drag & Drop file or click to browse</p>
                      <p className="text-xs text-slate-400 mt-1">Supports PDF, JPG, PNG, DOC, DOCX files</p>
                      <input type="file" onChange={e => setSelectedFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="mt-3 block mx-auto text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white cursor-pointer"/>
                      {selectedFile && (
                        <p className="mt-2 text-xs font-bold text-emerald-500 flex items-center justify-center gap-1">
                          <FileText size={14}/> Selected: {selectedFile.name}
                        </p>
                      )}
                      {form.attachment_path && !selectedFile && (
                        <p className="mt-2 text-xs font-bold text-primary flex items-center justify-center gap-1">
                          <FileText size={14}/> Attached: {form.attachment_path.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>

                </form>
              </div>

              {/* Footer Actions */}
              <div className="shrink-0 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-3xl flex items-center justify-between">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary px-6 py-2.5">Cancel</button>
                <button type="submit" form="txnForm" className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary/20">
                  {form.id ? 'Save Changes' : 'Create Transaction'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW DIGITAL RECEIPT MODAL */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setViewing(null)}>
            <motion.div initial={{ scale:0.95 }} animate={{ scale:1 }} exit={{ scale:0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl my-8 overflow-hidden"
              onClick={e => e.stopPropagation()}>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-black dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={28}/>
                    Transaction Receipt
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">ID: TXN-{viewing.id.substring(0,8).toUpperCase()}</p>
                </div>
                <button onClick={() => setViewing(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-500"><X size={20}/></button>
              </div>

              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Transaction Type</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${viewing.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {viewing.type === 'Credit' ? 'Income / Credit' : 'Expense / Debit'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                    <p className={`font-black text-2xl ${viewing.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {viewing.type === 'Credit' ? '+' : '-'}{symbol}{Number(viewing.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Party</p>
                    <p className="font-bold dark:text-slate-200 text-lg">{viewing.party || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</p>
                    <p className="font-medium dark:text-slate-300">{viewing.category || 'Uncategorized'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account</p>
                    <p className="font-medium dark:text-slate-300 flex items-center gap-1.5"><Landmark size={14} className="text-slate-400"/> {viewing.account_name || 'Operating Account'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                    <p className="font-medium dark:text-slate-300 flex items-center gap-1.5"><CreditCard size={14} className="text-slate-400"/> {viewing.method || 'Bank Transfer'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="font-bold dark:text-slate-200 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400"/> {new Date(viewing.date).toLocaleDateString()} {viewing.time ? `(${viewing.time})` : ''}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                      {viewing.status || 'Completed'}
                    </span>
                  </div>

                  {viewing.reference_id && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reference / Transaction ID</p>
                      <p className="font-mono text-sm font-medium dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {viewing.reference_id}
                      </p>
                    </div>
                  )}

                  {viewing.tags && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</p>
                      <div className="flex gap-2">
                        {viewing.tags.split(',').map((t, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary">
                            <Tag size={12}/> {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {viewing.description && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{viewing.description}</p>
                  </div>
                )}

                {viewing.notes && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      {viewing.notes}
                    </p>
                  </div>
                )}

                {viewing.attachment_path && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Attached Receipt / Document</p>
                    <a href={viewing.attachment_path} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md hover:bg-primary/90 transition-all">
                      <FileText size={16}/> View / Download Attachment
                    </a>
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
