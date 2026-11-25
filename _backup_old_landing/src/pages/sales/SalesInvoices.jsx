import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Eye, Pencil, Trash2, X, Download, UploadCloud, File as FileIcon, XCircle,
  User, Calendar, MapPin, Settings, ChevronDown, Check, RefreshCw, Printer, Building, Globe, Mail, Phone
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api, BASE_URL } from '../../utils/api';
import { emitToast } from '../../context/ToastContext';

const STATUSES = ['Draft', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];

const statusStyle = {
  Draft:          { bg:'bg-slate-500/10', text:'text-slate-600 dark:text-slate-400', dot:'bg-slate-400' },
  Unpaid:         { bg:'bg-amber-500/10', text:'text-amber-600', dot:'bg-amber-500' },
  Paid:           { bg:'bg-emerald-500/10', text:'text-emerald-600', dot:'bg-emerald-500' },
  Overdue:        { bg:'bg-rose-500/10', text:'text-rose-600', dot:'bg-rose-500' },
  Cancelled:      { bg:'bg-slate-100 dark:bg-slate-800', text:'text-slate-500', dot:'bg-slate-400' },
  'Partially Paid': { bg:'bg-blue-500/10', text:'text-blue-600', dot:'bg-blue-500' },
};

const PAYMENT_TERMS_OPTIONS = [
  'Net 30 Days',
  'Net 15 Days',
  'Due on Receipt',
  'Net 60 Days',
  'Custom'
];

const CURRENCY_OPTIONS = [
  { code: 'USD - US Dollar', symbol: '$' },
  { code: 'EUR - Euro', symbol: '€' },
  { code: 'GBP - British Pound', symbol: '£' },
  { code: 'INR - Indian Rupee', symbol: '₹' },
];

const DEFAULT_FORM = {
  invoice_no: 'INV-2026-0001', 
  account_id: '', 
  status: 'Draft', 
  amount: 0, 
  due_amount: 0,
  date: new Date().toISOString().split('T')[0], 
  due_date: '2026-04-06',
  billing_address: '', 
  payment_terms: 'Net 30 Days', 
  sales_person: '', 
  notes: '', 
  currency: 'USD - US Dollar',
  tax_status: 'GST18', 
  tax_rate: 18, 
  tax_amount: 0, 
  cgst: 0, 
  sgst: 0, 
  subtotal: 0,
  discount: 0,
  is_recurring: false,
  payment_method: 'EFT Bank Transfer',
  bank_account_name: '',
  bank_code: '123456',
  account_number: '9876543210',
  paid_amount: 0,
};


const getCurrencySymbol = (currencyStr) => {
  if (!currencyStr) return '$';
  const foundOption = CURRENCY_OPTIONS.find(c => c.code === currencyStr);
  if (foundOption) return foundOption.symbol;
  const code = currencyStr.split(' ')[0];
  try {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, maximumFractionDigits: 0 });
    return formatter.formatToParts(0).find(p => p.type === 'currency')?.value || '$';
  } catch (e) { return currencyStr || '$'; }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function SalesInvoices() {
  const { symbol, companyLogo, companyName, companyAddress, companyEmail, companyPhone, companyWebsite, companyTaxId } = useCurrency();
  const [invoices, setInvoices] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  
  const [modal,    setModal]    = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [viewing,  setViewing]  = useState(null);
  
  const [form, setForm] = useState(DEFAULT_FORM);
  const [items, setItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  
  const [catalogItems, setCatalogItems] = useState([]);
  
  const [salesPeople, setSalesPeople] = useState([]);
  const previewRef = useRef(null);
  
  // Quick Add Customer modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');

  // Dropdown menus inside footer
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);

  const loadData = async () => {
    try {
      const [iRes, aRes, itemsRes, employeesRes] = await Promise.all([
        api.get('/api/sales/invoices'),
        api.get('/api/sales/accounts'),
        api.get('/api/sales/items').catch(() => null),
        
        api.get('/api/hr/employees').catch(() => null)
      ]);
      setInvoices(iRes?.data || iRes || []);
      setAccounts(aRes?.data || aRes || []);

      const list = itemsRes?.data || (Array.isArray(itemsRes) ? itemsRes : []);
      setCatalogItems(list);

      if (compRes) {
        
      }

      const allEmployees = employeesRes?.data || (Array.isArray(employeesRes) ? employeesRes : []);
      const salesReps = allEmployees.filter(emp => emp.department === 'Sales');
      setSalesPeople(salesReps);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadData().finally(() => setLoading(false)); }, []);

  const autoGenerateInvoiceNo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    setForm(prev => ({ ...prev, invoice_no: `INV-${year}-${randomNum}` }));
  };

  const generateItemCode = () => `ITM-${Date.now().toString().slice(-6)}${Math.floor(Math.random()*90+10)}`;
  const createLine = () => ({ 
    id: Date.now() + Math.random(), 
    item_code: generateItemCode(), 
    item_name: '', 
    description: '', 
    hsn: '', 
    sku: '', 
    quantity: 1.00, 
    rate: 0.00, 
    discount: 0.00, 
    taxRate: 0, 
    amount: 0.00 
  });

  const addItem = () => setItems([...items, createLine()]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));

  const updateItem = (id, field, value) => {
    setItems(items.map(i => {
      if (i.id === id) {
        let updated = { ...i, [field]: value };
        if (field === 'item_name' && typeof value === 'string') {
          const found = catalogItems.find(it => it.name === value);
          if (found) {
            updated = { 
              ...updated, 
              item_code: found.code || found.id || updated.item_code, 
              description: found.description || updated.description,
              hsn: found.code || found.hsn || updated.hsn || '', 
              sku: found.sku || updated.sku || '', 
              rate: Number(found.rate || found.price || 0), 
              taxRate: Number(found.tax_rate || found.tax || 0) 
            };
          }
        }
        const qty = Number(updated.quantity || 0);
        const rate = Number(updated.rate || 0);
        const discountPercent = Number(updated.discount || 0);
        const base = qty * rate;
        const lineAfterDiscount = base * (1 - (discountPercent / 100));
        updated.amount = +lineAfterDiscount.toFixed(2);
        return updated;
      }
      return i;
    }));
  };

  // Recalculate invoice totals when items or invoice discount change
  useEffect(() => {
    if (modal) {
      const subtotal = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const discountPercent = Number(form.discount || 0);
      const discountAmount = subtotal * (discountPercent / 100);
      const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
      const taxAmount = items.reduce((sum, item) => {
        const itemAmt = Number(item.amount || 0);
        const itemTax = Number(item.taxRate || 0);
        return sum + (itemAmt * (itemTax / 100));
      }, 0);

      const cgst = +(taxAmount / 2);
      const sgst = +(taxAmount / 2);
      const total = +(subtotalAfterDiscount + taxAmount);
      
      let due = total;
      if (form.status === 'Partially Paid') {
        due = Math.max(0, total - Number(form.paid_amount || 0));
      } else if (form.status === 'Paid') {
        due = 0;
      }

      setForm(prev => ({ 
        ...prev, 
        amount: total, 
        due_amount: due, 
        subtotal: +subtotal.toFixed(2), 
        tax_amount: +taxAmount.toFixed(2), 
        cgst: +cgst.toFixed(2), 
        sgst: +sgst.toFixed(2) 
      }));
    }
  }, [items, form.discount, form.status, form.paid_amount, modal]);

  // Handle customer selection autofill
  const handleCustomerChange = (accId) => {
    setForm(prev => {
      const selectedAcc = accounts.find(a => String(a.id) === String(accId));
      return {
        ...prev,
        account_id: accId,
        billing_address: selectedAcc ? (selectedAcc.billing_address || selectedAcc.address || selectedAcc.name) : ''
      };
    });
  };

  // Quick add new customer
  const handleAddNewCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;
    try {
      const res = await api.post('/api/sales/accounts', {
        name: newCustomerName,
        billing_address: newCustomerAddress
      });
      const created = res.data;
      setAccounts(prev => [...prev, created]);
      setForm(prev => ({
        ...prev,
        account_id: created.id,
        billing_address: newCustomerAddress || created.name
      }));
      setNewCustomerName('');
      setNewCustomerAddress('');
      setShowAddCustomerModal(false);
      emitToast('success', 'Customer added successfully');
    } catch (err) {
      // Fallback local add if backend doesn't support accounts endpoint
      const newAcc = { id: Date.now(), name: newCustomerName, billing_address: newCustomerAddress };
      setAccounts(prev => [...prev, newAcc]);
      setForm(prev => ({
        ...prev,
        account_id: newAcc.id,
        billing_address: newCustomerAddress || newAcc.name
      }));
      setNewCustomerName('');
      setNewCustomerAddress('');
      setShowAddCustomerModal(false);
      emitToast('success', 'Customer added locally');
    }
  };

  // File Upload Logic
  const fileInputRef = useRef(null);
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setAttachments(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };
  const handleFileSelect = (e) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const deleteExistingAttachment = async (invId, attId) => {
    if(!window.confirm('Delete this attachment?')) return;
    try {
      await api.delete(`/api/sales/invoices/${invId}/attachments/${attId}`);
      setExistingAttachments(prev => prev.filter(a => a.id !== attId));
      emitToast('success', 'Attachment deleted');
    } catch (err) { console.error(err); }
  };

  const uploadAttachments = async (invoiceId) => {
    if (attachments.length === 0) return;
    const token = localStorage.getItem('token');
    
    for (const file of attachments) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await fetch(`${BASE_URL}/api/sales/invoices/${invoiceId}/attachments`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } catch (err) {
        console.error('Failed to upload', file.name, err);
      }
    }
  };

  const handleSubmit = async (e, saveAction = 'save_preview') => {
    if (e) e.preventDefault();
    try {
      const payload = {
        ...form,
        items,
        tax_status: form.tax_status,
        tax_rate: form.tax_rate || 0,
        tax_amount: form.tax_amount || 0,
        cgst: form.cgst || 0,
        sgst: form.sgst || 0,
        subtotal: form.subtotal || 0,
        paid_amount: form.paid_amount || 0,
      };
      let createdInvoiceId;
      
      if (form.id) {
        await api.put('/api/sales/invoices/' + form.id, payload);
        createdInvoiceId = form.id;
        emitToast('success', 'Invoice updated successfully');
      } else {
        const res = await api.post('/api/sales/invoices', payload);
        createdInvoiceId = res.data?.id || Date.now();
        emitToast('success', 'Invoice created successfully');
      }
      
      await uploadAttachments(createdInvoiceId);
      await loadData();
      setModal(false);

      if (saveAction === 'save_preview' && createdInvoiceId) {
        const fullInv = await api.get('/api/sales/invoices/' + createdInvoiceId).catch(() => null);
        if (fullInv?.data) setViewing(fullInv.data);
      }
    } catch (err) { 
      console.error(err); 
      emitToast('error', 'Failed to save invoice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    setDeleting(id);
    try {
      await api.delete('/api/sales/invoices/' + id);
      setInvoices(prev => prev.filter(x => x.id !== id));
      emitToast('success', 'Invoice deleted');
    } catch (err) { console.error(err); }
    finally { setDeleting(null); }
  };

  const openNewModal = () => {
    autoGenerateInvoiceNo();
    setForm({
      ...DEFAULT_FORM,
      invoice_no: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`
    });
    setItems([
      createLine(),
      createLine()
    ]);
    setAttachments([]);
    setExistingAttachments([]);
    setModal(true);
  };

  const openEditModal = async (inv) => {
    try {
      const res = await api.get('/api/sales/invoices/' + inv.id);
      const data = res.data;
      setForm({
        id: data.id,
        invoice_no: data.invoice_no,
        account_id: data.account_id || '',
        status: data.status || 'Draft',
        amount: data.amount || 0,
        due_amount: data.due_amount || 0,
        date: data.date?.split('T')[0] || '',
        due_date: data.due_date?.split('T')[0] || '',
        billing_address: data.billing_address || '',
        payment_terms: data.payment_terms || 'Net 30 Days',
        sales_person: data.sales_person || '',
        tax_status: data.tax_status || 'GST18',
        notes: data.notes || '',
        currency: data.currency || 'USD - US Dollar',
        discount: data.discount || 0,
        is_recurring: data.is_recurring || false,
        payment_method: data.payment_method || DEFAULT_FORM.payment_method,
        paid_amount: data.paid_amount !== undefined ? data.paid_amount : (data.amount && data.due_amount !== undefined ? data.amount - data.due_amount : 0),
        bank_account_name: data.bank_account_name || '',
        bank_code: data.bank_code || DEFAULT_FORM.bank_code,
        account_number: data.account_number || DEFAULT_FORM.account_number,
      });
      setItems(data.items?.length ? data.items.map(i => {
        const withId = { ...i, id: i.id || Date.now() + Math.random() };
        // Auto-fetch HSN/SKU from the catalog when the saved row doesn't have
        // it (e.g. invoices created before HSN/SKU was persisted), matching
        // the same lookup used when picking an item from the dropdown.
        if (!withId.hsn && !withId.sku) {
          const found = catalogItems.find(it => it.name === withId.item_name);
          if (found) {
            withId.hsn = found.code || found.hsn || '';
            withId.sku = found.sku || '';
          }
        }
        return withId;
      }) : [createLine(), createLine()]);
      setExistingAttachments(data.attachments || []);
      setAttachments([]);
      setModal(true);
    } catch(err) { console.error(err); }
  };

              
  // How many item rows fit on the first page (less room, header+meta sit above it)
  // vs. following pages (full page available). Tweak these two numbers if rows
  // are still overflowing/leaving gaps for your font-size / row-height.
  const ITEMS_FIRST_PAGE = 10;
  const ITEMS_PER_PAGE = 10;

  const paginateInvoiceItems = (items) => {
    const list = items || [];
    if (list.length <= ITEMS_FIRST_PAGE) return [list];
    const pages = [list.slice(0, ITEMS_FIRST_PAGE)];
    let rest = list.slice(ITEMS_FIRST_PAGE);
    while (rest.length) {
      pages.push(rest.slice(0, ITEMS_PER_PAGE));
      rest = rest.slice(ITEMS_PER_PAGE);
    }
    return pages;
  };

  // Builds ONE printable page (header + a chunk of items + footer) as an HTML string.
  // Header/footer markup is identical on every page; totals/notes/payment method
  // only render on the last page (where the items actually end).
  const buildInvoicePageHtml = (inv, pageItems, pageNo, totalPages) => {
    const sym = getCurrencySymbol(inv.currency);
    const isFirst = pageNo === 1;
    const isLast = pageNo === totalPages;

    const startIndex = pageNo === 1 ? 0 : ITEMS_FIRST_PAGE + (pageNo - 2) * ITEMS_PER_PAGE;
    const rowsHtml = pageItems.map((it, idx) => `
      <tr>
        <td class="py-3 px-3 text-center font-medium text-slate-500 w-10">${startIndex + idx + 1}</td>
        <td class="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">${it.item_code || '—'}</td>
        <td class="py-3 px-4">
          <p class="font-bold text-slate-800">${it.item_name || ''}</p>
          ${it.description ? `<p class="text-slate-500 text-[11px] mt-0.5">${it.description}</p>` : ''}
        </td>
        <td class="py-3 px-4 text-center font-medium">${it.quantity ?? ''} ${it.unit || ''}</td>
        <td class="py-3 px-4 text-right font-medium">${sym}${Number(it.rate || 0).toFixed(2)}</td>
        <td class="py-3 px-4 text-right font-medium">${it.discount ? `${it.discount}%` : '0.00'}</td>
        <td class="py-3 px-4 text-right font-medium">${it.taxRate ? `${it.taxRate}%` : '0.00'}</td>
        <td class="py-3 px-4 text-right font-bold text-slate-900">${sym}${Number(it.amount || 0).toFixed(2)}</td>
      </tr>`).join('');

    const subtotal = Number(inv.subtotal || (inv.items || []).reduce((s, i) => s + Number(i.amount || 0), 0));
    const discountAmount = Number(inv.discount || 0);
    const taxAmount = Number(inv.tax_amount || (inv.items || []).reduce((s, i) => s + (Number(i.amount || 0) * (Number(i.taxRate || 0) / 100)), 0));

    const totalsHtml = isLast ? `
      <div class="space-y-2 pt-4 text-sm">
        <div class="flex justify-between items-center text-slate-600"><span>Subtotal</span><span>${sym}${subtotal.toFixed(2)}</span></div>
        ${discountAmount > 0 ? `<div class="flex justify-between items-center text-rose-500"><span>Discount (${discountAmount}%)</span><span>-${sym}${((subtotal * discountAmount) / 100).toFixed(2)}</span></div>` : ''}
        ${taxAmount > 0 ? `<div class="flex justify-between items-center text-slate-600"><span>GST / Tax</span><span>${sym}${taxAmount.toFixed(2)}</span></div>` : ''}
        <div class="flex justify-between items-center text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-4 mt-2">
          <span>Total Amount</span><span class="text-xl text-indigo-600">${sym}${Number(inv.amount || 0).toFixed(2)}</span>
        </div>
      </div>
      <div class="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-xs text-slate-600 leading-relaxed mt-5">
        <p class="font-medium whitespace-pre-wrap">${inv.notes || 'Note: There will be a late payment fee of 10% per annum calculated daily for payments received after the due date.'}</p>
      </div>
      <div class="pt-4 mt-5 border-t border-slate-100 text-xs space-y-1.5">
        <p class="font-bold text-slate-900 text-sm">Payment Method</p>
        <p class="text-slate-600 font-medium">${inv.payment_method || 'EFT Bank Transfer'}</p>
        <p class="text-slate-500">Account Name : <span class="font-semibold text-slate-700">${inv.bank_account_name || companyName}</span></p>
        <p class="text-slate-500">Code / BSB : <span class="font-semibold text-slate-700">${inv.bank_code || '—'}</span></p>
        <p class="text-slate-500">Account Number : <span class="font-semibold text-slate-700">${inv.account_number || '—'}</span></p>
      </div>` : '';

    const metaHtml = isFirst ? `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs mt-5">
        <div class="space-y-1">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project / Reference</p>
          <p class="font-bold text-slate-800 text-sm">${inv.payment_terms || 'Standard Invoice'}</p>
        </div>
        <div class="text-left sm:text-right space-y-1">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Issued Date</p>
          <p class="font-bold text-slate-800 text-sm">${formatDate(inv.date)}</p>
        </div>
        <div class="space-y-1 pt-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</p>
          <p class="font-bold text-slate-900 text-sm">${companyName || ''}</p>
          <p class="text-slate-600 whitespace-pre-line">${companyAddress || ''}</p>
          <p class="text-slate-500 font-medium">${companyTaxId || ''}</p>
          <p class="text-slate-500">${companyEmail || ''}</p>
          <p class="text-slate-500">${companyPhone || ''}</p>
          <p class="text-slate-500">${companyWebsite || ''}</p>
        </div>
        <div class="space-y-1 pt-2 text-left sm:text-right">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
          <p class="font-bold text-slate-900 text-sm">${inv.account_name || 'Customer'}</p>
          <p class="text-slate-600 whitespace-pre-wrap">${inv.billing_address || '—'}</p>
          ${inv.due_date ? `<p class="text-slate-500 font-medium mt-2">Due Date: ${formatDate(inv.due_date)}</p>` : ''}
        </div>
      </div>` : '';

    // Header + footer markup below is IDENTICAL on every page on purpose.
    return `
    <div class="invoice-print-page" style="background:#fff;color:#0f172a;padding:36px;${pageNo > 1 ? 'padding-top:80px;' : ''}font-family:inherit;width:100%;box-sizing:border-box;">
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
        <div class="space-y-2">
          ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="h-12 object-contain mb-1" />` : ''}
          <h1 class="text-2xl font-black tracking-tight text-slate-900 uppercase">${companyName || ''}</h1>
        </div>
        <div class="text-left sm:text-right space-y-1">
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Invoice</h2>
          <p class="text-sm font-semibold text-slate-500">#${inv.invoice_no}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</p>
        </div>
      </div>
      ${metaHtml}
      <div class="border border-slate-200/80 rounded-xl overflow-hidden mt-5">
        <table class="w-full text-[11px] text-left" style="border-collapse:collapse;">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="py-3 px-3 text-center w-10">S.No</th>
              <th class="py-3 px-4 whitespace-nowrap">Item Code</th>
              <th class="py-3 px-4">Description</th>
              <th class="py-3 px-4 text-center">Units</th>
              <th class="py-3 px-4 text-right">Price</th>
              <th class="py-3 px-4 text-right">Discount</th>
              <th class="py-3 px-4 text-right">GST / Tax</th>
              <th class="py-3 px-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">${rowsHtml || '<tr><td colspan="8" class="py-4 text-center text-slate-400 italic">No line items.</td></tr>'}</tbody>
        </table>
      </div>
      ${totalsHtml}
      <div class="pt-4 mt-6 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
        <span>${companyName || ''}${companyEmail ? ` &middot; ${companyEmail}` : ''}</span>
        <span>${inv.invoice_no || ''}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</span>
      </div>
    </div>`;
  };

  const handleDownloadPdf = async (inv) => {
    try {
      let data = inv;
      if (!data.items) {
        const res = await api.get('/api/sales/invoices/' + inv.id).catch(() => null);
        data = res?.data || inv;
      }

      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const pages = paginateInvoiceItems(data.items);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      // Offscreen holder so each page can be rendered/captured one at a time
      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '800px';
      holder.className = 'font-sans';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildInvoicePageHtml(data, pages[i], i + 1, pages.length);
        const pageNode = holder.firstElementChild;
        const imgData = await toPng(pageNode, { backgroundColor: '#ffffff', pixelRatio: 2 });
        const img = new Image();
        img.src = imgData;
        await new Promise(r => { img.onload = r; });
        const renderHeight = (img.height * pdfWidth) / img.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(renderHeight, pdfPageHeight));
      }

      document.body.removeChild(holder);
      pdf.save(`${inv.invoice_no || 'invoice'}.pdf`);
      emitToast('success', 'PDF downloaded successfully');
    } catch (err) {
      console.error('PDF download failed:', err);
      emitToast('error', 'Failed to generate PDF');
    }
  };

  const handlePrintPdf = async (inv) => {
    let data = inv || viewing;
    if (!data) { window.print(); return; }
    if (!data.items || !data.items.length) {
      const res = await api.get('/api/sales/invoices/' + data.id).catch(() => null);
      data = res?.data || data;
    }

    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const pages = paginateInvoiceItems(data.items);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '800px';
      holder.className = 'font-sans';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildInvoicePageHtml(data, pages[i], i + 1, pages.length);
        const pageNode = holder.firstElementChild;
        const imgData = await toPng(pageNode, { backgroundColor: '#ffffff', pixelRatio: 2 });
        const img = new Image();
        img.src = imgData;
        await new Promise(r => { img.onload = r; });
        const renderHeight = (img.height * pdfWidth) / img.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(renderHeight, pdfPageHeight));
      }

      document.body.removeChild(holder);

      // Tell the PDF to automatically open the print dialog
      pdf.autoPrint();
      
      // Open the PDF in a new tab/window. The browser's PDF viewer will handle perfect A4 printing.
      const blobUrl = pdf.output('bloburl');
      window.open(blobUrl, '_blank');
      
    } catch (err) {
      console.error('Print failed:', err);
      emitToast('error', 'Failed to print invoice');
    }
  };

  const filtered = invoices.filter(i => 
    i.invoice_no?.toLowerCase().includes(search.toLowerCase()) || 
    (i.account_name && i.account_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white tracking-tight">Invoices</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage sales invoices, tracking payments and balances.</p>
          </div>
          <button onClick={openNewModal} className="btn-primary flex items-center gap-2">
            <Plus size={18}/> New Invoice
          </button>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 w-full" 
                placeholder="Search invoices..."
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="px-3 py-3 w-12 text-center">S.No</th>
                  <th className="px-3 py-3">Invoice #</th>
                  <th className="px-3 py-3">Account</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-right">Due</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {filtered.map((inv, i) => {
                  const st = statusStyle[inv.status] || statusStyle.Draft;
                  return (
                    <motion.tr 
                      key={inv.id} 
                      initial={{ opacity:0, y:10 }} 
                      animate={{ opacity:1, y:0 }} 
                      transition={{ delay: i*0.05 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-center text-[11px] font-semibold text-slate-400">{i + 1}</td>
                      <td className="px-3 py-2.5 text-xs font-bold dark:text-slate-200">{inv.invoice_no}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium">{inv.account_name || '—'}</td>
                      <td className="px-3 py-2.5 text-xs font-bold text-right dark:text-slate-200">{symbol}{Number(inv.amount || 0).toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs text-rose-500 font-bold text-right">{symbol}{Number(inv.due_amount || 0).toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500">{formatDate(inv.date)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${st.bg} ${st.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}/>{inv.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={async () => {
                            const res = await api.get('/api/sales/invoices/' + inv.id);
                            setViewing(res.data);
                          }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Preview"><Eye size={13}/></button>
                          <button onClick={() => handlePrintPdf(inv)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Print"><Printer size={13}/></button>
                          <button onClick={() => handleDownloadPdf(inv)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Download"><Download size={13}/></button>
                          <button onClick={() => openEditModal(inv)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Edit"><Pencil size={13}/></button>
                          <button onClick={() => handleDelete(inv.id)} disabled={deleting === inv.id} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-40" title="Delete"><Trash2 size={13}/></button>
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

      {/* CREATE / EDIT MODAL - MATCHING EXACT SCREENSHOT */}
      <AnimatePresence>
        {modal && (
          <motion.div 
            initial={{ opacity:0 }} 
            animate={{ opacity:1 }} 
            exit={{ opacity:0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-start justify-center p-2 sm:p-4 py-12 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale:0.96, opacity:0 }} 
              animate={{ scale:1, opacity:1 }} 
              exit={{ scale:0.96, opacity:0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden m-auto border border-slate-200/80 dark:border-slate-800"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 rounded-t-2xl">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {form.id ? 'Edit Sales Invoice' : 'New Sales Invoice'}
                </h2>
                <button 
                  type="button" 
                  onClick={() => setModal(false)} 
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>
              
              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* Top Section Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Customer Field */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Customer <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      <select 
                        required 
                        value={form.account_id} 
                        onChange={e => handleCustomerChange(e.target.value)} 
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select customer</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setShowAddCustomerModal(true)}
                      className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add New Customer
                    </button>
                  </div>

                  {/* Invoice Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Invoice Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                      <input 
                        required 
                        value={form.invoice_no} 
                        onChange={e => setForm({...form, invoice_no: e.target.value})} 
                        className="w-full px-3 py-2 bg-transparent text-sm font-medium text-slate-800 dark:text-slate-200 outline-none" 
                        placeholder="INV-2026-0001"
                      />
                      <button 
                        type="button" 
                        onClick={autoGenerateInvoiceNo} 
                        className="px-3 py-2 text-slate-400 hover:text-indigo-600 border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 transition-colors"
                        title="Auto-generate Invoice Number"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Invoice Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Invoice Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        required 
                        type="date" 
                        value={form.date} 
                        onChange={e => setForm({...form, date: e.target.value})} 
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="space-y-1 md:row-span-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Billing Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative h-[calc(100%-1.75rem)]">
                      <textarea 
                        rows="4" 
                        value={form.billing_address} 
                        onChange={e => setForm({...form, billing_address: e.target.value})} 
                        className="w-full h-full p-3 pr-9 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                        placeholder="Select customer first"
                      />
                      <MapPin className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Terms</label>
                    <div className="relative">
                      <select 
                        value={PAYMENT_TERMS_OPTIONS.includes(form.payment_terms) ? form.payment_terms : 'Custom'} 
                        onChange={e => {
                          const val = e.target.value;
                          setForm({...form, payment_terms: val === 'Custom' ? '' : val});
                        }} 
                        className="w-full px-3 py-2 pr-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        {PAYMENT_TERMS_OPTIONS.map(term => <option key={term} value={term}>{term}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    {(!PAYMENT_TERMS_OPTIONS.includes(form.payment_terms) || form.payment_terms === 'Custom') && (
                      <input 
                        type="text" 
                        value={form.payment_terms === 'Custom' ? '' : form.payment_terms} 
                        onChange={e => setForm({...form, payment_terms: e.target.value})} 
                        placeholder="Enter custom terms..."
                        className="w-full mt-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Due Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Due Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        value={form.due_date} 
                        onChange={e => setForm({...form, due_date: e.target.value})} 
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Sales Person (Positioned next to billing address row bottom) */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Sales Person</label>
                    <div className="relative">
                      <select 
                        value={
                          !form.sales_person 
                            ? '' 
                            : salesPeople.some(u => (u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email) === form.sales_person) 
                              ? form.sales_person 
                              : 'Custom'
                        } 
                        onChange={e => {
                          const val = e.target.value;
                          setForm({...form, sales_person: val === 'Custom' ? ' ' : val});
                        }} 
                        className="w-full px-3 py-2 pr-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                      >
                        <option value="">Select salesperson</option>
                        {salesPeople.map(u => {
                          const fullName = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
                          return <option key={u.id} value={fullName}>{fullName}</option>;
                        })}
                        <option value="Custom">Custom</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    {(!salesPeople.some(u => (u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email) === form.sales_person) && form.sales_person !== '') && (
                      <input 
                        type="text" 
                        value={form.sales_person.trim()} 
                        onChange={e => setForm({...form, sales_person: e.target.value})} 
                        placeholder="Enter custom salesperson name..."
                        className="w-full mt-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    )}
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Items</h3>
                    <button 
                      type="button" 
                      onClick={addItem} 
                      className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={15} /> Add Item
                    </button>
                  </div>

                  <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60 overflow-x-auto space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 px-2 py-1 items-center">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-3">Item / Description <span className="text-rose-500">*</span></div>
                      <div className="col-span-2">HSN / SKU</div>
                      <div className="col-span-1">Quantity <span className="text-rose-500">*</span></div>
                      <div className="col-span-1">Unit Price ({getCurrencySymbol(form.currency)}) <span className="text-rose-500">*</span></div>
                      <div className="col-span-1">Discount (%)</div>
                      <div className="col-span-1">Tax (%)</div>
                      <div className="col-span-1 text-right">Amount ({getCurrencySymbol(form.currency)})</div>
                      <div className="col-span-1 text-center">
                        <Settings size={14} className="text-slate-400 mx-auto" />
                      </div>
                    </div>

                    {/* Line Items */}
                    {items.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="grid grid-cols-12 gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200/70 dark:border-slate-700 items-center shadow-xs"
                      >
                        <div className="col-span-1 text-center text-xs font-medium text-slate-500">
                          {idx + 1}
                        </div>

                        {/* Item Select & Name */}
                        <div className="col-span-3">
                          <div className="relative">
                            <select 
                              required 
                              value={item.item_name} 
                              onChange={e => updateItem(item.id, 'item_name', e.target.value)} 
                              className="w-full px-2.5 py-1.5 pr-6 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer font-medium"
                            >
                              <option value="">Select item</option>
                              {catalogItems.map(it => (
                                <option key={it.id || it.code || it.name} value={it.name}>
                                  {it.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                          </div>
                        </div>

                        {/* HSN / SKU */}
                        <div className="col-span-2">
                          <input 
                            value={item.hsn || item.sku || ''} 
                            onChange={e => updateItem(item.id, 'hsn', e.target.value)}
                            placeholder="Enter HSN / SKU" 
                            className="w-full px-2.5 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500" 
                          />
                        </div>

                        {/* Quantity */}
                        <div className="col-span-1">
                          <input 
                            type="number" 
                            step="0.01"
                            min="0.01" 
                            required 
                            value={item.quantity} 
                            onChange={e => updateItem(item.id, 'quantity', e.target.value)} 
                            className="w-full px-2 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none text-center font-medium"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-1">
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            required 
                            value={item.rate} 
                            onChange={e => updateItem(item.id, 'rate', e.target.value)} 
                            className="w-full px-2 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none text-center font-medium"
                          />
                        </div>

                        {/* Discount % */}
                        <div className="col-span-1">
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            max="100" 
                            value={item.discount} 
                            onChange={e => updateItem(item.id, 'discount', e.target.value)} 
                            className="w-full px-2 py-1.5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none text-center font-medium" 
                          />
                        </div>

                        {/* Tax % */}
                        <div className="col-span-1">
                          <div className="relative">
                            <select 
                              value={item.taxRate} 
                              onChange={e => updateItem(item.id, 'taxRate', Number(e.target.value))} 
                              className="w-full px-2 py-1.5 pr-5 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 outline-none appearance-none cursor-pointer text-center font-medium"
                            >
                              <option value={0}>0%</option>
                              <option value={5}>5%</option>
                              <option value={12}>12%</option>
                              <option value={18}>18%</option>
                              <option value={28}>28%</option>
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="col-span-1 text-right px-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {Number(item.amount || 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Remove Row Button */}
                        <div className="col-span-1 text-center">
                          <button 
                            type="button" 
                            onClick={() => removeItem(item.id)} 
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes, File Upload & Calculation Box */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                  {/* Left Side: Notes & File Upload */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Add Note */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Note</label>
                      <textarea 
                        rows="3" 
                        value={form.notes} 
                        onChange={e => setForm({...form, notes: e.target.value})} 
                        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                        placeholder="Type your note here..."
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={form.payment_method}
                          onChange={e => setForm({...form, payment_method: e.target.value})}
                          placeholder="e.g. EFT Bank Transfer"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 col-span-2"
                        />
                        <input
                          value={form.bank_account_name}
                          onChange={e => setForm({...form, bank_account_name: e.target.value})}
                          placeholder="Account Name"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          value={form.bank_code}
                          onChange={e => setForm({...form, bank_code: e.target.value})}
                          placeholder="Code / BSB"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <input
                          value={form.account_number}
                          onChange={e => setForm({...form, account_number: e.target.value})}
                          placeholder="Account Number"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 col-span-2"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Side: Totals Card & Currency / Status */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Totals Summary Card */}
                    <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{getCurrencySymbol(form.currency)}{Number(form.subtotal || 0).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Discount (%)</span>
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            value={form.discount} 
                            onChange={e => setForm({...form, discount: Number(e.target.value)})}
                            className="w-16 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-center text-xs font-bold text-slate-800 dark:text-slate-200 outline-none" 
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{getCurrencySymbol(form.currency)}{((Number(form.subtotal || 0) * Number(form.discount || 0)) / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <span>Tax</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{getCurrencySymbol(form.currency)}{Number(form.tax_amount || 0).toFixed(2)}</span>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700/80 pt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Total Amount</span>
                        <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                          {getCurrencySymbol(form.currency)}{Number(form.amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Currency & Status Dropdowns */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Currency</label>
                        <div className="relative">
                          <select 
                            value={form.currency} 
                            onChange={e => setForm({...form, currency: e.target.value})} 
                            className="w-full px-3 py-2 pr-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                          >
                            {CURRENCY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Status</label>
                        <div className="relative">
                          <select 
                            value={form.status} 
                            onChange={e => setForm({...form, status: e.target.value})} 
                            className="w-full pl-7 pr-7 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${statusStyle[form.status]?.dot || 'bg-slate-400'}`} />
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                        {form.status === 'Partially Paid' && (
                          <div className="mt-2 space-y-1">
                            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Amount Paid</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={form.paid_amount || ''}
                              onChange={e => setForm({...form, paid_amount: e.target.value})}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Enter amount paid"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 pb-1 rounded-b-2xl px-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400 select-none">
                    <input 
                      type="checkbox" 
                      checked={form.is_recurring} 
                      onChange={e => setForm({...form, is_recurring: e.target.checked})} 
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700 cursor-pointer" 
                    />
                    Save as recurring invoice
                  </label>

                  <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => setModal(false)} 
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>

                    <div className="relative inline-flex rounded-xl shadow-xs">
                      <button 
                        type="button"
                        onClick={(e) => handleSubmit(e, 'save_preview')} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-l-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Save & Preview Invoice
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowSaveDropdown(!showSaveDropdown)} 
                        className="px-2 bg-indigo-600 hover:bg-indigo-700 border-l border-indigo-500 text-white rounded-r-xl transition-colors cursor-pointer flex items-center justify-center"
                      >
                        <ChevronDown size={14} />
                      </button>

                      {/* Dropdown Options */}
                      {showSaveDropdown && (
                        <div className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-30">
                          <button 
                            type="button"
                            onClick={(e) => { setShowSaveDropdown(false); handleSubmit(e, 'save_only'); }} 
                            className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Save Only
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { setShowSaveDropdown(false); handleSubmit(e, 'save_send'); }} 
                            className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                          >
                            Save & Send
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QUICK ADD CUSTOMER MODAL */}
      <AnimatePresence>
        {showAddCustomerModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold dark:text-white">Add New Customer</h3>
                <button type="button" onClick={() => setShowAddCustomerModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddNewCustomer} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Name *</label>
                  <input 
                    required 
                    type="text" 
                    value={newCustomerName} 
                    onChange={e => setNewCustomerName(e.target.value)} 
                    placeholder="Acme Corp / John Doe" 
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Billing Address</label>
                  <textarea 
                    rows="3" 
                    value={newCustomerAddress} 
                    onChange={e => setNewCustomerAddress(e.target.value)} 
                    placeholder="Enter full address..." 
                    className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" 
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddCustomerModal(false)} 
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal - Document Preview Matching Screenshot */}
      <AnimatePresence>
        {viewing && (
          <motion.div 
            initial={{ opacity:0 }} 
            animate={{ opacity:1 }} 
            exit={{ opacity:0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-start justify-center p-3 sm:p-6 py-12 overflow-y-auto"
            onClick={() => setViewing(null)}
          >
            <motion.div 
              initial={{ scale:0.96 }} 
              animate={{ scale:1 }} 
              exit={{ scale:0.96 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl m-auto overflow-hidden border border-slate-200 dark:border-slate-800"
              onClick={e => e.stopPropagation()}
            >
              {/* Action Toolbar Header */}
              <div className="bg-slate-50 dark:bg-slate-800/80 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Invoice Preview</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    #{viewing.invoice_no}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleDownloadPdf(viewing)} 
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Download size={14}/> Download PDF
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handlePrintPdf(viewing)} 
                    className="px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={14}/> Print
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setViewing(null)} 
                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X size={18}/>
                  </button>
                </div>
              </div>

              {/* Printable Invoice Document Body */}
              <div className="p-6 sm:p-10 bg-slate-100/50 dark:bg-slate-950">
                <div 
                  ref={previewRef} 
                  id="invoice-preview-document"
                  className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80 max-w-3xl mx-auto space-y-5 font-sans"
                >
                  {/* Top Header: Company Logo & Name vs Invoice Title */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-2">
                      {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="h-12 object-contain mb-1" />
                      ) : null}
                      <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                        {companyName}
                      </h1>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Invoice</h2>
                      <p className="text-sm font-semibold text-slate-500">#{viewing.invoice_no}</p>
                    </div>
                  </div>

                  {/* Metadata & Parties Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                    {/* Project / Reference & Issued Dates */}
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Project / Reference</p>
                      <p className="font-bold text-slate-800 text-sm">{viewing.payment_terms || 'Standard Invoice'}</p>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Issued Date</p>
                      <p className="font-bold text-slate-800 text-sm">{formatDate(viewing.date)}</p>
                    </div>

                    {/* From Section */}
                    <div className="space-y-1 pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</p>
                      <p className="font-bold text-slate-900 text-sm">{companyName}</p>
                      <p className="text-slate-600 whitespace-pre-line">{companyAddress}</p>
                      <p className="text-slate-500 font-medium">{companyTaxId}</p>
                      <p className="text-slate-500">{companyEmail}</p>
                      <p className="text-slate-500">{companyPhone}</p>
                      <p className="text-slate-500">{companyWebsite}</p>
                    </div>

                    {/* Billed To Section */}
                    <div className="space-y-1 pt-2 text-left sm:text-right">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</p>
                      <p className="font-bold text-slate-900 text-sm">{viewing.account_name || 'Customer'}</p>
                      <p className="text-slate-600 whitespace-pre-wrap">{viewing.billing_address || '—'}</p>
                      {viewing.due_date && (
                        <p className="text-slate-500 font-medium mt-2">Due Date: {formatDate(viewing.due_date)}</p>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-3 text-center w-10">S.No</th>
                          <th className="py-3 px-4 whitespace-nowrap">Item Code</th>
                          <th className="py-3 px-4">Description</th>
                          <th className="py-3 px-4 text-center">Units</th>
                          <th className="py-3 px-4 text-right">Price</th>
                          <th className="py-3 px-4 text-right">Discount</th>
                          <th className="py-3 px-4 text-right">Tax</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {(viewing.items && viewing.items.length > 0) ? viewing.items.map((it, idx) => {
                          const sym = getCurrencySymbol(viewing.currency);
                          return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 text-center font-medium text-slate-500 w-10">{idx + 1}</td>
                            <td className="py-3 px-4 font-medium text-slate-600 whitespace-nowrap">{it.item_code || '—'}</td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-800">{it.item_name}</p>
                              {it.description && <p className="text-slate-500 text-[10px] mt-0.5">{it.description}</p>}
                            </td>
                            <td className="py-3 px-4 text-center font-medium">{it.quantity ?? ''} {it.unit || ''}</td>
                            <td className="py-3 px-4 text-right font-medium">{sym}{Number(it.rate || 0).toFixed(2)}</td>
                            <td className="py-3 px-4 text-right font-medium">{it.discount ? `${it.discount}%` : '0.00'}</td>
                            <td className="py-3 px-4 text-right font-medium">{it.taxRate ? `${it.taxRate}%` : '0.00'}</td>
                            <td className="py-3 px-4 text-right font-bold text-slate-900">{sym}{Number(it.amount || 0).toFixed(2)}</td>
                          </tr>
                        )}) : (
                          <tr><td colSpan="8" className="py-4 text-center text-slate-400 italic">No line items.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Subtotal & Total Amount */}
                  <div className="space-y-2 pt-2 text-sm">
                    {(() => {
                      const sym = getCurrencySymbol(viewing.currency);
                      const subtotal = Number(viewing.subtotal || (viewing.items || []).reduce((sum, item) => sum + Number(item.amount || 0), 0));
                      const discountAmount = Number(viewing.discount || 0);
                      const taxAmount = Number(viewing.tax_amount || (viewing.items || []).reduce((sum, item) => sum + (Number(item.amount || 0) * (Number(item.taxRate || 0) / 100)), 0));
                      
                      return (
                        <>
                          <div className="flex justify-between items-center text-slate-600">
                            <span>Subtotal</span>
                            <span>{sym}{subtotal.toFixed(2)}</span>
                          </div>
                          {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-rose-500">
                              <span>Discount ({discountAmount}%)</span>
                              <span>-{sym}{((subtotal * discountAmount) / 100).toFixed(2)}</span>
                            </div>
                          )}
                          {taxAmount > 0 && (
                            <div className="flex justify-between items-center text-slate-600">
                              <span>GST / Tax</span>
                              <span>{sym}{taxAmount.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 border-t border-slate-200 pt-4 mt-2">
                            <span>Total Amount</span>
                            <span className="text-xl text-indigo-600">{sym}{Number(viewing.amount || 0).toFixed(2)}</span>
                          </div>
                          {viewing.status === 'Partially Paid' && (
                            <>
                              <div className="flex justify-between items-center text-sm font-medium text-emerald-600 pt-2">
                                <span>Amount Paid</span>
                                <span>{sym}{(Number(viewing.amount || 0) - Number(viewing.due_amount || 0)).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-extrabold text-rose-600 pt-2">
                                <span>Balance Due</span>
                                <span>{sym}{Number(viewing.due_amount || 0).toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Late Payment Fee / Notes Box */}
                  <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
                    <p className="font-medium whitespace-pre-wrap">
                      {viewing.notes || 'Note: There will be a late payment fee of 10% per annum calculated daily for payments received after the due date.'}
                    </p>
                  </div>

                  {/* Payment Method / Bank Details */}
                  <div className="pt-4 border-t border-slate-100 text-xs space-y-1.5">
                    <p className="font-bold text-slate-900 text-sm">Payment Method</p>
                    <p className="text-slate-600 font-medium">{viewing.payment_method || 'EFT Bank Transfer'}</p>
                    <p className="text-slate-500">Account Name : <span className="font-semibold text-slate-700">{viewing.bank_account_name || companyName}</span></p>
                    <p className="text-slate-500">Code / BSB : <span className="font-semibold text-slate-700">{viewing.bank_code || '—'}</span></p>
                    <p className="text-slate-500">Account Number : <span className="font-semibold text-slate-700">{viewing.account_number || '—'}</span></p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}