import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Wallet,
  AlertCircle, Download, Loader2, Calendar, CreditCard, Printer
} from 'lucide-react';
import { api, BASE_URL } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';

/* ── Same computation as Payroll.jsx ─────────────────────────────── */
function computePayslip(emp) {
  const monthly     = Number(emp.baseSalary) || 0;
  const totalDays   = 26;
  const daysWorked  = 26;
  const nfhDays     = 1;
  const otHrs       = 0;

  const fixedBasic  = Math.round(monthly * 0.50);
  const fixedDA     = Math.round(monthly * 0.30);
  const basic       = Math.round(fixedBasic * daysWorked / totalDays);
  const da          = Math.round(fixedDA    * daysWorked / totalDays);
  const earnedSalary= basic + da;
  const elSalary    = Math.round((fixedBasic + fixedDA) / totalDays);
  const bonus       = Math.round(basic * 0.0833);
  const dailyRate   = Math.round((fixedBasic + fixedDA) / totalDays);
  const nfhWages    = dailyRate * nfhDays;
  const hourlyRate  = Math.round((fixedBasic + fixedDA) / (totalDays * 8));
  const otWages     = hourlyRate * otHrs * 2;
  const grossSalary = earnedSalary + elSalary + bonus + nfhWages + otWages;
  const esi         = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
  const epf         = Math.round(basic * 0.12);
  const pt          = monthly > 15000 ? 200 : monthly > 10000 ? 150 : 0;
  const totalDeduction = esi + epf + pt;
  const netSalary   = grossSalary - totalDeduction;

  return {
    totalDays, daysWorked, nfhDays, otHrs,
    fixedBasic, fixedDA, basic, da, earnedSalary, elSalary,
    bonus, nfhWages, otWages, grossSalary,
    esi, epf, pt, totalDeduction, netSalary,
    paymentMode: 'NEFT',
  };
}

export default function MyPayslip() {
  const { fmt } = useCurrency();
  const [payslip,     setPayslip]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [notLinked,   setNotLinked]   = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api.get('/api/hr/my/payslip', { silent: true })
      .then(res => setPayslip(res.data))
      .catch(err => { if (err.message?.includes('linked')) setNotLinked(true); })
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    if (!payslip) return;
    const p     = computePayslip(payslip);
    const month = new Date(payslip.payDate || Date.now())
      .toLocaleString('default', { month: 'long', year: 'numeric' });
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Payslip — ${payslip.name}</title>
      <style>
        body{font-family:sans-serif;padding:32px;color:#1e293b}
        h1{font-size:22px;margin:0}h2{font-size:14px;color:#64748b;font-weight:500;margin:0 0 16px}
        table{width:100%;border-collapse:collapse;margin-bottom:24px}
        th{text-align:left;font-size:11px;text-transform:uppercase;color:#94a3b8;padding:6px 8px;border-bottom:1px solid #e2e8f0}
        td{padding:7px 8px;font-size:13px;border-bottom:1px solid #f1f5f9}
        td:last-child{text-align:right;font-weight:600}
        .section{background:#f8fafc;padding:4px 8px;font-weight:700;font-size:11px;text-transform:uppercase;color:#6366f1;letter-spacing:.05em}
        .total-row td{font-weight:700;background:#f1f5f9}
        .net{background:#6366f1;color:#fff;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center}
        header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #6366f1}
      </style></head><body>
      <header>
        <div><h1>${payslip.name}</h1><h2>${payslip.role} · ${payslip.department}</h2></div>
        <div style="text-align:right"><strong>Payslip</strong><br/><span style="color:#64748b;font-size:13px">${month}</span></div>
      </header>
      <table>
        <tr class="section"><td colspan="2">Attendance</td></tr>
        <tr><td>Total Working Days in Month</td><td>${p.totalDays} days</td></tr>
        <tr><td>No of Days Worked</td><td>${p.daysWorked} days</td></tr>
        <tr><td>NFH (National & Festival Holidays)</td><td>${p.nfhDays} day</td></tr>
        <tr><td>OT Hours</td><td>${p.otHrs} hrs</td></tr>
      </table>
      <table>
        <tr><th>Earnings</th><th>Amount</th></tr>
        <tr><td>Fixed Basic Wages</td><td>₹${p.fixedBasic.toLocaleString()}</td></tr>
        <tr><td>Fixed DA</td><td>₹${p.fixedDA.toLocaleString()}</td></tr>
        <tr><td>Basic</td><td>₹${p.basic.toLocaleString()}</td></tr>
        <tr><td>DA</td><td>₹${p.da.toLocaleString()}</td></tr>
        <tr><td>Earned Salary</td><td>₹${p.earnedSalary.toLocaleString()}</td></tr>
        <tr><td>EL Salary</td><td>₹${p.elSalary.toLocaleString()}</td></tr>
        <tr><td>Bonus (8.33%)</td><td>₹${p.bonus.toLocaleString()}</td></tr>
        <tr><td>NFH Wages</td><td>₹${p.nfhWages.toLocaleString()}</td></tr>
        <tr><td>OT Wages</td><td>₹${p.otWages.toLocaleString()}</td></tr>
        <tr class="total-row"><td>Gross Salary</td><td>₹${p.grossSalary.toLocaleString()}</td></tr>
      </table>
      <table>
        <tr><th>Deductions</th><th>Amount</th></tr>
        <tr><td>ESI (0.75% of Gross)</td><td>₹${p.esi.toLocaleString()}</td></tr>
        <tr><td>EPF (12% of Basic)</td><td>₹${p.epf.toLocaleString()}</td></tr>
        <tr><td>PT (Professional Tax)</td><td>₹${p.pt.toLocaleString()}</td></tr>
        <tr class="total-row"><td>Total Deduction</td><td>₹${p.totalDeduction.toLocaleString()}</td></tr>
      </table>
      <div class="net"><span>Net Salary · ${p.paymentMode}</span><span>₹${p.netSalary.toLocaleString()}</span></div>
      </body></html>
    `);
    win.document.close(); win.focus(); win.print();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token   = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || '';
      const response = await fetch(`${BASE_URL}/api/hr/my/payslip/pdf`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/pdf' },
      });
      if (!response.ok) { alert('Could not generate payslip. Please try again.'); return; }
      const blob = new Blob([await response.arrayBuffer()], { type: 'application/pdf' });
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: `payslip-${payslip?.name?.replace(/\s+/g, '_') || 'payslip'}.pdf`,
        style: 'display:none',
      });
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 1000);
    } catch { alert('Could not download payslip. Please try again.'); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (notLinked) return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto mt-20 text-center space-y-4 px-4">
        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle size={28} className="text-amber-500" />
        </div>
        <h2 className="text-xl font-bold dark:text-white">Profile Not Linked</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Your account is not linked to an employee profile yet. Please contact your HR admin to link your account.
        </p>
      </div>
    </DashboardLayout>
  );

  const p     = computePayslip(payslip);
  const month = new Date(payslip.payDate || Date.now())
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  const SectionHeader = ({ color, children }) => (
    <div className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-t-xl"
      style={{ background: color }}>{children}</div>
  );

  const Row = ({ label, value, green, red, bold, sub }) => (
    <div className={`flex justify-between items-center px-5 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0
      ${bold ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
      <div>
        <span className={`text-sm ${bold ? 'font-bold dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
      <span className={`text-sm font-bold tabular-nums ${green ? 'text-emerald-500' : red ? 'text-rose-500' : 'dark:text-white'}`}>
        {value}
      </span>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8 px-2">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">My Payslip</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed salary breakdown — {month}</p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Printer size={15} /> Print
            </button>
            <button onClick={handleDownload} disabled={downloading}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
              {downloading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Download size={15} /> Download PDF</>}
            </button>
          </div>
        </div>

        {/* Employee identity card */}
        <div className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Employee</p>
              <p className="text-2xl font-bold">{payslip.name}</p>
              <p className="text-white/70 text-sm mt-0.5">{payslip.role} · {payslip.department}</p>
              <div className="flex gap-3 mt-4">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <Calendar size={11} /> {month}
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <CreditCard size={11} /> {p.paymentMode}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Net Salary</p>
              <p className="text-3xl font-bold">{fmt(p.netSalary)}</p>
              <span className="text-xs bg-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded-lg font-bold">
                {payslip.status}
              </span>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Gross Salary', value: p.grossSalary, color: '#939BFF', icon: DollarSign  },
            { label: 'Bonus',        value: p.bonus,       color: '#10b981', icon: TrendingUp  },
            { label: 'Deductions',   value: p.totalDeduction, color: '#ef4444', icon: TrendingDown },
            { label: 'Net Pay',      value: p.netSalary,   color: '#6366f1', icon: Wallet      },
          ].map((c, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${c.color}18`, color: c.color }}>
                <c.icon size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{c.label}</p>
                <p className="text-base font-bold dark:text-white tabular-nums">{fmt(c.value)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Attendance Section */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <SectionHeader color="#0ea5e9">📅 Attendance</SectionHeader>
          <Row label="Total Working Days in Month"        value={`${p.totalDays} days`} />
          <Row label="No of Days Worked"                  value={`${p.daysWorked} days`} />
          <Row label="NFH (National & Festival Holidays)" value={`${p.nfhDays} day`} />
          <Row label="OT Hours"                           value={`${p.otHrs} hrs`} />
        </div>

        {/* Earnings Section */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <SectionHeader color="#10b981">💰 Earnings</SectionHeader>
          <div className="px-5 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Fixed Components
          </div>
          <Row label="Fixed Basic Wages" value={fmt(p.fixedBasic)} green />
          <Row label="Fixed DA"          value={fmt(p.fixedDA)}    green />
          <div className="px-5 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Earned Components
          </div>
          <Row label="Basic"             value={fmt(p.basic)}        green />
          <Row label="DA"                value={fmt(p.da)}           green />
          <Row label="Earned Salary"     value={fmt(p.earnedSalary)} green bold />
          <Row label="EL Salary"         value={fmt(p.elSalary)}     green />
          <Row label="Bonus"             value={fmt(p.bonus)}        green sub="Statutory 8.33% of Basic" />
          <Row label="NFH Wages"         value={fmt(p.nfhWages)}     green />
          <Row label="OT Wages"          value={fmt(p.otWages)}      green />
          <div className="flex justify-between px-5 py-3.5 bg-emerald-500 text-white">
            <span className="font-bold">Gross Salary</span>
            <span className="font-bold text-lg tabular-nums">{fmt(p.grossSalary)}</span>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <SectionHeader color="#ef4444">📉 Deductions</SectionHeader>
          <Row label="ESI" value={fmt(p.esi)} red sub="Employee contribution — 0.75% of Gross" />
          <Row label="EPF" value={fmt(p.epf)} red sub="12% of Basic" />
          <Row label="PT (Professional Tax)" value={fmt(p.pt)} red />
          <div className="flex justify-between px-5 py-3.5 bg-rose-500 text-white">
            <span className="font-bold">Total Deduction</span>
            <span className="font-bold text-lg tabular-nums">{fmt(p.totalDeduction)}</span>
          </div>
        </div>

        {/* Net Salary */}
        <div className="rounded-2xl p-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)' }}>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Net Salary</p>
            <p className="text-white/60 text-xs flex items-center gap-1.5">
              <CreditCard size={11} /> Payment via {p.paymentMode}
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white tabular-nums">{fmt(p.netSalary)}</p>
            <p className="text-white/60 text-xs mt-0.5">{month}</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}