import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Download, Search, ChevronUp, ChevronDown,
  MoreVertical, X, Eye, Printer, Building2, Calendar, CreditCard,
  TrendingUp, TrendingDown, Clock, Star, Edit, Trash2, CheckCircle
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

/* ── Colours ──────────────────────────────────────────────────────── */
const PALETTE    = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor   = i => PALETTE[i % PALETTE.length];
const getInitials= n => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U';

/* ── Payslip computation (Indian payroll rules) ──────────────────── */
function computePayslip(emp) {
  const monthly      = Number(emp.baseSalary) || 0;
  const totalDays    = 26;           // standard working days / month
  const daysWorked   = 26;           // assume full month worked
  const nfhDays      = 1;            // national / festival holidays
  const otHrs        = 0;            // overtime hours

  // Fixed components
  const fixedBasic   = Math.round(monthly * 0.50);   // 50% of CTC
  const fixedDA      = Math.round(monthly * 0.30);   // 30% DA

  // Earned (proportional to days worked)
  const basic        = Math.round(fixedBasic * daysWorked / totalDays);
  const da           = Math.round(fixedDA    * daysWorked / totalDays);
  const earnedSalary = basic + da;

  // EL salary (1 day of (basic+DA) rate)
  const elSalary     = Math.round((fixedBasic + fixedDA) / totalDays);

  // Bonus (statutory 8.33% of basic)
  const bonus        = Math.round(basic * 0.0833);

  // NFH wages (NFH days × daily (basic+DA) rate)
  const dailyRate    = Math.round((fixedBasic + fixedDA) / totalDays);
  const nfhWages     = dailyRate * nfhDays;

  // OT wages (assume 2× hourly rate; 8 hrs/day)
  const hourlyRate   = Math.round((fixedBasic + fixedDA) / (totalDays * 8));
  const otWages      = hourlyRate * otHrs * 2;

  const grossSalary  = earnedSalary + elSalary + bonus + nfhWages + otWages;

  // Deductions
  const esi          = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
  const epf          = Math.round(basic * 0.12);
  const pt           = monthly > 15000 ? 200 : monthly > 10000 ? 150 : 0;
  const totalDeduction = esi + epf + pt;
  const netSalary    = grossSalary - totalDeduction;

  return {
    totalDays, daysWorked, nfhDays, otHrs,
    fixedBasic, fixedDA,
    basic, da, earnedSalary, elSalary, bonus, nfhWages, otWages,
    grossSalary, esi, epf, pt, totalDeduction, netSalary,
    paymentMode: 'NEFT',
  };
}

/* ── CSV helper ───────────────────────────────────────────────────── */
function downloadCsv(filename, rows) {
  const content = rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/csv' }));
  a.download = filename;
  a.click();
}

function payslipToCsvRows(e, p, month) {
  return [
    ['PAYSLIP DETAIL', `${e.name} — ${month}`],
    [],
    ['ATTENDANCE'],
    ['Total Working Days in Month', p.totalDays],
    ['No of Days Worked', p.daysWorked],
    ['NFH (National & Festival Holidays)', p.nfhDays],
    ['OT Hours', p.otHrs],
    [],
    ['EARNINGS'],
    ['Fixed Basic Wages', p.fixedBasic],
    ['Fixed DA', p.fixedDA],
    ['Basic', p.basic],
    ['DA', p.da],
    ['Earned Salary', p.earnedSalary],
    ['EL Salary', p.elSalary],
    ['Bonus', p.bonus],
    ['NFH Wages', p.nfhWages],
    ['OT Wages', p.otWages],
    ['Gross Salary', p.grossSalary],
    [],
    ['DEDUCTIONS'],
    ['ESI', p.esi],
    ['EPF', p.epf],
    ['PT', p.pt],
    ['Total Deduction', p.totalDeduction],
    [],
    ['NET SALARY', p.netSalary],
    ['Payment Mode', p.paymentMode],
  ];
}

/* ── Payslip Modal ────────────────────────────────────────────────── */
function PayslipModal({ row, onClose, fmt, selectedMonth, companyInfo }) {
  const printRef = useRef();
  if (!row) return null;

  const d     = new Date(selectedMonth + '-01');
  const month = d.toLocaleString('default', { month: 'long', year: 'numeric' });
  const p     = computePayslip(row);

  const handlePrint = () => {
    if (!printRef.current) { window.print(); return; }
    const payslipHtml = printRef.current.outerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(`<!DOCTYPE html><html><head><title>Payslip — ${row.name}</title>
      <style>
        @media print {
          @page { size: A4 portrait; margin: 5mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; zoom: 0.85; }
        }
        body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; background: #fff; padding: 20px; }
      </style>
      </head><body>${payslipHtml}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      const imgData = await toPng(printRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const img = new Image();
      img.src = imgData;
      await new Promise(r => img.onload = r);
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`payslip-${row.name}-${month}.pdf`);
    } catch (e) {
      alert('Failed to generate PDF: ' + e.message);
    }
  };

  const Section = ({ title, color = '#6366f1', children }) => (
    <div className="mb-1">
      <div className="px-4 py-2 rounded-t-xl text-xs font-bold uppercase tracking-wider text-white"
        style={{ background: color }}>{title}</div>
      <div className="border border-t-0 border-slate-200 dark:border-slate-700 rounded-b-xl overflow-hidden">
        {children}
      </div>
    </div>
  );

  const Row = ({ label, value, bold, green, red, indent }) => (
    <div className={`flex justify-between items-center px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0
      ${indent ? 'pl-8' : ''} ${bold ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
      <span className={`text-sm ${bold ? 'font-bold dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
      <span className={`text-sm font-bold tabular-nums
        ${green ? 'text-emerald-500' : red ? 'text-rose-500' : 'dark:text-white'}`}>{value}</span>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0 }} transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800"
          style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(row.name)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{row.name}</h2>
                  <p className="text-white/75 text-sm">{row.department}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar size={11} /> {month}
                </span>
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <CreditCard size={11} /> {p.paymentMode}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors" title="Print">
                <Printer size={16} />
              </button>
              <button onClick={handleDownloadPdf}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-1 text-sm font-semibold px-3" title="Download PDF">
                <Download size={16} /> PDF
              </button>
              <button onClick={() => {
                  downloadCsv(`payslip-${row.name}-${month}.csv`, payslipToCsvRows(row, p, month));
                }}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors" title="Download CSV">
                <Download size={16} />
              </button>
              <button onClick={onClose}
                className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">

          {/* Attendance Section */}
          <Section title="📅 Attendance" color="#0ea5e9">
            <Row label="Total Working Days in Month"        value={`${p.totalDays} days`} />
            <Row label="No of Days Worked"                  value={`${p.daysWorked} days`} />
            <Row label="NFH (National & Festival Holidays)" value={`${p.nfhDays} day`} />
            <Row label="OT Hours"                           value={`${p.otHrs} hrs`} />
          </Section>

          {/* Earnings Section */}
          <Section title="💰 Earnings" color="#10b981">
            <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Fixed Components
            </div>
            <Row label="Fixed Basic Wages" value={fmt(p.fixedBasic)} green />
            <Row label="Fixed DA"          value={fmt(p.fixedDA)}    green />
            <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Earned Components
            </div>
            <Row label="Basic"             value={fmt(p.basic)}        green />
            <Row label="DA"                value={fmt(p.da)}           green />
            <Row label="Earned Salary"     value={fmt(p.earnedSalary)} green bold />
            <Row label="EL Salary"         value={fmt(p.elSalary)}     green />
            <Row label="Bonus (8.33%)"     value={fmt(p.bonus)}        green />
            <Row label="NFH Wages"         value={fmt(p.nfhWages)}     green />
            <Row label="OT Wages"          value={fmt(p.otWages)}      green />
            <div className="flex justify-between px-4 py-3 bg-emerald-500 text-white">
              <span className="font-bold text-sm">Gross Salary</span>
              <span className="font-bold text-base tabular-nums">{fmt(p.grossSalary)}</span>
            </div>
          </Section>

          {/* Deductions Section */}
          <Section title="📉 Deductions" color="#ef4444">
            <Row label="ESI (Employee — 0.75% of Gross)" value={fmt(p.esi)}           red />
            <Row label="EPF (12% of Basic)"               value={fmt(p.epf)}           red />
            <Row label="PT (Professional Tax)"            value={fmt(p.pt)}            red />
            <div className="flex justify-between px-4 py-3 bg-rose-500 text-white">
              <span className="font-bold text-sm">Total Deduction</span>
              <span className="font-bold text-base tabular-nums">{fmt(p.totalDeduction)}</span>
            </div>
          </Section>

          {/* Net Salary */}
          <div className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)' }}>
            <div>
              <p className="text-white/75 text-xs font-semibold uppercase tracking-wider mb-1">Net Salary</p>
              <p className="text-white/60 text-xs flex items-center gap-1.5">
                <CreditCard size={11} /> Payment via {p.paymentMode}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white tabular-nums">{fmt(p.netSalary)}</p>
              <p className="text-white/60 text-xs mt-0.5">{month}</p>
            </div>
          </div>

        </div>

        {/* Hidden Print / PDF Layout */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={printRef} style={{ background: '#ffffff', padding: '30px', color: '#1a1a2e', maxWidth: '800px', width: '800px', margin: '0 auto', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                {companyInfo?.company_logo
                  ? <img src={companyInfo.company_logo} crossOrigin="anonymous" alt="logo" style={{ height: '48px', marginBottom: '6px', objectFit: 'contain' }} />
                  : <div style={{ width: '48px', height: '48px', marginBottom: '6px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#3b82f6' }}>✦</div>
                }
                <div style={{ fontWeight: 900, fontSize: '22px', color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {companyInfo?.company_name || 'Aminoid AI'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: '28px', color: '#0f172a', letterSpacing: '-1px' }}>Payslip</div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{month}</div>
              </div>
            </div>
            
            <hr style={{ borderColor: '#e5e7eb', borderTopWidth: '1px', borderStyle: 'solid', margin: '20px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Employee Details</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{row.name}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>{row.department}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>Employee Code: {row.employee_code || '—'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Attendance</div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{month}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>Total Working Days: {p.totalDays}</div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>Days Worked: {p.daysWorked}</div>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Earnings</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Fixed Basic Wages</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.fixedBasic)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Fixed DA</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.fixedDA)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Earned Basic</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.basic)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Earned DA</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.da)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>EL Salary</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.elSalary)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Bonus (8.33%)</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.bonus)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>NFH Wages</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.nfhWages)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>OT Wages</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.otWages)}</td></tr>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a' }}>Gross Earnings</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#0f172a' }}>{fmt(p.grossSalary)}</td></tr>
              </tbody>
            </table>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', marginBottom: '8px', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Deductions</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>ESI (0.75%)</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.esi)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>EPF (12% of Basic)</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.epf)}</td></tr>
                <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Professional Tax</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.pt)}</td></tr>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a' }}>Total Deductions</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#0f172a' }}>{fmt(p.totalDeduction)}</td></tr>
              </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '8px' }}>
              <div style={{ minWidth: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                  <span>Gross Earnings</span>
                  <span style={{ fontWeight: 600 }}>{fmt(p.grossSalary)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#ef4444' }}>
                  <span>Total Deductions</span>
                  <span>- {fmt(p.totalDeduction)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #e5e7eb', marginTop: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Net Salary</span>
                  <span style={{ fontWeight: 800, fontSize: '17px', color: '#4f46e5' }}>{fmt(p.netSalary)}</span>
                </div>
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', fontSize: '11px', color: '#64748b', margin: '28px 0', textAlign: 'center' }}>
              Payment via {p.paymentMode}. This is a computer-generated document. No signature is required.
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

/* ── Main Payroll Page ────────────────────────────────────────────── */
export default function Payroll() {
  const { fmt }  = useCurrency();
  const { user } = useAuth();
  const isSA     = user?.role === 'super_admin';

  const [payroll,  setPayroll]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [viewRow,  setViewRow]  = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [companyInfo, setCompanyInfo] = useState({});

  const [downloadingRow, setDownloadingRow] = useState(null);
  const directPrintRef = useRef();

  useEffect(() => {
    api.get('/api/hr/payroll')
      .then(res => setPayroll(res.data))
      .finally(() => setLoading(false));
    api.get('/api/setup/company').then(r => setCompanyInfo(r.data || {})).catch(() => {});
  }, []);

  useEffect(() => {
    if (downloadingRow && directPrintRef.current) {
      const run = async () => {
        try {
          const imgData = await toPng(directPrintRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
          const img = new Image();
          img.src = imgData;
          await new Promise(r => img.onload = r);
          const pdf = new jsPDF('p', 'pt', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (img.height * pdfWidth) / img.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          const d = new Date(selectedMonth + '-01');
          const monthStr = d.toLocaleString('default', { month: 'long', year: 'numeric' });
          pdf.save(`payslip-${downloadingRow.name}-${monthStr}.pdf`);
        } catch (e) {
          alert('Failed to generate PDF: ' + e.message);
        } finally {
          setDownloadingRow(null);
        }
      };
      setTimeout(run, 100);
    }
  }, [downloadingRow, selectedMonth]);

  const handleEdit = (e) => { alert('Edit Payroll for: ' + e.name); };
  const handleDelete = (e) => { alert('Delete Payroll for: ' + e.name); };
  const handleMarkAsPaid = (e) => { alert('Marking as Paid for: ' + e.name); };

  const filtered = payroll.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_code?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = isSA ? filtered.reduce((acc, e) => {
    const key   = e.enterprise_id || 'unknown';
    const label = e.owner_first ? `${e.owner_first} ${e.owner_last}` : key;
    if (!acc[key]) acc[key] = { label, employees: [] };
    acc[key].employees.push(e);
    return acc;
  }, {}) : null;
  const groupList = grouped ? Object.values(grouped) : [];

  const totalNet = payroll.reduce((s, e) => s + e.netPay, 0);
  const paid     = payroll.filter(e => e.status === 'Processed');
  const pending  = payroll.filter(e => e.status !== 'Processed');

  /* Full payroll export with all 20 fields */
  const handleExportAll = () => {
    const d     = new Date(selectedMonth + '-01');
    const month = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    const header = [
      'Employee','Department',
      'Total Days','Days Worked','NFH Days','OT Hrs',
      'Fixed Basic','Fixed DA',
      'Basic','DA','Earned Salary','EL Salary','Bonus','NFH Wages','OT Wages','Gross Salary',
      'ESI','EPF','PT','Total Deduction',
      'Net Salary','Payment Mode','Status'
    ];
    const rows = payroll.map(e => {
      const p = computePayslip(e);
      return [
        e.name, e.department,
        p.totalDays, p.daysWorked, p.nfhDays, p.otHrs,
        p.fixedBasic, p.fixedDA,
        p.basic, p.da, p.earnedSalary, p.elSalary, p.bonus, p.nfhWages, p.otWages, p.grossSalary,
        p.esi, p.epf, p.pt, p.totalDeduction,
        p.netSalary, p.paymentMode, e.status
      ];
    });
    downloadCsv(`payroll-${month}.csv`, [header, ...rows]);
  };

  /* Per-row download */
  const handleRowDownload = (e) => {
    const d     = new Date(selectedMonth + '-01');
    const month = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    const p     = computePayslip(e);
    downloadCsv(`payslip-${e.name}-${month}.csv`, payslipToCsvRows(e, p, month));
    setMenuOpen(null);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  const EmployeeRow = ({ e, i }) => (
    <motion.tr key={e._id || e.employeeId}
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: `linear-gradient(135deg,${getColor(i)},${getColor(i)}88)` }}>
            {getInitials(e.name)}
          </div>
          <div>
            <p className="text-sm font-semibold dark:text-white">{e.name}</p>
            <p className="text-xs text-slate-400">
              {e.employee_code ? `${e.employee_code} · ` : ''}
              {e.department}
            </p>
          </div>
        </div>
      </td>

      {/* Quick computed columns */}
      {(() => {
        const p = computePayslip(e);
        return (
          <>
            <td className="px-5 py-4 text-sm font-semibold dark:text-white tabular-nums">{fmt(p.fixedBasic)}</td>
            <td className="px-5 py-4 text-sm text-emerald-500 font-semibold tabular-nums">+{fmt(p.bonus)}</td>
            <td className="px-5 py-4 text-sm text-rose-500 font-semibold tabular-nums">-{fmt(p.totalDeduction)}</td>
            <td className="px-5 py-4 text-sm font-bold dark:text-white tabular-nums">{fmt(p.netSalary)}</td>
          </>
        );
      })()}

      <td className="px-5 py-4">
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
          {e.status}
        </span>
      </td>

      <td className="px-5 py-4 relative">
        <div className="flex items-center gap-1">
          <button onClick={() => { setViewRow(e); setMenuOpen(null); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors" title="View Payslip">
            <Eye size={15} />
          </button>
          <button onClick={(ev) => { ev.stopPropagation(); setMenuOpen(menuOpen === (e._id || e.employeeId) ? null : (e._id || e.employeeId)); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <MoreVertical size={15} />
          </button>
        </div>
        <AnimatePresence>
          {menuOpen === (e._id || e.employeeId) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-2 top-10 z-30 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 min-w-[150px] overflow-hidden"
              onClick={ev => ev.stopPropagation()}>
              
              {e.status === 'Draft' && (
                <>
                  <button onClick={() => { handleEdit(e); setMenuOpen(null); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Edit size={14} /> Edit Payroll
                  </button>
                  {isSA && (
                    <button onClick={() => { handleDelete(e); setMenuOpen(null); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                      <Trash2 size={14} /> Delete Payroll
                    </button>
                  )}
                </>
              )}

              {(e.status === 'Processed' || e.status === 'Paid') && (
                <>
                  <button onClick={() => { setViewRow(e); setMenuOpen(null); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Eye size={14} /> View Payslip
                  </button>
                  <button onClick={() => { setDownloadingRow(e); setMenuOpen(null); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <Download size={14} /> Download PDF
                  </button>
                </>
              )}

              {e.status === 'Processed' && (
                <button onClick={() => { handleMarkAsPaid(e); setMenuOpen(null); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
                  <CheckCircle size={14} /> Mark as Paid
                </button>
              )}

              <button onClick={() => { handleRowDownload(e); setMenuOpen(null); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700">
                <Download size={14} /> Download CSV
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2" onClick={() => setMenuOpen(null)}>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Payroll</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage &amp; export employee salaries</p>
          </div>
          <button onClick={handleExportAll}
            className="flex items-center gap-2 btn-primary text-sm">
            <Download size={16} /> Export Payroll
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label:'Total Payroll',   value: fmt(totalNet),                   icon: DollarSign,  color:'#939BFF', sub:`${payroll.length} employees` },
            { label:'Processed',        value:`${paid.length} employees`,        icon: TrendingUp,  color:'#10b981', sub: fmt(paid.reduce((s,e)=>s+e.netPay,0)) },
            { label:'Pending',          value:`${pending.length} employees`,     icon: TrendingDown,color:'#f59e0b', sub: fmt(pending.reduce((s,e)=>s+e.netPay,0)) },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon size={22} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{c.label}</p>
                <p className="text-xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-64 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search employee…"
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400">Payroll Month:</label>
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)} 
                className="bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Employee', 'Basic Wages', 'Bonus', 'Deductions', 'Net Pay', 'Status', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isSA ? (
                  groupList.map((group, gi) => (
                    <React.Fragment key={gi}>
                      <tr>
                        <td colSpan={7} className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{group.label}</span>
                            <span className="ml-1 text-xs text-slate-400">{group.employees.length} employees</span>
                          </div>
                        </td>
                      </tr>
                      {group.employees.map((e, i) => <EmployeeRow key={e._id || e.employeeId || i} e={e} i={i} />)}
                    </React.Fragment>
                  ))
                ) : (
                  filtered.map((e, i) => <EmployeeRow key={e._id || e.employeeId || i} e={e} i={i} />)
                )}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {viewRow && <PayslipModal row={viewRow} onClose={() => setViewRow(null)} fmt={fmt} selectedMonth={selectedMonth} companyInfo={companyInfo} />}
      </AnimatePresence>

      {/* Hidden layout for direct PDF download from row */}
      {downloadingRow && (() => {
        const d = new Date(selectedMonth + '-01');
        const month = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        const p = computePayslip(downloadingRow);
        return (
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div ref={directPrintRef} style={{ background: '#ffffff', padding: '30px', color: '#1a1a2e', maxWidth: '800px', width: '800px', margin: '0 auto', fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  {companyInfo?.company_logo
                    ? <img src={companyInfo.company_logo} crossOrigin="anonymous" alt="logo" style={{ height: '48px', marginBottom: '6px', objectFit: 'contain' }} />
                    : <div style={{ width: '48px', height: '48px', marginBottom: '6px', background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#3b82f6' }}>✦</div>
                  }
                  <div style={{ fontWeight: 900, fontSize: '22px', color: '#0f172a', letterSpacing: '-0.5px' }}>
                    {companyInfo?.company_name || 'Aminoid AI'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '28px', color: '#0f172a', letterSpacing: '-1px' }}>Payslip</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginTop: '2px' }}>{month}</div>
                </div>
              </div>
              
              <hr style={{ borderColor: '#e5e7eb', borderTopWidth: '1px', borderStyle: 'solid', margin: '20px 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Employee Details</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{downloadingRow.name}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>{downloadingRow.department}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>Employee Code: {downloadingRow.employee_code || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Attendance</div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a', marginBottom: '3px' }}>{month}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>Total Working Days: {p.totalDays}</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.7 }}>Days Worked: {p.daysWorked}</div>
                </div>
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Earnings</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Fixed Basic Wages</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.fixedBasic)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Fixed DA</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.fixedDA)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Earned Basic</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.basic)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Earned DA</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.da)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>EL Salary</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.elSalary)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Bonus (8.33%)</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.bonus)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>NFH Wages</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.nfhWages)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>OT Wages</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.otWages)}</td></tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a' }}>Gross Earnings</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#0f172a' }}>{fmt(p.grossSalary)}</td></tr>
                </tbody>
              </table>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', marginBottom: '8px', fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Deductions</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #e5e7eb', background: '#f8fafc' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>ESI (0.75%)</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.esi)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>EPF (12% of Basic)</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.epf)}</td></tr>
                  <tr><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a', fontWeight: 600 }}>Professional Tax</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#475569' }}>{fmt(p.pt)}</td></tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}><td style={{ padding: '12px', border: '1px solid #e5e7eb', color: '#0f172a' }}>Total Deductions</td><td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'right', color: '#0f172a' }}>{fmt(p.totalDeduction)}</td></tr>
                </tbody>
              </table>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '8px' }}>
                <div style={{ minWidth: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#475569' }}>
                    <span>Gross Earnings</span>
                    <span style={{ fontWeight: 600 }}>{fmt(p.grossSalary)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px', color: '#ef4444' }}>
                    <span>Total Deductions</span>
                    <span>- {fmt(p.totalDeduction)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #e5e7eb', marginTop: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Net Salary</span>
                    <span style={{ fontWeight: 800, fontSize: '17px', color: '#4f46e5' }}>{fmt(p.netSalary)}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', fontSize: '11px', color: '#64748b', margin: '28px 0', textAlign: 'center' }}>
                Payment via {p.paymentMode}. This is a computer-generated document. No signature is required.
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}