import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, CheckCircle2, Eye, Pencil, Trash2, X, Wallet } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';
import { emitToast } from '../../context/ToastContext';

const DEFAULT_FORM = {
  payment_for: 'Invoice',
  account_id: '',
  invoice_id: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  method: 'Bank Transfer',
  transaction_id: '',
  deposit_to: 'Petty Cash',
  notes: '',
  status: 'Completed'
};

const PAYMENT_METHODS = ['Bank Transfer', 'Credit Card', 'Cash', 'Check', 'PayPal', 'Other'];
const DEPOSIT_ACCOUNTS = ['Petty Cash', 'Undeposited Funds', 'Operating Bank Account'];
const PAYMENT_FOR_OPTIONS = ['Invoice', 'Retainer', 'Other'];

export default function Payments() {
  const { symbol } = useCurrency();
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [modal, setModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [viewing, setViewing] = useState(null);
  
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadData = async () => {
    try {
      const [pRes, aRes, iRes] = await Promise.all([
        api.get('/api/sales/payments'),
        api.get('/api/sales/accounts'),
        api.get('/api/sales/invoices')
      ]);
      setPayments(pRes.data);
      setAccounts(aRes.data);
      setInvoices(iRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        invoice_id: form.payment_for === 'Invoice' ? form.invoice_id : null 
      };
      
      if (form.id) {
        await api.put('/api/sales/payments/' + form.id, payload);
        emitToast('success', 'Payment updated successfully');
      } else {
        await api.post('/api/sales/payments', payload);
        emitToast('success', 'Payment recorded successfully');
      }
      await loadData();
      setModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payment?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/sales/payments/' + id);
      setPayments(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Payment deleted');
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const openNewModal = () => {
    setForm(DEFAULT_FORM);
    setModal(true);
  };

  const openEditModal = async (payment) => {
    try {
      const res = await api.get('/api/sales/payments/' + payment.id);
      const data = res.data;
      setForm({
        id: data.id,
        payment_for: data.payment_for || 'Invoice',
        account_id: data.account_id || '',
        invoice_id: data.invoice_id || '',
        amount: data.amount,
        date: data.date?.split('T')[0] || '',
        method: data.method || 'Bank Transfer',
        transaction_id: data.transaction_id || '',
        deposit_to: data.deposit_to || 'Petty Cash',
        notes: data.notes || '',
        status: data.status || 'Completed'
      });
      setModal(true);
    } catch(err) { console.error(err); }
  };

  const filtered = payments.filter(p => 
    (p.invoice_no && p.invoice_no.toLowerCase().includes(search.toLowerCase())) || 
    (p.transaction_id && p.transaction_id.toLowerCase().includes(search.toLowerCase())) ||
    (p.account_name && p.account_name.toLowerCase().includes(search.toLowerCase()))
  );

  const customerInvoices = invoices.filter(i => i.account_id === form.account_id && i.status !== 'Paid');
  const selectedInvoice = invoices.find(i => i.id === form.invoice_id);

  // Auto-fill amount if an invoice is selected
  useEffect(() => {
    if (form.payment_for === 'Invoice' && form.invoice_id && !form.id) {
      if (selectedInvoice) {
        setForm(prev => ({ ...prev, amount: selectedInvoice.due_amount || selectedInvoice.amount }));
      }
    }
  }, [form.invoice_id, form.payment_for, selectedInvoice, form.id]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Payments Received</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Record and manage payments from customers.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> Record Payment
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" placeholder="Search payments..."/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Payment #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Reference / Invoice</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((pay, i) => (
                  <motion.tr key={pay.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(pay.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold dark:text-slate-200">PAY-{pay.id.substring(0,6).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{pay.account_name || '—'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {pay.invoice_no ? <span className="text-primary">{pay.invoice_no}</span> : (pay.transaction_id || '—')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                        {pay.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-500 text-right">
                      {symbol}{Number(pay.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={async () => {
                          const res = await api.get('/api/sales/payments/' + pay.id);
                          setViewing(res.data);
                        }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Eye size={14}/></button>
                        <button onClick={() => openEditModal(pay)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(pay.id)} disabled={deleting === pay.id} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40"><Trash2 size={14}/></button>
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
                <h2 className="text-2xl font-bold dark:text-white">{form.id ? 'Edit Payment' : 'Record Payment'}</h2>
                <button type="button" onClick={() => setModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X size={20}/></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Payment For */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Payment For</label>
                    <select value={form.payment_for} onChange={e => setForm({...form, payment_for:e.target.value})} className="input-field w-full">
                      {PAYMENT_FOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  
                  {/* Customer */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Customer / Account *</label>
                    <select required value={form.account_id} onChange={e => {
                      setForm({...form, account_id:e.target.value, invoice_id: ''});
                    }} className="input-field w-full">
                      <option value="">Select Customer</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  
                  {/* Invoice Selection */}
                  {form.payment_for === 'Invoice' && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Select Invoice</label>
                      <select required value={form.invoice_id} onChange={e => setForm({...form, invoice_id:e.target.value})} className="input-field w-full" disabled={!form.account_id}>
                        <option value="">Select an Invoice</option>
                        {customerInvoices.map(i => <option key={i.id} value={i.id}>{i.invoice_no} (Due: {symbol}{i.due_amount || i.amount})</option>)}
                      </select>
                      {!form.account_id && <p className="text-xs text-slate-400 ml-1 mt-1">Select customer to view invoices.</p>}
                    </div>
                  )}
                  
                  {/* Amount Due (Read Only if invoice selected) */}
                  {form.payment_for === 'Invoice' && form.invoice_id && (
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Amount Due</label>
                      <div className="input-field w-full bg-slate-50 dark:bg-slate-800/50 flex items-center font-bold text-slate-500">
                        {symbol}{selectedInvoice?.due_amount || selectedInvoice?.amount || 0}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Payment Amount *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{symbol}</span>
                      <input type="number" step="0.01" min="0.01" required value={form.amount} onChange={e => setForm({...form, amount:e.target.value})} className="input-field w-full pl-8" placeholder="0.00"/>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Payment Date *</label>
                    <input required type="date" value={form.date} onChange={e => setForm({...form, date:e.target.value})} className="input-field w-full"/>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Payment Method</label>
                    <select value={form.method} onChange={e => setForm({...form, method:e.target.value})} className="input-field w-full">
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Deposit To (Account)</label>
                    <select value={form.deposit_to} onChange={e => setForm({...form, deposit_to:e.target.value})} className="input-field w-full">
                      {DEPOSIT_ACCOUNTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Reference / Transaction ID</label>
                    <input value={form.transaction_id} onChange={e => setForm({...form, transaction_id:e.target.value})} className="input-field w-full" placeholder="e.g. Check No or TXN ID"/>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Notes</label>
                    <textarea rows="3" value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} className="input-field w-full" placeholder="Add internal notes or customer remarks..."/>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3  bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl py-4 rounded-b-3xl">
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary px-6 py-2.5">Cancel</button>
                  <button type="submit" className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary/20">
                    {form.id ? 'Save Changes' : 'Record Payment'}
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
                    <CheckCircle2 className="text-emerald-500" size={28}/>
                    Payment Receipt
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">ID: PAY-{viewing.id.substring(0,8).toUpperCase()}</p>
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
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Received</p>
                    <p className="font-bold text-emerald-500 text-2xl">{symbol}{Number(viewing.amount).toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Date</p>
                    <p className="font-bold dark:text-slate-200">{new Date(viewing.date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500">
                      {viewing.status || 'Completed'}
                    </span>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</p>
                    <p className="font-medium dark:text-slate-300">{viewing.method}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit To</p>
                    <p className="font-medium dark:text-slate-300 flex items-center gap-1.5"><Wallet size={14} className="text-slate-400"/> {viewing.deposit_to}</p>
                  </div>
                  
                  {viewing.payment_for === 'Invoice' && viewing.invoice_no && (
                    <div className="col-span-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Payment For</p>
                      <p className="font-bold text-primary text-lg">Invoice #{viewing.invoice_no}</p>
                    </div>
                  )}

                  {viewing.transaction_id && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reference / Transaction ID</p>
                      <p className="font-medium dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg inline-block border border-slate-100 dark:border-slate-800">
                        {viewing.transaction_id}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t-2 border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4">Recorded On Details</p>
                  <p className="text-sm text-slate-500 mb-6">{new Date(viewing.created_at).toLocaleString()}</p>

                  {viewing.notes && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        {viewing.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
