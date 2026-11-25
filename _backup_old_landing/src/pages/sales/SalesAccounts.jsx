import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Building2, MoreVertical, Pencil, Trash2, X, Globe, Phone, Mail, MapPin, FileText, Paperclip, BadgeCheck, MessageSquareText, UploadCloud, CheckCircle2, CircleDollarSign } from 'lucide-react';

import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';

const INDUSTRIES = ['Technology', 'Consulting', 'Finance', 'Retail', 'Healthcare', 'Education', 'Manufacturing', 'Other'];
const STATUSES = ['Active', 'Inactive', 'Prospect', 'Churned'];
const ACCOUNT_TYPES = ['Customer', 'Partner', 'Vendor', 'Prospect'];
const LEAD_SOURCES = ['Website', 'Referral', 'Cold Call', 'Social', 'Existing Customer', 'Other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'INR'];
const PAYMENT_TERMS = ['Net 7', 'Net 15', 'Net 30', 'Net 45', 'Due on Receipt'];
const filters = ['All', ...STATUSES];
const empty = {
  name: '',
  industry: 'Technology',
  status: 'Prospect',
  revenue: '',
  website: '',
  phone: '',
  owner: '',
  companyEmail: '',
  companySize: '',
  address: '',
  accountOwner: '',
  accountType: 'Customer',
  leadSource: 'Website',
  currency: 'USD',
  taxId: '',
  paymentTerms: 'Net 30',
  description: '',
  socialLinks: '',
  tags: '',
  attachments: [],
  notes: '',
};

const statusStyle = {
  Active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Inactive: { bg: 'bg-slate-200/70 dark:bg-slate-700/40', text: 'text-slate-500', dot: 'bg-slate-400' },
  Prospect: { bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-500' },
  Churned: { bg: 'bg-rose-500/10', text: 'text-rose-500', dot: 'bg-rose-500' },
};

const allowedAttachmentTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function SalesAccounts() {
  const { symbol } = useCurrency();
  const [accounts, setAccounts] = useState([]);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const menuRef = useRef(null);

  const load = () => api.get('/api/sales/accounts').then((r) => setAccounts(r.data));
  useEffect(() => { load().finally(() => setLoading(false)); }, []);
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = 'Company name is required';
    if (!form.companyEmail?.trim()) nextErrors.companyEmail = 'Company email is required';
    if (!form.phone?.trim()) nextErrors.phone = 'Phone number is required';
    if (!form.address?.trim()) nextErrors.address = 'Address is required';
    if (!form.accountOwner?.trim()) nextErrors.accountOwner = 'Account owner is required';
    if (!form.description?.trim()) nextErrors.description = 'Description is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openCreate = () => {
    setForm(empty);
    setEditing(null);
    setErrors({});
    setModal(true);
  };

  const openEdit = (account) => {
    setForm({
      ...empty,
      ...account,
      companyEmail: account.company_email || account.companyEmail || '',
      companySize: account.company_size || '',
      address: account.address || '',
      accountOwner: account.account_owner || account.accountOwner || '',
      accountType: account.account_type || 'Customer',
      leadSource: account.lead_source || 'Website',
      currency: account.currency || 'USD',
      taxId: account.tax_id || '',
      paymentTerms: account.payment_terms || 'Net 30',
      description: account.description || '',
      socialLinks: account.social_links || '',
      tags: account.tags || '',
      attachments: account.attachments || [],
      notes: account.notes || '',
    });
    setEditing(account.id);
    setErrors({});
    setModal(true);
    setMenuOpen(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        industry: form.industry,
        status: form.status,
        revenue: form.revenue || 0,
        website: form.website,
        phone: form.phone,
        owner: form.owner || form.accountOwner,
        company_email: form.companyEmail,
        company_size: form.companySize,
        address: form.address,
        account_owner: form.accountOwner,
        account_type: form.accountType,
        lead_source: form.leadSource,
        currency: form.currency,
        tax_id: form.taxId,
        payment_terms: form.paymentTerms,
        description: form.description,
        social_links: form.socialLinks,
        tags: form.tags,
        attachments: form.attachments,
        notes: form.notes,
      };

      if (editing) {
        await api.put(`/api/sales/accounts/${editing}`, payload);
      } else {
        await api.post('/api/sales/accounts', payload);
      }
      await load();
      setModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await api.delete(`/api/sales/accounts/${id}`);
    setMenuOpen(null);
    await load();
  };

  const handleAttachmentUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!allowedAttachmentTypes.includes(file.type)) {
      alert('Only PDF, JPG, PNG, DOC, and DOCX files are allowed.');
      return;
    }
    setUploading(true);
    try {
      const nextAttachment = { name: file.name, type: file.type, size: file.size };
      setForm((prev) => ({ ...prev, attachments: [...prev.attachments, nextAttachment] }));
    } finally {
      setUploading(false);
    }
  };

  const filtered = accounts.filter((account) => {
    const matchesTab = tab === 'All' || account.status === tab;
    const haystack = `${account.name || ''} ${account.industry || ''} ${account.owner || ''}`.toLowerCase();
    return matchesTab && haystack.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6 px-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Sales Accounts</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create and manage customer accounts with a structured CRM workflow.</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> Create New Sales Account
          </button>
        </div>

        <div className="glass-card overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button key={filter} onClick={() => setTab(filter)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${tab === filter ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-slate-100 text-slate-500 hover:text-primary dark:bg-slate-800'}`}>
                  {filter}
                </button>
              ))}
            </div>
            <div className="flex w-56 items-center gap-2 rounded-xl border border-white/5 bg-slate-100/60 px-3 py-2 dark:bg-slate-800/40">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search accounts..." className="w-full border-none bg-transparent text-sm outline-none dark:text-white" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Account', 'Industry', 'Revenue', 'Website', 'Owner', 'Status', ''].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((account, index) => {
                  const style = statusStyle[account.status] || statusStyle.Prospect;
                  return (
                    <motion.tr key={account.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="border-b border-slate-50 transition-colors hover:bg-slate-50/50 dark:border-slate-800/50 dark:hover:bg-slate-800/20">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2 size={14} /></div>
                          <p className="whitespace-nowrap text-sm font-bold dark:text-white">{account.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{account.industry}</td>
                      <td className="px-5 py-4 text-sm font-semibold dark:text-white">{symbol}{Number(account.revenue || 0).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        {account.website ? (
                          <a href={`https://${account.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                            <Globe size={12} />{account.website}
                          </a>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{account.owner || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />{account.status}
                        </span>
                      </td>
                      <td className="relative px-5 py-4">
                        <button onClick={() => setMenuOpen(menuOpen === account.id ? null : account.id)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800">
                          <MoreVertical size={16} />
                        </button>
                        <AnimatePresence>
                          {menuOpen === account.id && (
                            <motion.div ref={menuRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-4 top-10 z-20 min-w-[130px] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                              <button onClick={() => openEdit(account)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700">
                                <Pencil size={14} /> Edit
                              </button>
                              <button onClick={() => handleDelete(account.id)} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                <Trash2 size={14} /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No accounts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-12">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="m-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 p-6 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">{editing ? 'Edit Sales Account' : 'Create New Sales Account'}</h2>
                  <p className="mt-1 text-sm text-slate-500">Capture everything needed to manage the account end to end.</p>
                </div>
                <button type="button" onClick={() => setModal(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="mb-4 flex items-center gap-2">
                        <Building2 size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Company Information</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Company Name *</label>
                          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input-field w-full text-sm ${errors.name ? 'border-rose-400' : ''}`} placeholder="e.g. Nexus Technologies" />
                          {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Website</label>
                          <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="input-field w-full text-sm" placeholder="example.com" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Company Email *</label>
                          <input value={form.companyEmail} onChange={(e) => setForm({ ...form, companyEmail: e.target.value })} className={`input-field w-full text-sm ${errors.companyEmail ? 'border-rose-400' : ''}`} placeholder="sales@company.com" />
                          {errors.companyEmail && <p className="mt-1 text-xs text-rose-500">{errors.companyEmail}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Phone Number *</label>
                          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`input-field w-full text-sm ${errors.phone ? 'border-rose-400' : ''}`} placeholder="+1 415 555 0100" />
                          {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Industry</label>
                          <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="input-field w-full text-sm">
                            {INDUSTRIES.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Company Size</label>
                          <input value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} className="input-field w-full text-sm" placeholder="11-50 employees" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Address *</label>
                          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows="3" className={`input-field w-full text-sm ${errors.address ? 'border-rose-400' : ''}`} placeholder="Street, city, state, country" />
                          {errors.address && <p className="mt-1 text-xs text-rose-500">{errors.address}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="mb-4 flex items-center gap-2">
                        <BadgeCheck size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Account Details</h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Account Owner *</label>
                          <input value={form.accountOwner} onChange={(e) => setForm({ ...form, accountOwner: e.target.value })} className={`input-field w-full text-sm ${errors.accountOwner ? 'border-rose-400' : ''}`} placeholder="Sarah Chen" />
                          {errors.accountOwner && <p className="mt-1 text-xs text-rose-500">{errors.accountOwner}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Account Type</label>
                          <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })} className="input-field w-full text-sm">
                            {ACCOUNT_TYPES.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Lead Source</label>
                          <select value={form.leadSource} onChange={(e) => setForm({ ...form, leadSource: e.target.value })} className="input-field w-full text-sm">
                            {LEAD_SOURCES.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Currency</label>
                          <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input-field w-full text-sm">
                            {CURRENCIES.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Tax ID / VAT Number</label>
                          <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="input-field w-full text-sm" placeholder="VAT-123456" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Payment Terms</label>
                          <select value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} className="input-field w-full text-sm">
                            {PAYMENT_TERMS.map((item) => <option key={item}>{item}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="mb-4 flex items-center gap-2">
                        <MessageSquareText size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Additional Information</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Description *</label>
                          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows="4" className={`input-field w-full text-sm ${errors.description ? 'border-rose-400' : ''}`} placeholder="Describe the account relationship, goals, and notes." />
                          {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Social Links</label>
                          <input value={form.socialLinks} onChange={(e) => setForm({ ...form, socialLinks: e.target.value })} className="input-field w-full text-sm" placeholder="linkedin.com/company/example" />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">Tags</label>
                          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field w-full text-sm" placeholder="enterprise, priority, renewals" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="mb-4 flex items-center gap-2">
                        <Paperclip size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Attachments</h3>
                      </div>
                      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center transition hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-950/60">
                        <UploadCloud size={18} className="mb-2 text-primary" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Upload files</span>
                        <span className="mt-1 text-xs text-slate-500">PDF, JPG, PNG, DOC, DOCX</span>
                        <input type="file" className="hidden" onChange={handleAttachmentUpload} />
                      </label>
                      {uploading && <p className="mt-2 text-sm text-primary">Uploading attachment...</p>}
                      <div className="mt-3 space-y-2">
                        {form.attachments?.length ? form.attachments.map((file, index) => (
                          <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950/70">
                            <span className="truncate text-slate-700 dark:text-slate-200">{file.name || file.path}</span>
                            <span className="text-xs text-slate-500">Attached</span>
                          </div>
                        )) : <p className="text-sm text-slate-500">No attachments yet.</p>}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="mb-4 flex items-center gap-2">
                        <FileText size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Notes</h3>
                      </div>
                      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="5" className="input-field w-full text-sm" placeholder="Add internal notes or follow-up reminders." />
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <div className="mb-4 flex items-center gap-2">
                        <CircleDollarSign size={16} className="text-primary" />
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</h3>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between"><span>Status</span><span className="font-semibold text-slate-900 dark:text-white">{form.status}</span></div>
                        <div className="flex items-center justify-between"><span>Revenue</span><span className="font-semibold text-slate-900 dark:text-white">{symbol}{Number(form.revenue || 0).toLocaleString()}</span></div>
                        <div className="flex items-center justify-between"><span>Attachments</span><span className="font-semibold text-slate-900 dark:text-white">{form.attachments?.length || 0}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
                    <CheckCircle2 size={16} /> {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Account'}
                  </button>
                  <button type="button" onClick={() => setModal(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
