import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, CheckCircle, Clock, Download, Printer, Mail, Trash2, PlusCircle, Sparkles, ChevronDown, ArrowLeft, CreditCard, Receipt, Landmark, ExternalLink } from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

const statusStyle = {
  Paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
  Pending: { bg: 'bg-amber-500/10', text: 'text-amber-600' },
  'Partially Paid': { bg: 'bg-sky-500/10', text: 'text-sky-600' },
  Overdue: { bg: 'bg-rose-500/10', text: 'text-rose-600' },
  Cancelled: { bg: 'bg-slate-200/60 dark:bg-slate-700/40', text: 'text-slate-500' },
};

const STATUSES = ['Pending', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

const createEmptyItem = () => ({ description: '', hsn: '', quantity: 1, price: '', discount: '', taxRate: '' });

const TAX_OPTIONS = [
  { key: 'NO', label: 'No Tax', rate: 0 },
  { key: 'GST5', label: 'GST 5% (CGST 2.5% + SGST 2.5%)', rate: 5 },
  { key: 'GST12', label: 'GST 12% (CGST 6% + SGST 6%)', rate: 12 },
  { key: 'GST18', label: 'GST 18% (CGST 9% + SGST 9%)', rate: 18 },
  { key: 'GST28', label: 'GST 28% (CGST 14% + SGST 14%)', rate: 28 },
];

const DEFAULT_NOTE = 'There will be a late payment fee of 10% per annum calculated daily for payments received after the due date.';

function AccordionSection({ title, open, onToggle, children }) {
  return <section className="overflow-hidden rounded-xl border border-slate-200/70 bg-white dark:border-slate-700 dark:bg-slate-900/50">
    <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-bold text-slate-700 dark:text-slate-100">
      {title}<ChevronDown size={17} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="border-t border-slate-100 p-4 dark:border-slate-800">{children}</div>}
  </section>;
}

const buildInitialForm = () => ({
  clientSelection: 'custom',
  invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
  myName: 'Aminoid Labs',
  myEmail: 'billing@aminoid.app',
  myAddress: '12, Business Avenue, Dubai, UAE',
  myPhone: '+971 50 123 4567',
  clientName: 'Acme Holdings',
  clientEmail: 'accounts@acme.com',
  clientAddress: '88 Sheikh Zayed Road, Dubai',
  projectName: 'Website Redesign',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  taxStatus: 'No Tax',
  taxStatus: 'GST18',
  taxRate: 18,
  taxAmount: 0,
  status: 'Pending',
  items: [createEmptyItem()],
  discountPercent: 0,
  amountPaid: 0,
  notes: DEFAULT_NOTE,
  paymentMethod: 'EFT Bank Transfer',
  accountName: 'Aminoid Labs',
  bankCode: '123456',
  accountNumber: '9876543210',
});

export default function Invoices() {
  const navigate = useNavigate();
  const { symbol, companyLogo, companyName, companyAddress, companyEmail, companyPhone, companyWebsite, companyTaxId } = useCurrency();
  const [invoices, setInvoices] = useState([]);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [invoiceTab, setInvoiceTab] = useState('all'); // 'all' | 'account' | 'sales'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(buildInitialForm);
  const [editingId, setEditingId] = useState(null);
  const [openSections, setOpenSections] = useState({ my: false, client: false, invoice: true, payment: false });
  const previewRef = React.useRef(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const detailRef = React.useRef(null);
  const [paymentModal, setPaymentModal] = useState(null); // { invoice, amountPaid }
  const [savingPayment, setSavingPayment] = useState(false);

  const fmtMoney = (n) => `${symbol}${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const [companyInfo, setCompanyInfo] = useState({});

  const loadInvoices = async () => {
    try {
      const res = await api.get('/api/accounts/invoices');
      setInvoices(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setInvoices([]);
    }
  };

  const loadSalesInvoices = async () => {
    try {
      const res = await api.get('/api/sales/invoices');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setSalesInvoices(list);
    } catch {
      setSalesInvoices([]);
    }
  };

  useEffect(() => {
    loadInvoices().finally(() => setLoading(false));
    loadSalesInvoices();
    api.get('/api/setup/company').then(r => setCompanyInfo(r.data || {})).catch(() => {});
    api.get('/api/marketing/leads').then(r => setLeads(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, []);

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;
    form.items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      const taxRate = Number(item.taxRate) || 0;
      const amt = qty * price;
      const afterDisc = amt - (amt * (discount / 100));
      subtotal += afterDisc;
      taxAmount += afterDisc * (taxRate / 100);
    });
    // Global/overall discount is entered as a % of the subtotal.
    const discountPercent = Number(form.discountPercent || 0);
    const globalDiscount = subtotal * (discountPercent / 100);
    const total = subtotal - globalDiscount + taxAmount;
    const amountPaid = Number(form.amountPaid || 0);
    const balanceDue = Math.max(total - amountPaid, 0);
    return { subtotal, taxAmount, globalDiscount, discountPercent, total, amountPaid, balanceDue };
  }, [form.items, form.discountPercent, form.amountPaid]);

  const filtered = invoices.filter((inv) => {
    const clientText = `${inv.client || ''} ${inv.id || ''}`.toLowerCase();
    return clientText.includes(search.toLowerCase());
  });

  const filteredSales = salesInvoices.filter((inv) => {
    const clientText = `${inv.account_name || ''} ${inv.invoice_no || ''}`.toLowerCase();
    return clientText.includes(search.toLowerCase());
  });

  const totalPaid = invoices.reduce((s, i) => s + (i.amount_paid != null ? Number(i.amount_paid) : (i.status === 'Paid' ? Number(i.amount || 0) : 0)), 0);
  const totalOwed = invoices
    .filter((i) => ['Pending', 'Overdue', 'Partially Paid'].includes(i.status))
    .reduce((s, i) => s + (i.balance_due != null ? Number(i.balance_due) : Number(i.amount || 0)), 0);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => setForm((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  const removeItem = (index) => setForm((prev) => ({ ...prev, items: prev.items.filter((_, itemIndex) => itemIndex !== index) }));

  const resetForm = () => {
    setEditingId(null);
    setForm(buildInitialForm());
  };

  const handleSelectInvoice = (invoice) => {
    setEditingId(invoice.id);
    const items = Array.isArray(invoice.items) && invoice.items.length ? invoice.items : [createEmptyItem()];
    setForm((prev) => ({
      ...prev,
      invoiceNumber: invoice.invoice_number || invoice.id?.slice(0, 8).toUpperCase() || prev.invoiceNumber,
      projectName: invoice.project_name || prev.projectName,
      clientSelection: 'custom',
      clientName: invoice.client || prev.clientName,
      clientEmail: invoice.client_email || prev.clientEmail,
      clientAddress: invoice.client_address || prev.clientAddress,
      myName: invoice.my_name || prev.myName,
      myEmail: invoice.my_email || prev.myEmail,
      myAddress: invoice.my_address || prev.myAddress,
      myPhone: invoice.my_phone || prev.myPhone,
      issueDate: invoice.issue_date?.slice(0, 10) || prev.issueDate,
      dueDate: invoice.due_date?.slice(0, 10) || prev.dueDate,
      status: invoice.status || prev.status,
      items,
      discountPercent: invoice.discount_percent != null ? Number(invoice.discount_percent) : prev.discountPercent,
      amountPaid: invoice.amount_paid != null ? Number(invoice.amount_paid) : 0,
      notes: invoice.notes != null ? invoice.notes : prev.notes,
      paymentMethod: invoice.payment_method || prev.paymentMethod,
      accountName: invoice.account_name || prev.accountName,
      bankCode: invoice.bank_code || prev.bankCode,
      accountNumber: invoice.account_number || prev.accountNumber,
    }));
    setOpenSections((current) => ({ ...current, invoice: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const opt = TAX_OPTIONS.find(t => t.key === form.taxStatus) || TAX_OPTIONS[0];
      // Derive status from payment progress unless the user explicitly chose one.
      const amountPaidNum = Number(form.amountPaid || 0);
      let derivedStatus = form.status;
      if (amountPaidNum > 0 && amountPaidNum < totals.total) derivedStatus = 'Partially Paid';
      else if (amountPaidNum >= totals.total && totals.total > 0) derivedStatus = 'Paid';
      const payload = {
        client: form.clientName,
        clientEmail: form.clientEmail,
        clientAddress: form.clientAddress,
        myName: form.myName,
        myEmail: form.myEmail,
        myAddress: form.myAddress,
        myPhone: form.myPhone,
        invoiceNumber: form.invoiceNumber,
        projectName: form.projectName,
        issueDate: form.issueDate,
        items: form.items,
        amount: totals.total,
        subtotal: totals.subtotal,
        discountPercent: totals.discountPercent,
        discount: totals.globalDiscount,
        taxStatus: form.taxStatus,
        tax_rate: opt.rate,
        tax_amount: totals.taxAmount,
        dueDate: form.dueDate,
        status: derivedStatus,
        amountPaid: amountPaidNum,
        notes: form.notes,
        payment_method: form.paymentMethod,
        account_name: form.accountName,
        bank_code: form.bankCode,
        account_number: form.accountNumber,
      };

      if (editingId) {
        await api.put(`/api/accounts/invoices/${editingId}`, payload);
      } else {
        await api.post('/api/accounts/invoices', payload);
      }
      await loadInvoices();
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    await api.delete(`/api/accounts/invoices/${id}`);
    await loadInvoices();
  };

  const openPaymentModal = (invoice) => {
    setPaymentModal({ invoice, amountPaid: invoice.amount_paid != null ? Number(invoice.amount_paid) : '' });
  };

  const handleRecordPayment = async () => {
    if (!paymentModal?.invoice) return;
    setSavingPayment(true);
    try {
      const res = await api.patch(`/api/accounts/invoices/${paymentModal.invoice.id}/payment`, {
        amountPaid: Number(paymentModal.amountPaid) || 0,
      });
      await loadInvoices();
      // Keep the detail modal in sync if it's open for this invoice.
      if (viewingInvoice?.id === paymentModal.invoice.id && res?.data) {
        setViewingInvoice(res.data);
      }
      setPaymentModal(null);
    } catch (err) {
      alert('Failed to record payment: ' + (err?.message || 'Unknown error'));
    } finally {
      setSavingPayment(false);
    }
  };

  // Rows per page for the paginated exports below. First page has less room
  // (header + from/billed-to sit above the table). Tweak if rows still
  // overflow/leave gaps for your row-height.
  const DETAIL_ITEMS_FIRST_PAGE = 10;
  const DETAIL_ITEMS_PER_PAGE = 10;

  const paginateItemsFor = (items, firstPageCount, perPageCount) => {
    const list = items || [];
    if (list.length <= firstPageCount) return [list];
    const pages = [list.slice(0, firstPageCount)];
    let rest = list.slice(firstPageCount);
    while (rest.length) {
      pages.push(rest.slice(0, perPageCount));
      rest = rest.slice(perPageCount);
    }
    return pages;
  };

  // Builds ONE printable page (header + a chunk of items + footer) as an HTML
  // string for the Invoice Detail modal. Header/footer markup is identical on
  // every page; notes/totals/payment method only render on the last page.
  const buildDetailPageHtml = (inv, pageItems, pageNo, totalPages) => {
    const isFirst = pageNo === 1;
    const isLast = pageNo === totalPages;

    const subtotal = (inv.items || []).reduce((s, it) => {
      const base = (Number(it.quantity) || 0) * (Number(it.price) || 0);
      return s + (base - base * ((Number(it.discount) || 0) / 100));
    }, 0);
    const taxTotal = (inv.items || []).reduce((s, it) => {
      const base = (Number(it.quantity) || 0) * (Number(it.price) || 0);
      const afterDisc = base - base * ((Number(it.discount) || 0) / 100);
      return s + afterDisc * ((Number(it.taxRate) || 0) / 100);
    }, 0);
    const discountPercent = Number(inv.discount_percent || 0);
    const globalDiscount = discountPercent > 0 ? subtotal * (discountPercent / 100) : Number(inv.discount || 0);
    const grandTotal = subtotal - globalDiscount + taxTotal;
    const amountPaid = Number(inv.amount_paid || 0);
    const balanceDue = inv.balance_due != null ? Number(inv.balance_due) : Math.max(grandTotal - amountPaid, 0);

    const startIndex = pageNo === 1 ? 0 : DETAIL_ITEMS_FIRST_PAGE + (pageNo - 2) * DETAIL_ITEMS_PER_PAGE;
    const rowsHtml = pageItems.map((it, idx) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      const disc = Number(it.discount) || 0;
      const taxR = Number(it.taxRate || it.tax_rate) || 0;
      const base = qty * price;
      const afterDisc = base - base * (disc / 100);
      const amount = afterDisc + afterDisc * (taxR / 100);
      return `
        <tr>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;color:#64748b;width:40px;">${startIndex + idx + 1}</td>
          <td style="padding:12px;border:1px solid #e5e7eb;font-weight:600;color:#0f172a;white-space:nowrap;">
            <div>${it.description || 'Service item'}</div>
            ${it.hsn ? `<div style="font-size:10px;color:#94a3b8;">${it.hsn}</div>` : ''}
          </td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;color:#475569;">${qty || 1}</td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;color:#475569;">${fmtMoney(price)}</td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;color:#475569;">${disc.toFixed(2)}%</td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:center;color:#475569;">${taxR.toFixed(2)}%</td>
          <td style="padding:12px;border:1px solid #e5e7eb;text-align:right;font-weight:700;color:#0f172a;">${fmtMoney(amount)}</td>
        </tr>`;
    }).join('');

    const fromToHtml = isFirst ? `
      <div style="display:flex;justify-content:space-between;gap:32px;margin-bottom:24px;">
        <div style="flex:1;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">From</div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;">${inv.my_name || companyInfo?.company_name || ''}</div>
          <div style="font-size:12px;color:#475569;line-height:1.7;">${inv.my_address || ''}</div>
          <div style="font-size:12px;color:#3b82f6;">${inv.my_email || ''}</div>
          <div style="font-size:12px;color:#475569;">${inv.my_phone || ''}</div>
        </div>
        <div style="flex:1;text-align:right;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Billed To</div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:3px;">${inv.client || ''}</div>
          ${inv.client_email ? `<div style="font-size:12px;color:#3b82f6;margin-bottom:3px;">${inv.client_email}</div>` : ''}
          <div style="font-size:12px;color:#475569;line-height:1.7;">${inv.client_address || ''}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px;">Due Date: ${fmtDate(inv.due_date)}</div>
        </div>
      </div>` : '';

    const footerBlockHtml = isLast ? `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:24px;gap:40px;">
        <div style="flex:1;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-size:11px;color:#64748b;white-space:pre-wrap;">
          <span style="font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">Note</span>
          ${inv.notes || DEFAULT_NOTE}
        </div>
        <div style="width:280px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#475569;">
            <span>Subtotal</span><span style="color:#3b82f6;font-weight:600;">${fmtMoney(subtotal)}</span>
          </div>
          ${globalDiscount > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#ef4444;"><span>Discount${discountPercent > 0 ? ` (${discountPercent}%)` : ''}</span><span>- ${fmtMoney(globalDiscount)}</span></div>` : ''}
          ${taxTotal > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#475569;"><span>Tax</span><span>${fmtMoney(taxTotal)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #e5e7eb;margin-top:8px;">
            <span style="font-weight:800;font-size:15px;color:#0f172a;">Total Amount</span><span style="font-weight:800;font-size:17px;color:#4f46e5;">${fmtMoney(grandTotal)}</span>
          </div>
          ${amountPaid > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#059669;font-weight:700;"><span>Amount Paid</span><span>${fmtMoney(amountPaid)}</span></div>` : ''}
          ${amountPaid > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#ef4444;font-weight:700;"><span>Balance Due</span><span>${fmtMoney(balanceDue)}</span></div>` : ''}
        </div>
      </div>
      <div style="font-size:13px;margin-top:20px;">
        <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:8px;">Payment Method</div>
        <div style="color:#475569;line-height:1.8;font-size:12px;">
          <div>${inv.payment_method || 'EFT Bank Transfer'}</div>
          <div>Account Name : <strong>${inv.account_name || '—'}</strong></div>
          <div>Code / BSB : ${inv.bank_code || '—'}</div>
          <div>Account Number : ${inv.account_number || '—'}</div>
        </div>
      </div>` : '';

    return `
    <div class="invoice-print-page" style="background:#ffffff;padding:40px;${pageNo > 1 ? 'padding-top:80px;' : ''}font-family:'Inter','Segoe UI',Arial,sans-serif;color:#1a1a2e;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div>
          ${companyInfo?.company_logo ? `<img src="${companyInfo.company_logo}" alt="logo" style="height:48px;margin-bottom:6px;object-fit:contain;" />` : ''}
          <div style="font-weight:900;font-size:20px;color:#0f172a;letter-spacing:-0.5px;">${inv.my_name || companyInfo?.company_name || 'AMINOID'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:900;font-size:26px;color:#0f172a;letter-spacing:-1px;">Invoice</div>
          <div style="color:#64748b;font-size:13px;margin-top:2px;">#${inv.invoice_number || String(inv.id || '').slice(0, 8).toUpperCase()}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</div>
        </div>
      </div>
      <hr style="border-color:#e5e7eb;margin:16px 0;" />
      ${isFirst ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <div>
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Project / Reference</div>
          <div style="font-weight:700;font-size:14px;color:#0f172a;">${inv.project_name || inv.projectName || '—'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Issued Date</div>
          <div style="font-weight:700;font-size:14px;color:#0f172a;">${fmtDate(inv.issue_date || inv.created_at)}</div>
        </div>
      </div>
      <hr style="border-color:#e5e7eb;margin:16px 0;" />` : ''}
      ${fromToHtml}
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;width:36px;">S.No</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:left;white-space:nowrap;">Description</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;">Units</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:right;">Price</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;">Discount</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;">GST / Tax</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#94a3b8;border:1px solid #e5e7eb;">No line items.</td></tr>'}</tbody>
      </table>
      ${footerBlockHtml}
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;">
        <span>${inv.my_name || companyInfo?.company_name || ''}</span>
        <span>#${inv.invoice_number || ''}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</span>
      </div>
    </div>`;
  };

  const handleDetailDownload = async (invArg) => {
    const inv = invArg || viewingInvoice;
    if (!inv) return;
    try {
      const pages = paginateItemsFor(inv.items, DETAIL_ITEMS_FIRST_PAGE, DETAIL_ITEMS_PER_PAGE);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '760px';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildDetailPageHtml(inv, pages[i], i + 1, pages.length);
        const pageNode = holder.firstElementChild;
        const imgData = await toPng(pageNode, { backgroundColor: '#ffffff', pixelRatio: 2, style: { borderRadius: '0px' } });
        const img = new Image();
        img.src = imgData;
        await new Promise(r => { img.onload = r; });
        const renderHeight = (img.height * pdfWidth) / img.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(renderHeight, pdfPageHeight));
      }

      document.body.removeChild(holder);
      pdf.save(`${inv.invoice_number || 'invoice'}.pdf`);
    } catch (e) {
      console.error('Detail download failed:', e);
      alert('Failed to generate PDF: ' + e.message);
    }
  };

  const handleDetailPrint = async (invArg) => {
    const inv = invArg || viewingInvoice;
    if (!inv) { window.print(); return; }
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const pages = paginateItemsFor(inv.items, DETAIL_ITEMS_FIRST_PAGE, DETAIL_ITEMS_PER_PAGE);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '760px';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildDetailPageHtml(inv, pages[i], i + 1, pages.length);
        const pageNode = holder.firstElementChild;
        const imgData = await toPng(pageNode, { backgroundColor: '#ffffff', pixelRatio: 2, style: { borderRadius: '0px' } });
        const img = new Image();
        img.src = imgData;
        await new Promise(r => { img.onload = r; });
        const renderHeight = (img.height * pdfWidth) / img.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(renderHeight, pdfPageHeight));
      }

      document.body.removeChild(holder);
      
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    } catch (e) {
      console.error('Detail print failed:', e);
      alert('Failed to print: ' + e.message);
    }
  };

  // ── Sales Invoice quick print/download (used by the Sales Invoices card
  // list on this page). Sales invoices use a different field schema
  // (invoice_no, account_name, items[].rate, etc.) so they get their own
  // lightweight page builder rather than reusing buildDetailPageHtml.
  const fetchFullSalesInvoice = async (invoice) => {
    if (invoice?.items && invoice.items.length) return invoice;
    try {
      const res = await api.get('/api/sales/invoices/' + invoice.id);
      return res?.data || invoice;
    } catch {
      return invoice;
    }
  };

  const buildSalesInvoicePageHtml = (inv, pageItems, pageNo, totalPages) => {
    const isFirst = pageNo === 1;
    const isLast = pageNo === totalPages;
    const startIndex = pageNo === 1 ? 0 : DETAIL_ITEMS_FIRST_PAGE + (pageNo - 2) * DETAIL_ITEMS_PER_PAGE;
    const rowsHtml = pageItems.map((it, idx) => `
      <tr>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#64748b;width:36px;font-size:11px;">${startIndex + idx + 1}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;font-weight:600;color:#0f172a;white-space:nowrap;font-size:11px;">
          <div>${it.item_name || it.description || 'Item'}</div>
          ${it.description && it.item_name ? `<div style="font-size:10px;color:#94a3b8;">${it.description}</div>` : ''}
        </td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#475569;font-size:11px;">${it.quantity ?? 1} ${it.unit || ''}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:right;color:#475569;font-size:11px;">${fmtMoney(it.rate || 0)}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#475569;font-size:11px;">${it.discount ? `${it.discount}%` : '0.00%'}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#475569;font-size:11px;">${it.taxRate ? `${it.taxRate}%` : '0.00%'}</td>
        <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:right;font-weight:700;color:#0f172a;font-size:11px;">${fmtMoney(it.amount || 0)}</td>
      </tr>`).join('');

    const subtotal = Number(inv.subtotal || (inv.items || []).reduce((s, i) => s + Number(i.amount || 0), 0));
    const discountAmount = Number(inv.discount || 0);
    const taxAmount = Number(inv.tax_amount || (inv.items || []).reduce((s, i) => s + (Number(i.amount || 0) * (Number(i.taxRate || 0) / 100)), 0));

    const fromToHtml = isFirst ? `
      <div style="display:flex;justify-content:space-between;gap:32px;margin-bottom:24px;">
        <div style="flex:1;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">From</div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;">${companyInfo?.company_name || companyName || ''}</div>
          <div style="font-size:12px;color:#475569;">${companyInfo?.company_email || companyEmail || ''}</div>
        </div>
        <div style="flex:1;text-align:right;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Billed To</div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:3px;">${inv.account_name || 'Customer'}</div>
          <div style="font-size:12px;color:#475569;line-height:1.7;">${inv.billing_address || ''}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px;">Due Date: ${fmtDate(inv.due_date)}</div>
        </div>
      </div>` : '';

    const footerBlockHtml = isLast ? `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:24px;gap:40px;">
        <div style="flex:1;background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-size:11px;color:#64748b;white-space:pre-wrap;">
          <span style="font-weight:700;color:#0f172a;display:block;margin-bottom:6px;">Note</span>
          ${inv.notes || DEFAULT_NOTE}
        </div>
        <div style="width:280px;flex-shrink:0;">
          <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#475569;">
            <span>Subtotal</span><span style="color:#3b82f6;font-weight:600;">${fmtMoney(subtotal)}</span>
          </div>
          ${discountAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#ef4444;"><span>Discount</span><span>- ${fmtMoney((subtotal * discountAmount) / 100)}</span></div>` : ''}
          ${taxAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#475569;"><span>Tax</span><span>${fmtMoney(taxAmount)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #e5e7eb;margin-top:8px;">
            <span style="font-weight:800;font-size:15px;color:#0f172a;">Total Amount</span><span style="font-weight:800;font-size:17px;color:#4f46e5;">${fmtMoney(inv.amount || 0)}</span>
          </div>
          ${Number(inv.due_amount || 0) > 0 ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#ef4444;font-weight:700;"><span>Balance Due</span><span>${fmtMoney(inv.due_amount || 0)}</span></div>` : ''}
        </div>
      </div>
      <div style="font-size:13px;margin-top:20px;">
        <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:8px;">Payment Method</div>
        <div style="color:#475569;line-height:1.8;font-size:12px;">
          <div>${inv.payment_method || 'EFT Bank Transfer'}</div>
          <div>Account Name : <strong>${inv.bank_account_name || companyName || '—'}</strong></div>
          <div>Code / BSB : ${inv.bank_code || '—'}</div>
          <div>Account Number : ${inv.account_number || '—'}</div>
        </div>
      </div>` : '';

    return `
    <div class="invoice-print-page" style="background:#ffffff;padding:40px;${pageNo > 1 ? 'padding-top:80px;' : ''}font-family:'Inter','Segoe UI',Arial,sans-serif;color:#1a1a2e;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div>
          ${companyInfo?.company_logo ? `<img src="${companyInfo.company_logo}" alt="logo" style="height:48px;margin-bottom:6px;object-fit:contain;" />` : ''}
          <div style="font-weight:900;font-size:20px;color:#0f172a;letter-spacing:-0.5px;">${companyInfo?.company_name || companyName || 'AMINOID'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:900;font-size:26px;color:#0f172a;letter-spacing:-1px;">Invoice</div>
          <div style="color:#64748b;font-size:13px;margin-top:2px;">#${inv.invoice_no || String(inv.id || '').slice(0, 8).toUpperCase()}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</div>
        </div>
      </div>
      <hr style="border-color:#e5e7eb;margin:16px 0;" />
      ${fromToHtml}
      <table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:8px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;width:36px;">S.No</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:left;white-space:nowrap;">Description</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;">Units</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:right;">Price</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;">Discount</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:center;">GST / Tax</th>
            <th style="padding:8px 10px;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;border:1px solid #e5e7eb;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#94a3b8;border:1px solid #e5e7eb;">No line items.</td></tr>'}</tbody>
      </table>
      ${footerBlockHtml}
    </div>`;
  };

  const handleSalesCardPrint = async (invoice) => {
    const inv = await fetchFullSalesInvoice(invoice);
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const pages = paginateItemsFor(inv.items, DETAIL_ITEMS_FIRST_PAGE, DETAIL_ITEMS_PER_PAGE);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '760px';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildSalesInvoicePageHtml(inv, pages[i], i + 1, pages.length);
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
      
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    } catch (e) {
      console.error('Sales invoice print failed:', e);
      alert('Failed to print: ' + e.message);
    }
  };

  const handleSalesCardDownload = async (invoice) => {
    const inv = await fetchFullSalesInvoice(invoice);
    try {
      const pages = paginateItemsFor(inv.items, DETAIL_ITEMS_FIRST_PAGE, DETAIL_ITEMS_PER_PAGE);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '760px';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildSalesInvoicePageHtml(inv, pages[i], i + 1, pages.length);
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
    } catch (e) {
      console.error('Sales invoice download failed:', e);
      alert('Failed to generate PDF: ' + e.message);
    }
  };

  // Builds ONE printable page (header + a chunk of items + footer) as an HTML
  // string for the "Live Invoice Preview" form editor. Header/footer markup
  // is identical on every page; totals/notes/payment method only render on
  // the last page.
  const buildFormPageHtml = (pageItems, pageNo, totalPages) => {
    const isFirst = pageNo === 1;
    const isLast = pageNo === totalPages;

    const startIndexForm = pageNo === 1 ? 0 : DETAIL_ITEMS_FIRST_PAGE + (pageNo - 2) * DETAIL_ITEMS_PER_PAGE;
    const rowsHtml = pageItems.map((item, idx) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const discPct = Number(item.discount) || 0;
      const taxPct = Number(item.taxRate) || 0;
      const base = qty * price;
      const afterDisc = base - base * (discPct / 100);
      const taxAmt = afterDisc * (taxPct / 100);
      const total = afterDisc + taxAmt;
      return `
        <tr>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#64748b;width:36px;font-size:11px;">${startIndexForm + idx + 1}</td>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;color:#0f172a;font-weight:600;white-space:nowrap;font-size:11px;">
            <div>${item.description || 'Service item'}</div>
            ${item.hsn ? `<div style="font-size:10px;color:#94a3b8;margin-top:2px;">${item.hsn}</div>` : ''}
          </td>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#475569;font-size:11px;">${qty || 1}</td>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:right;color:#475569;font-size:11px;">${fmtMoney(price)}</td>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#475569;font-size:11px;">${discPct.toFixed(2)}%</td>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:center;color:#475569;font-size:11px;">${taxPct.toFixed(2)}%</td>
          <td style="padding:8px 10px;border:1px solid #e5e7eb;text-align:right;font-weight:700;color:#0f172a;font-size:11px;">${fmtMoney(total)}</td>
        </tr>`;
    }).join('');

    const metaHtml = isFirst ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
        <div>
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Project / Reference</div>
          <div style="font-weight:700;font-size:14px;color:#0f172a;">${form.projectName || '—'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Issued Date</div>
          <div style="font-weight:700;font-size:14px;color:#0f172a;">${fmtDate(form.issueDate)}</div>
        </div>
      </div>
      <hr style="border-color:#e5e7eb;border-top-width:1px;border-style:solid;margin:20px 0;" />
      <div style="display:flex;justify-content:space-between;margin-bottom:28px;gap:32px;">
        <div style="flex:1;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">From</div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:3px;">${form.myName || ''}</div>
          <div style="font-size:12px;color:#475569;line-height:1.7;">${form.myAddress || ''}</div>
          ${form.myAbn ? `<div style="font-size:12px;color:#475569;">${form.myAbn}</div>` : ''}
          <div style="font-size:12px;color:#3b82f6;">${form.myEmail || ''}</div>
          <div style="font-size:12px;color:#475569;">${form.myPhone || ''}</div>
          ${form.myWebsite ? `<div style="font-size:12px;color:#3b82f6;">${form.myWebsite}</div>` : ''}
        </div>
        <div style="text-align:right;flex:1;">
          <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Billed To</div>
          <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:3px;">${form.clientName || ''}</div>
          ${form.clientEmail ? `<div style="font-size:12px;color:#3b82f6;margin-bottom:3px;">${form.clientEmail}</div>` : ''}
          <div style="font-size:12px;color:#475569;line-height:1.7;">${form.clientAddress || ''}</div>
          <div style="font-size:12px;color:#475569;margin-top:4px;">Due Date: ${fmtDate(form.dueDate)}</div>
        </div>
      </div>` : `<div style="height:8px;"></div>`;

    const footerBlockHtml = isLast ? `
      <div style="display:flex;justify-content:flex-end;margin-top:16px;margin-bottom:8px;">
        <div style="min-width:220px;">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569;">
            <span>Subtotal</span><span style="color:#3b82f6;font-weight:600;">${fmtMoney(totals.subtotal)}</span>
          </div>
          ${totals.globalDiscount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#ef4444;"><span>Discount (${totals.discountPercent}%)</span><span>- ${fmtMoney(totals.globalDiscount)}</span></div>` : ''}
          ${totals.taxAmount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#475569;"><span>Tax</span><span>${fmtMoney(totals.taxAmount)}</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #e5e7eb;margin-top:8px;">
            <span style="font-weight:800;font-size:15px;color:#0f172a;">Total Amount</span><span style="font-weight:800;font-size:17px;color:#4f46e5;">${fmtMoney(totals.total)}</span>
          </div>
          ${totals.amountPaid > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#059669;"><span>Amount Paid</span><span>${fmtMoney(totals.amountPaid)}</span></div>` : ''}
          ${totals.amountPaid > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#ef4444;font-weight:700;"><span>Balance Due</span><span>${fmtMoney(totals.balanceDue)}</span></div>` : ''}
        </div>
      </div>
      ${(form.notes ?? '').trim() ? `<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;font-size:11px;color:#64748b;margin:28px 0;text-align:center;white-space:pre-wrap;">Note: ${form.notes}</div>` : ''}
      <div style="font-size:13px;">
        <div style="font-weight:800;font-size:14px;color:#0f172a;margin-bottom:8px;">Payment Method</div>
        <div style="color:#475569;line-height:1.8;font-size:12px;">
          <div>${form.paymentMethod || 'EFT Bank Transfer'}</div>
          <div>Account Name : <strong>${form.accountName || '—'}</strong></div>
          <div>Code / BSB : ${form.bankCode || '—'}</div>
          <div>Account Number : ${form.accountNumber || '—'}</div>
        </div>
      </div>` : '';

    return `
    <div class="invoice-print-page" style="background:#ffffff;padding:40px;${pageNo > 1 ? 'padding-top:80px;' : ''}font-family:'Inter','Segoe UI',Arial,sans-serif;color:#1a1a2e;width:100%;box-sizing:border-box;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;">
        <div>
          ${companyInfo?.company_logo ? `<img src="${companyInfo.company_logo}" alt="logo" style="height:48px;margin-bottom:6px;object-fit:contain;" />` : ''}
          <div style="font-weight:900;font-size:22px;color:#0f172a;letter-spacing:-0.5px;">${companyInfo?.company_name || form.myName || 'AMINOID'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:900;font-size:28px;color:#0f172a;letter-spacing:-1px;">Invoice</div>
          <div style="color:#64748b;font-size:13px;margin-top:2px;">#${form.invoiceNumber || ''}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</div>
        </div>
      </div>
      <hr style="border-color:#e5e7eb;border-top-width:1px;border-style:solid;margin:20px 0;" />
      ${metaHtml}
      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:11px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 10px;text-align:center;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;width:36px;">S.No</th>
            <th style="padding:8px 10px;text-align:left;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;white-space:nowrap;">Description</th>
            <th style="padding:8px 10px;text-align:center;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;">Units</th>
            <th style="padding:8px 10px;text-align:right;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;">Price</th>
            <th style="padding:8px 10px;text-align:center;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;">Discount</th>
            <th style="padding:8px 10px;text-align:center;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;">GST / Tax</th>
            <th style="padding:8px 10px;text-align:right;font-weight:700;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:0.05em;border:1px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>${rowsHtml || '<tr><td colspan="7" style="padding:20px;text-align:center;color:#94a3b8;border:1px solid #e5e7eb;">No line items.</td></tr>'}</tbody>
      </table>
      ${footerBlockHtml}
      <div style="margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;">
        <span>${companyInfo?.company_name || form.myName || ''}</span>
        <span>#${form.invoiceNumber || ''}${totalPages > 1 ? ` &middot; Page ${pageNo} of ${totalPages}` : ''}</span>
      </div>
    </div>`;
  };

  const handleDownload = async () => {
    try {
      const pages = paginateItemsFor(form.items, DETAIL_ITEMS_FIRST_PAGE, DETAIL_ITEMS_PER_PAGE);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '800px';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildFormPageHtml(pages[i], i + 1, pages.length);
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
      pdf.save(`${form.invoiceNumber || 'invoice'}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handlePrint = async () => {
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const pages = paginateItemsFor(form.items, DETAIL_ITEMS_FIRST_PAGE, DETAIL_ITEMS_PER_PAGE);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const holder = document.createElement('div');
      holder.style.position = 'fixed';
      holder.style.left = '-99999px';
      holder.style.top = '0';
      holder.style.width = '800px';
      document.body.appendChild(holder);

      for (let i = 0; i < pages.length; i++) {
        holder.innerHTML = buildFormPageHtml(pages[i], i + 1, pages.length);
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
      
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
    } catch (error) {
      console.error('Print failed:', error);
      alert('Failed to print. Please try again.');
    }
  };

  const handleEmail = () => {
    const body = `Hello ${form.clientName || 'Client'},%0D%0A%0D%0AHere is your invoice ${form.invoiceNumber} for ${form.projectName || 'our services'}.%0D%0AAmount due: ${fmtMoney(totals.total)}.%0D%0AThanks,%0D%0A${companyInfo?.company_name || form.myName || 'Aminoid Labs'}`;
    window.open(`mailto:${form.clientEmail || ''}?subject=Invoice ${form.invoiceNumber}&body=${body}`);
  };

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
      <div className="mx-auto max-w-[1600px] space-y-6 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create polished invoices, track activity, and send them instantly.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetForm} className="btn-secondary flex items-center gap-2 text-sm">
              <Sparkles size={16} /> New Draft
            </button>
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2 text-sm" disabled={saving}>
              <Plus size={16} /> {saving ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-3xl p-5 order-3 xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Invoice List</h2>
                <p className="text-sm text-slate-500">Recent invoices and history</p>
              </div>
              <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{invoices.length + salesInvoices.length} Total</div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/70">
              <Search size={15} className="text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by client / account" className="w-full border-none bg-transparent text-sm outline-none dark:text-white" />
            </div>

            {/* ── Tabs: All / Account Invoices / Sales Invoices ── */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {[
                { key: 'all', label: 'All', count: filtered.length + filteredSales.length },
                { key: 'account', label: 'Account Invoices', count: filtered.length },
                { key: 'sales', label: 'Sales Invoices', count: filteredSales.length },
              ].map((tab) => {
                const active = invoiceTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setInvoiceTab(tab.key)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-amber-500 text-slate-900 shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                        active ? 'bg-slate-900/15 text-slate-900' : 'bg-slate-200/80 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── Group: Account Invoices ── */}
            {(invoiceTab === 'all' || invoiceTab === 'account') && <>
            <div className="mb-2 flex items-center gap-2">
              <Landmark size={15} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Account Invoices</h3>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{filtered.length}</span>
            </div>
            <div className="grid gap-2.5">
              {filtered.map((invoice, idx) => {
                const st = statusStyle[invoice.status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
                return (
                  <div key={invoice.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {idx + 1}
                        </span>
                        <button onClick={() => handleSelectInvoice(invoice)} className="text-left w-full min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{invoice.client || 'Untitled client'}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">#{invoice.invoice_number || invoice.id?.slice(0, 8).toUpperCase()}</p>
                        </button>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg} ${st.text}`}>
                        {invoice.status || 'Pending'}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{fmtDate(invoice.issue_date || invoice.created_at)}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{fmtMoney(invoice.amount || 0)}</span>
                    </div>
                    {Number(invoice.amount_paid || 0) > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-600 font-semibold">Paid {fmtMoney(invoice.amount_paid || 0)}</span>
                        <span className="text-rose-500 font-semibold">Due {fmtMoney(invoice.balance_due != null ? invoice.balance_due : Math.max((invoice.amount || 0) - (invoice.amount_paid || 0), 0))}</span>
                      </div>
                    )}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewingInvoice(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Preview">
                          <FileText size={13} />
                        </button>
                        <button onClick={() => handleDetailPrint(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Print">
                          <Printer size={13} />
                        </button>
                        <button onClick={() => handleDetailDownload(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Download">
                          <Download size={13} />
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
                          <button
                            onClick={() => openPaymentModal(invoice)}
                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard size={12} /> Record Payment
                          </button>
                        )}
                        <button onClick={() => handleSelectInvoice(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors" title="Edit">
                          <ArrowLeft size={13} className="rotate-180" />
                        </button>
                        <button onClick={() => handleDelete(invoice.id)} className="rounded-lg p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">No account invoices found.</div>}
            </div>
            </>}

            {/* ── Group: Sales Invoices ── */}
            {(invoiceTab === 'all' || invoiceTab === 'sales') && <>
            <div className="mt-6 mb-2 flex items-center gap-2">
              <Receipt size={15} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Sales Invoices</h3>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{filteredSales.length}</span>
            </div>
            <div className="grid gap-2.5">
              {filteredSales.map((invoice, idx) => {
                const st = statusStyle[invoice.status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
                const amountPaid = Number(invoice.amount || 0) - Number(invoice.due_amount || 0);
                return (
                  <div key={invoice.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-3.5 shadow-sm transition hover:border-emerald-400/40 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span className="mt-0.5 shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {idx + 1}
                        </span>
                        <button onClick={() => navigate('/sales/invoices')} className="text-left w-full min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{invoice.account_name || 'Untitled account'}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">#{invoice.invoice_no || invoice.id?.slice(0, 8).toUpperCase()}</p>
                        </button>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.bg} ${st.text}`}>
                        {invoice.status || 'Draft'}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{fmtDate(invoice.date)}</span>
                      <span className="font-bold text-slate-800 dark:text-white">{fmtMoney(invoice.amount || 0)}</span>
                    </div>
                    {Number(invoice.due_amount || 0) > 0 && (
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-600 font-semibold">Paid {fmtMoney(Math.max(amountPaid, 0))}</span>
                        <span className="text-rose-500 font-semibold">Due {fmtMoney(invoice.due_amount || 0)}</span>
                      </div>
                    )}
                    <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate('/sales/invoices')} className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" title="Preview">
                          <FileText size={13} />
                        </button>
                        <button onClick={() => handleSalesCardPrint(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" title="Print">
                          <Printer size={13} />
                        </button>
                        <button onClick={() => handleSalesCardDownload(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors" title="Download">
                          <Download size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => navigate('/sales/invoices')}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
                        title="Open in Sales Invoices"
                      >
                        <ExternalLink size={12} /> Open in Sales
                      </button>
                    </div>
                  </div>
                );
              })}
              {filteredSales.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">No sales invoices found.</div>}
            </div>
            </>}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="glass-card rounded-3xl p-5 order-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Create / Edit Invoice</h2>
                <p className="text-sm text-slate-500">Fill the invoice details and see the preview update instantly.</p>
              </div>
              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">Live Preview</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AccordionSection title="My Details" open={openSections.my} onToggle={() => setOpenSections((current) => ({ ...current, my: !current.my }))}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={form.myName} onChange={(e) => updateField('myName', e.target.value)} className="input-field w-full text-sm" placeholder="Your name" />
                  <input value={form.myEmail} onChange={(e) => updateField('myEmail', e.target.value)} className="input-field w-full text-sm" placeholder="Your email" />
                  <input value={form.myAddress} onChange={(e) => updateField('myAddress', e.target.value)} className="input-field w-full text-sm" placeholder="Your address" />
                  <input value={form.myPhone} onChange={(e) => updateField('myPhone', e.target.value)} className="input-field w-full text-sm" placeholder="Your phone" />
                </div>
              </AccordionSection>

              <AccordionSection title="Payment Method" open={openSections.payment} onToggle={() => setOpenSections((current) => ({ ...current, payment: !current.payment }))}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Payment Method</label>
                    <input value={form.paymentMethod} onChange={(e) => updateField('paymentMethod', e.target.value)} className="input-field w-full text-sm" placeholder="e.g. EFT Bank Transfer" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Account Name</label>
                    <input value={form.accountName} onChange={(e) => updateField('accountName', e.target.value)} className="input-field w-full text-sm" placeholder="e.g. Aminoid Labs" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Code / BSB</label>
                    <input value={form.bankCode} onChange={(e) => updateField('bankCode', e.target.value)} className="input-field w-full text-sm" placeholder="e.g. 123456" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Account Number</label>
                    <input value={form.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value)} className="input-field w-full text-sm" placeholder="e.g. 9876543210" />
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection title="Client Details" open={openSections.client} onToggle={() => setOpenSections((current) => ({ ...current, client: !current.client }))}>
                <div className="mb-4">
                  <select 
                    value={form.clientSelection || 'custom'} 
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('clientSelection', val);
                      if (val !== 'custom') {
                        const lead = leads.find(l => String(l.id) === val);
                        if (lead) {
                          updateField('clientName', lead.company || lead.name || '');
                          updateField('clientEmail', lead.email || '');
                          updateField('clientAddress', lead.address || '');
                        }
                      }
                    }}
                    className="input-field w-full text-sm appearance-none"
                  >
                    <option value="custom">Custom (Enter Manually)</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `- ${lead.company}` : ''}</option>
                    ))}
                  </select>
                </div>
                {form.clientSelection === 'custom' && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <input value={form.clientName} onChange={(e) => updateField('clientName', e.target.value)} className="input-field w-full text-sm" placeholder="Client name" />
                    <input value={form.clientEmail} onChange={(e) => updateField('clientEmail', e.target.value)} className="input-field w-full text-sm" placeholder="Client email" />
                    <input value={form.clientAddress} onChange={(e) => updateField('clientAddress', e.target.value)} className="input-field w-full text-sm" placeholder="Client address" />
                    <input value={form.projectName} onChange={(e) => updateField('projectName', e.target.value)} className="input-field w-full text-sm" placeholder="Project name" />
                  </div>
                )}
              </AccordionSection>

              <AccordionSection title="Invoice Details" open={openSections.invoice} onToggle={() => setOpenSections((current) => ({ ...current, invoice: !current.invoice }))}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Invoice Number *</label>
                  <input value={form.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Project Name *</label>
                  <input value={form.projectName} onChange={(e) => updateField('projectName', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Issue Date</label>
                  <input type="date" value={form.issueDate} onChange={(e) => updateField('issueDate', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} className="input-field w-full text-sm" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Payment Status</label>
                  <select value={form.status} onChange={(e) => updateField('status', e.target.value)} className="input-field w-full text-sm appearance-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">Auto-updates to Partially Paid / Paid based on Amount Paid below, unless set to Overdue or Cancelled.</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Amount Paid ({symbol})</label>
                  <input type="number" min="0" step="0.01" value={form.amountPaid || ''} onChange={(e) => updateField('amountPaid', e.target.value)} className="input-field w-full text-sm" placeholder="0.00" />
                  <p className="mt-1 text-[11px] text-slate-400">Balance due: {fmtMoney(totals.balanceDue)}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Notes</label>
                  <textarea
                    value={form.notes ?? ''}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="input-field w-full text-sm resize-y"
                    placeholder="e.g. payment terms, thank-you message, late fee policy..."
                  />
                </div>
              </div>
              </AccordionSection>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Items</h3>
                  <button type="button" onClick={addItem} className="text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer">
                    <PlusCircle size={14} /> Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 py-2 items-center">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-3">Item / Description <span className="text-rose-500">*</span></div>
                      <div className="col-span-2">HSN / SKU</div>
                      <div className="col-span-1">Quantity <span className="text-rose-500">*</span></div>
                      <div className="col-span-1">Unit Price <span className="text-rose-500">*</span></div>
                      <div className="col-span-1">Discount (%)</div>
                      <div className="col-span-1">Tax (%)</div>
                      <div className="col-span-1 text-right">Amount</div>
                      <div className="col-span-1 text-center"></div>
                    </div>

                    <div className="space-y-2">
                      {form.items.map((item, index) => {
                        const qty = Number(item.quantity) || 0;
                        const price = Number(item.price) || 0;
                        const discount = Number(item.discount) || 0;
                        const taxRate = Number(item.taxRate) || 0;
                        const amtBeforeDiscount = qty * price;
                        const discAmt = amtBeforeDiscount * (discount / 100);
                        const afterDisc = amtBeforeDiscount - discAmt;
                        const taxAmt = afterDisc * (taxRate / 100);
                        const finalAmt = afterDisc + taxAmt;

                        return (
                          <div key={index} className="grid grid-cols-12 gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200/70 dark:border-slate-800 items-center shadow-sm">
                            <div className="col-span-1 text-center text-xs font-semibold text-slate-500">{index + 1}</div>
                            <div className="col-span-3">
                              <input value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="Service / product" />
                            </div>
                            <div className="col-span-2">
                              <input value={item.hsn || ''} onChange={(e) => updateItem(index, 'hsn', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="Enter HSN / SKU" />
                            </div>
                            <div className="col-span-1">
                              <input type="number" min="1" value={item.quantity || ''} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-center text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div className="col-span-1">
                              <input type="number" min="0" step="0.01" value={item.price || ''} onChange={(e) => updateItem(index, 'price', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-center text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                            </div>
                            <div className="col-span-1">
                              <input type="number" min="0" max="100" value={item.discount || ''} onChange={(e) => updateItem(index, 'discount', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-center text-slate-900 dark:text-white outline-none focus:border-indigo-500" placeholder="0" />
                            </div>
                            <div className="col-span-1">
                              <select value={item.taxRate || ''} onChange={(e) => updateItem(index, 'taxRate', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 appearance-none">
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                              </select>
                            </div>
                            <div className="col-span-1 text-right text-xs font-bold text-slate-900 dark:text-white">
                              {finalAmt.toFixed(2)}
                            </div>
                            <div className="col-span-1 text-center">
                              <button type="button" onClick={() => removeItem(index)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 mb-4">
                <div className="w-full max-w-sm rounded-xl border border-slate-200/70 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-900/70 shadow-sm">
                  <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between items-center">
                      <span>Subtotal</span>
                      <span className="text-slate-900 dark:text-white">{fmtMoney(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Discount (%)</span>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={form.discountPercent || ''}
                          onChange={(e) => updateField('discountPercent', e.target.value)}
                          className="w-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-center text-xs outline-none focus:border-indigo-500"
                          placeholder="0"
                        />
                        <span className="text-slate-900 dark:text-white w-20 text-right">- {fmtMoney(totals.globalDiscount)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tax</span>
                      <span className="text-slate-900 dark:text-white">{fmtMoney(totals.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-3 text-base font-extrabold">
                      <span className="text-slate-900 dark:text-white">Total Amount</span>
                      <span className="text-indigo-500">{fmtMoney(totals.total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600">
                      <span>Amount Paid</span>
                      <span className="font-bold">{fmtMoney(totals.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-500">
                      <span>Balance Due</span>
                      <span className="font-bold">{fmtMoney(totals.balanceDue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
                  <CheckCircle size={16} /> {saving ? 'Saving...' : editingId ? 'Update Invoice' : 'Create Invoice'}
                </button>
                <button type="button" onClick={handleDownload} className="btn-secondary flex items-center gap-2 text-sm">
                  <Download size={16} /> Download
                </button>
                <button type="button" onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
                  <Printer size={16} /> Print
                </button>
                <button type="button" onClick={handleEmail} className="btn-secondary flex items-center gap-2 text-sm">
                  <Mail size={16} /> Email
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div id="invoice-preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card rounded-3xl p-5 order-2 xl:sticky xl:top-6 self-start">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold dark:text-white">Live Invoice Preview</h2>
                <p className="text-sm text-slate-500">See the final output as you type</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={handlePrint} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Print Invoice"><Printer size={16}/></button>
                <button type="button" onClick={handleDownload} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Download PDF"><Download size={16}/></button>
                <button type="button" onClick={handleEmail} className="p-2 text-slate-400 hover:text-primary transition-colors" title="Email invoice"><Mail size={16}/></button>
              </div>
            </div>

            {/* Invoice Preview — matches screenshot design with inline styles for PDF safety */}
            <div
              ref={previewRef}
              style={{
                background: '#ffffff',
                padding: '40px',
                fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
                color: '#1a1a2e',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              {/* Header: Logo left, Invoice right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  {companyInfo?.company_logo
                    ? <img src={companyInfo.company_logo} crossOrigin="anonymous" alt="logo" style={{ height: '48px', marginBottom: '6px', objectFit: 'contain' }} />
                    : <div style={{ width: '48px', height: '48px', marginBottom: '6px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#3b82f6' }}>✦</div>
                  }
                  <div style={{ fontWeight: '900', fontSize: '22px', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    {companyInfo?.company_name || form.myName || 'AMINOID'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '900', fontSize: '28px', color: '#0f172a', letterSpacing: '-1px' }}>Invoice</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>#{form.invoiceNumber}</div>
                </div>
              </div>

              <hr style={{ borderColor: '#e5e7eb', borderTopWidth: '1px', borderStyle: 'solid', margin: '20px 0' }} />

              {/* Project / Reference + Issued Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Project / Reference</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{form.projectName || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Issued Date</div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{fmtDate(form.issueDate)}</div>
                </div>
              </div>

              <hr style={{ borderColor: '#e5e7eb', borderTopWidth: '1px', borderStyle: 'solid', margin: '20px 0' }} />

              {/* From / Billed To */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px', gap: '32px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>From</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{form.myName}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>{form.myAddress}</div>
                  {form.myAbn && <div style={{ fontSize: '12px', color: '#475569' }}>{form.myAbn}</div>}
                  <div style={{ fontSize: '12px', color: '#3b82f6' }}>{form.myEmail}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{form.myPhone}</div>
                  {form.myWebsite && <div style={{ fontSize: '12px', color: '#3b82f6' }}>{form.myWebsite}</div>}
                </div>
                <div style={{ textAlign: 'right', flex: 1 }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Billed To</div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{form.clientName}</div>
                  {form.clientEmail && <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '3px' }}>{form.clientEmail}</div>}
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>{form.clientAddress}</div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Due Date: {fmtDate(form.dueDate)}</div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '11px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', width: '36px' }}>S.No</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>Description</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb' }}>Units</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb' }}>Price</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb' }}>Discount</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb' }}>GST / Tax</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => {
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.price) || 0;
                    const discPct = Number(item.discount) || 0;
                    const taxPct = Number(item.taxRate) || 0;
                    const base = qty * price;
                    const afterDisc = base - base * (discPct / 100);
                    const taxAmt = afterDisc * (taxPct / 100);
                    const total = afterDisc + taxAmt;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#64748b', width: '36px', fontSize: '11px' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: '600', whiteSpace: 'nowrap', fontSize: '11px' }}>
                          <div>{item.description || 'Service item'}</div>
                          {item.hsn && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{item.hsn}</div>}
                        </td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#475569', fontSize: '11px' }}>{qty || 1}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569', fontSize: '11px' }}>{fmtMoney(price)}</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#475569', fontSize: '11px' }}>{discPct.toFixed(2)}%</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#475569', fontSize: '11px' }}>{taxPct.toFixed(2)}%</td>
                        <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '11px' }}>{fmtMoney(total)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Subtotal + Total */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '8px' }}>
                <div style={{ minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>{fmtMoney(totals.subtotal)}</span>
                  </div>
                  {totals.globalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#ef4444' }}>
                      <span>Discount ({totals.discountPercent}%)</span>
                      <span>- {fmtMoney(totals.globalDiscount)}</span>
                    </div>
                  )}
                  {totals.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                      <span>Tax</span>
                      <span>{fmtMoney(totals.taxAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #e5e7eb', marginTop: '8px' }}>
                    <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>Total Amount</span>
                    <span style={{ fontWeight: '800', fontSize: '17px', color: '#4f46e5' }}>{fmtMoney(totals.total)}</span>
                  </div>
                  {totals.amountPaid > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#059669' }}>
                      <span>Amount Paid</span>
                      <span>{fmtMoney(totals.amountPaid)}</span>
                    </div>
                  )}
                  {totals.amountPaid > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>
                      <span>Balance Due</span>
                      <span>{fmtMoney(totals.balanceDue)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              {(form.notes ?? '').trim() && (
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', fontSize: '11px', color: '#64748b', margin: '28px 0', textAlign: 'center', whiteSpace: 'pre-wrap' }}>
                  Note: {form.notes}
                </div>
              )}

              {/* Payment Method */}
              <div style={{ fontSize: '13px' }}>
                <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>Payment Method</div>
                <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '12px' }}>
                  <div>{form.paymentMethod || 'EFT Bank Transfer'}</div>
                  <div>Account Name : <strong>{form.accountName || '—'}</strong></div>
                  <div>Code / BSB : {form.bankCode || '—'}</div>
                  <div>Account Number : {form.accountNumber || '—'}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[{ label: 'Total Invoices', value: invoices.length, color: '#939BFF', icon: FileText }, { label: 'Paid', value: fmtMoney(totalPaid), color: '#10b981', icon: CheckCircle }, { label: 'Outstanding', value: fmtMoney(totalOwed), color: '#f59e0b', icon: Clock }].map((card) => (
            <motion.div key={card.label} whileHover={{ y: -4 }} className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: `${card.color}18`, color: card.color }}>
                  <card.icon size={22} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                  <p className="text-xl font-semibold dark:text-white">{card.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Invoice Detail Modal ── */}
      {viewingInvoice && (() => {
        const inv = viewingInvoice;
        const items = Array.isArray(inv.items) ? inv.items : [];
        const subtotal = items.reduce((s, it) => {
          const qty = Number(it.quantity) || 0;
          const price = Number(it.price) || 0;
          const disc = Number(it.discount) || 0;
          const base = qty * price;
          return s + (base - base * (disc / 100));
        }, 0);
        const taxTotal = items.reduce((s, it) => {
          const qty = Number(it.quantity) || 0;
          const price = Number(it.price) || 0;
          const disc = Number(it.discount) || 0;
          const taxR = Number(it.taxRate) || 0;
          const base = qty * price;
          const afterDisc = base - base * (disc / 100);
          return s + afterDisc * (taxR / 100);
        }, 0);
        const discountPercent = Number(inv.discount_percent || 0);
        const globalDiscount = discountPercent > 0 ? subtotal * (discountPercent / 100) : Number(inv.discount || 0);
        const grandTotal = subtotal - globalDiscount + taxTotal;
        const amountPaid = Number(inv.amount_paid || 0);
        const balanceDue = inv.balance_due != null ? Number(inv.balance_due) : Math.max(grandTotal - amountPaid, 0);
        const st = statusStyle[inv.status] || { bg: 'bg-slate-100', text: 'text-slate-600' };

        return (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-sm overflow-y-auto">
            {/* ── Top Bar (matches screenshot exactly) ── */}
            <div className="rounded-t-2xl flex items-center justify-between px-6 py-3.5" style={{ background: '#0f172a' }}>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-white">Invoice Preview</span>
                <span className="text-indigo-400 text-sm font-semibold">#{inv.invoice_number || inv.id?.slice(0, 8).toUpperCase()}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${st.bg} ${st.text}`}>{inv.status || 'Pending'}</span>
              </div>
              <div className="flex items-center gap-2">
                {inv.status !== 'Paid' && inv.status !== 'Cancelled' && (
                  <button
                    onClick={() => openPaymentModal(inv)}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: '#10b981' }}
                  >
                    <CreditCard size={15} /> Record Payment
                  </button>
                )}
                <button
                  onClick={() => handleDetailDownload()}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#6366f1' }}
                >
                  <Download size={15} /> Download PDF
                </button>
                <button
                  onClick={() => handleDetailPrint()}
                  className="flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="ml-1 rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Invoice Content (scrollable area with grey background) ── */}
            <div className="flex-1 flex items-start justify-center py-8 px-4" style={{ background: '#1e293b' }}>
              <div className="w-full max-w-2xl"
                  ref={detailRef}
                  style={{
                    background: '#ffffff',
                    padding: '40px',
                    fontFamily: "'Inter','Segoe UI',Arial,sans-serif",
                    color: '#1a1a2e',
                    width: '100%',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      {companyInfo?.company_logo
                        ? <img src={companyInfo.company_logo} crossOrigin="anonymous" alt="logo" style={{ height: '48px', marginBottom: '6px', objectFit: 'contain' }} />
                        : <div style={{ width: '48px', height: '48px', marginBottom: '6px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#3b82f6' }}>✦</div>
                      }
                      <div style={{ fontWeight: '900', fontSize: '20px', color: '#0f172a', letterSpacing: '-0.5px' }}>
                        {companyInfo?.company_name || inv.my_name || 'AMINOID'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '900', fontSize: '26px', color: '#0f172a', letterSpacing: '-1px' }}>Invoice</div>
                      <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>#{inv.invoice_number || inv.id?.slice(0, 8).toUpperCase()}</div>
                    </div>
                  </div>

                  <hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />

                  {/* Project / Issued Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Project / Reference</div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{inv.project_name || inv.projectName || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px' }}>Issued Date</div>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{fmtDate(inv.issue_date || inv.created_at)}</div>
                    </div>
                  </div>

                  <hr style={{ borderColor: '#e5e7eb', margin: '16px 0' }} />

                  {/* From / Billed To */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px', marginBottom: '24px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>From</div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{inv.my_name || companyInfo?.company_name}</div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>{inv.my_address}</div>
                      <div style={{ fontSize: '12px', color: '#3b82f6' }}>{inv.my_email}</div>
                      <div style={{ fontSize: '12px', color: '#475569' }}>{inv.my_phone}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Billed To</div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{inv.client}</div>
                      {inv.client_email && <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '3px' }}>{inv.client_email}</div>}
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7' }}>{inv.client_address}</div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Due Date: {fmtDate(inv.due_date)}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '8px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '8px 10px', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', border: '1px solid #e5e7eb', textAlign: 'center', width: '36px' }}>S.No</th>
                        {['Description', 'Units', 'Price', 'Discount', 'GST / Tax', 'Amount'].map((h, i) => (
                          <th key={h} style={{ padding: '8px 10px', fontWeight: '700', color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', border: '1px solid #e5e7eb', whiteSpace: i === 0 ? 'nowrap' : 'normal', textAlign: i === 0 ? 'left' : i === 1 || i === 3 || i === 4 ? 'center' : 'right' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? items.map((it, idx) => {
                        const qty = Number(it.quantity) || 0;
                        const price = Number(it.price) || 0;
                        const disc = Number(it.discount) || 0;
                        const taxR = Number(it.taxRate || it.tax_rate) || 0;
                        const base = qty * price;
                        const afterDisc = base - base * (disc / 100);
                        const amount = afterDisc + afterDisc * (taxR / 100);
                        return (
                          <tr key={idx}>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#64748b', width: '36px', fontSize: '11px' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', fontWeight: '600', color: '#0f172a', whiteSpace: 'nowrap', fontSize: '11px' }}>
                              <div>{it.description || 'Service item'}</div>
                              {it.hsn && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{it.hsn}</div>}
                            </td>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#475569', fontSize: '11px' }}>{qty || 1}</td>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569', fontSize: '11px' }}>{fmtMoney(price)}</td>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#475569', fontSize: '11px' }}>{disc.toFixed(2)}%</td>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#475569', fontSize: '11px' }}>{taxR.toFixed(2)}%</td>
                            <td style={{ padding: '8px 10px', border: '1px solid #e5e7eb', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '11px' }}>{fmtMoney(amount)}</td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', border: '1px solid #e5e7eb' }}>No line items.</td></tr>
                      )}
                    </tbody>
                  </table>

                  {/* Bottom Section: Notes & Totals */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '24px', gap: '40px' }}>
                    {/* Note */}
                    <div style={{ flex: 1, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', fontSize: '11px', color: '#64748b', textAlign: 'left', alignSelf: 'stretch', whiteSpace: 'pre-wrap' }}>
                      <span style={{ fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Note</span>
                      {inv.notes || DEFAULT_NOTE}
                    </div>

                    {/* Totals */}
                    <div style={{ width: '280px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#475569' }}>
                        <span>Subtotal</span>
                        <span style={{ color: '#3b82f6', fontWeight: '600' }}>{fmtMoney(subtotal)}</span>
                      </div>
                      {globalDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#ef4444' }}>
                          <span>Discount {discountPercent > 0 ? `(${discountPercent}%)` : ''}</span>
                          <span>- {fmtMoney(globalDiscount)}</span>
                        </div>
                      )}
                      {taxTotal > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#475569' }}>
                          <span>Tax</span>
                          <span>{fmtMoney(taxTotal)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #e5e7eb', marginTop: '8px' }}>
                        <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>Total Amount</span>
                        <span style={{ fontWeight: '800', fontSize: '17px', color: '#4f46e5' }}>{fmtMoney(grandTotal)}</span>
                      </div>
                      {amountPaid > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#059669', fontWeight: '700' }}>
                          <span>Amount Paid</span>
                          <span>{fmtMoney(amountPaid)}</span>
                        </div>
                      )}
                      {amountPaid > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px', color: '#ef4444', fontWeight: '700' }}>
                          <span>Balance Due</span>
                          <span>{fmtMoney(balanceDue)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a', marginBottom: '8px' }}>Payment Method</div>
                    <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '12px' }}>
                      <div>{inv.payment_method || form.paymentMethod || 'EFT Bank Transfer'}</div>
                      <div>Account Name : <strong>{inv.account_name || form.accountName || '—'}</strong></div>
                      <div>Code / BSB : {inv.bank_code || form.bankCode || '—'}</div>
                      <div>Account Number : {inv.account_number || form.accountNumber || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        );
      })()}

      {/* ── Record Payment Modal ── */}
      {paymentModal && (() => {
        const inv = paymentModal.invoice;
        const total = Number(inv.amount || 0);
        const currentPaid = Number(paymentModal.amountPaid) || 0;
        const balance = Math.max(total - currentPaid, 0);
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200/70 dark:border-slate-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Record Payment</h3>
                <button onClick={() => setPaymentModal(null)} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">✕</button>
              </div>
              <p className="mb-4 text-sm text-slate-500">
                Invoice #{inv.invoice_number || inv.id?.slice(0, 8).toUpperCase()} — {inv.client}
              </p>
              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Total Amount</p>
                  <p className="font-bold text-slate-900 dark:text-white">{fmtMoney(total)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Balance Due</p>
                  <p className="font-bold text-rose-500">{fmtMoney(balance)}</p>
                </div>
              </div>
              <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">Amount Paid (total received so far)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentModal.amountPaid}
                onChange={(e) => setPaymentModal((prev) => ({ ...prev, amountPaid: e.target.value }))}
                className="input-field w-full text-sm mb-2"
                placeholder="0.00"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPaymentModal((prev) => ({ ...prev, amountPaid: total }))}
                className="mb-4 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Mark as fully paid ({fmtMoney(total)})
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModal(null)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPayment}
                  onClick={handleRecordPayment}
                  className="btn-primary flex-1 text-sm disabled:opacity-60"
                >
                  {savingPayment ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}