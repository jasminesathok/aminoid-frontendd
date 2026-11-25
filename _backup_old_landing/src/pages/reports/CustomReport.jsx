import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Download, Play, Save, Filter,
  ChevronDown, Table, BarChart2, PieChart, Sliders,
  Check, GripVertical,
} from 'lucide-react';

/* ── Config options ────────────────────────────────────────── */
const DATA_SOURCES = ['Sales', 'HR', 'Marketing', 'Accounts', 'Projects'];

const FIELDS = {
  Sales:     ['Date','Revenue','Orders','Product','Region','Salesperson','Status'],
  HR:        ['Date','Employee','Department','Salary','Attendance','Leave Days','Performance'],
  Marketing: ['Date','Campaign','Channel','Impressions','Clicks','CTR','Cost','Conversions'],
  Accounts:  ['Date','Transaction','Type','Amount','Account','Category','Reference'],
  Projects:  ['Date','Project','Task','Assignee','Status','Priority','Story Points'],
};

const FILTERS = {
  Date:        { type: 'range',  options: ['Today','Last 7 Days','Last 30 Days','This Quarter','This Year','Custom'] },
  Status:      { type: 'select', options: ['All','Active','Completed','Pending','Cancelled'] },
  Department:  { type: 'select', options: ['All','Engineering','Design','Marketing','Sales','HR'] },
  Region:      { type: 'select', options: ['All','North America','Europe','Asia Pacific','Latin America'] },
  Type:        { type: 'select', options: ['All','Credit','Debit'] },
  Priority:    { type: 'select', options: ['All','High','Medium','Low'] },
};

const VIZ_TYPES = [
  { id:'table',   label:'Table',    icon: Table    },
  { id:'bar',     label:'Bar Chart',icon: BarChart2 },
  { id:'pie',     label:'Pie Chart',icon: PieChart  },
];

/* ── Mock preview data ─────────────────────────────────────── */
const MOCK_ROWS = {
  Sales: [
    { Date:'20 Mar 2026', Revenue:'$12,400', Orders: 82, Product:'Pro Plan',   Region:'N. America', Salesperson:'Sarah J.', Status:'Completed' },
    { Date:'19 Mar 2026', Revenue:'$8,200',  Orders: 54, Product:'Team Plan',  Region:'Europe',     Salesperson:'Mark W.',  Status:'Completed' },
    { Date:'18 Mar 2026', Revenue:'$14,600', Orders: 96, Product:'API Add-on', Region:'Asia',       Salesperson:'Aisha P.', Status:'Completed' },
    { Date:'17 Mar 2026', Revenue:'$6,400',  Orders: 42, Product:'Pro Plan',   Region:'N. America', Salesperson:'Tom B.',   Status:'Pending'   },
    { Date:'16 Mar 2026', Revenue:'$11,200', Orders: 74, Product:'Team Plan',  Region:'Europe',     Salesperson:'Sarah J.', Status:'Completed' },
  ],
};

export default function CustomReport() {
  const [source,      setSource]      = useState('Sales');
  const [selFields,   setSelFields]   = useState(['Date','Revenue','Orders','Product','Status']);
  const [activeFilters, setActiveFilters] = useState([{ field:'Date', value:'Last 30 Days' }]);
  const [vizType,     setVizType]     = useState('table');
  const [reportName,  setReportName]  = useState('My Custom Report');
  const [hasRun,      setHasRun]      = useState(false);
  const [isRunning,   setIsRunning]   = useState(false);
  const [addingFilter,setAddingFilter] = useState(false);

  const availableFields = FIELDS[source] || [];

  const toggleField = (f) => {
    setSelFields(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );
  };

  const removeFilter = (i) => setActiveFilters(prev => prev.filter((_, idx) => idx !== i));

  const addFilter = (field) => {
    const opts = FILTERS[field]?.options || [];
    setActiveFilters(prev => [...prev, { field, value: opts[0] || '' }]);
    setAddingFilter(false);
  };

  const [savedReports, setSavedReports] = useState([]);
  const [resultRows,   setResultRows]   = useState([]);

  useEffect(() => {
    api.get('/api/reports/custom', { silent: true })
      .then(res => setSavedReports(res.data || []))
      .catch(() => {});
  }, []);

  const runReport = async () => {
    setIsRunning(true);
    try {
      const res = await api.post('/api/reports/custom/run', {
  source:  source,
  fields:  selFields,
  filters: activeFilters,
});
setResultRows(res.data?.rows || res.data?.data?.rows || []);
      setHasRun(true);
    } catch {
      // Fall back to mock data if backend doesn't support yet
      setHasRun(true);
      setResultRows([]);
    } finally {
      setIsRunning(false);
    }
  };

  const saveReport = async () => {
  try {
    await api.post('/api/reports/custom', {
      name:    reportName,
      source:  source,
      fields:  JSON.stringify(selFields),
      filters: JSON.stringify(activeFilters),
      viz_type: vizType,
    });
    const res = await api.get('/api/reports/custom');
    setSavedReports(res.data || []);
    alert('Report saved!');
  } catch (err) {
    console.error('Save failed:', err);
    alert('Save failed: ' + (err.response?.data?.message || err.message));
  }
};

  const previewRows = hasRun && resultRows.length > 0
  ? resultRows
  : (MOCK_ROWS[source] || []).map(row => {
      const out = {};
      selFields.forEach(f => { if (row[f] !== undefined) out[f] = row[f]; });
      return out;
    });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6 px-2">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <input
              value={reportName}
              onChange={e => setReportName(e.target.value)}
              className="text-2xl font-bold dark:text-white bg-transparent border-none outline-none focus:border-b-2 focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={saveReport} className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              <Save size={15} /> Save
            </button>
            <button
              onClick={runReport}
              disabled={isRunning}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-70">
              {isRunning ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Running...</>
              ) : (
                <><Play size={15} fill="currentColor"/> Run Report</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Builder panel ── */}
          <div className="space-y-4">

            {/* Data source */}
            <div className="glass-card p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Data Source</p>
              <div className="flex flex-wrap gap-2">
                {DATA_SOURCES.map(s => (
                  <button key={s} onClick={() => { setSource(s); setSelFields(FIELDS[s].slice(0,5)); setHasRun(false); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      source===s ? 'bg-primary text-white shadow-sm shadow-primary/30'
                                 : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                    }`}>{s}</button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="glass-card p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Columns <span className="text-primary ml-1">({selFields.length} selected)</span>
              </p>
              <div className="space-y-1.5">
                {availableFields.map(f => (
                  <button key={f} onClick={() => toggleField(f)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selFields.includes(f)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}>
                    <div className="flex items-center gap-2">
                      <GripVertical size={12} className="text-slate-300 dark:text-slate-600"/>
                      {f}
                    </div>
                    {selFields.includes(f) && <Check size={13} className="text-primary"/>}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</p>
                <button onClick={() => setAddingFilter(v => !v)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  <Plus size={12}/> Add
                </button>
              </div>

              {/* Add filter dropdown */}
              <AnimatePresence>
                {addingFilter && (
                  <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                    className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Choose a filter field:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(FILTERS).map(f => (
                        <button key={f} onClick={() => addFilter(f)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-primary border border-slate-200 dark:border-slate-600 transition-colors">
                          {f}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {activeFilters.map((af, i) => {
                  const opts = FILTERS[af.field]?.options || [];
                  return (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <Filter size={12} className="text-primary shrink-0"/>
                      <span className="text-xs font-bold dark:text-white shrink-0">{af.field}</span>
                      {opts.length > 0 ? (
                        <select
                          value={af.value}
                          onChange={e => setActiveFilters(prev => prev.map((f,fi) => fi===i ? {...f,value:e.target.value} : f))}
                          className="flex-1 text-xs bg-transparent outline-none dark:text-slate-300 min-w-0"
                        >
                          {opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input value={af.value}
                          onChange={e => setActiveFilters(prev => prev.map((f,fi) => fi===i ? {...f,value:e.target.value} : f))}
                          className="flex-1 text-xs bg-transparent outline-none dark:text-slate-300 min-w-0"/>
                      )}
                      <button onClick={() => removeFilter(i)} className="text-slate-400 hover:text-rose-500 transition-colors shrink-0">
                        <X size={12}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visualization */}
            <div className="glass-card p-5 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visualization</p>
              <div className="grid grid-cols-3 gap-2">
                {VIZ_TYPES.map(v => {
                  const Icon = v.icon;
                  return (
                    <button key={v.id} onClick={() => setVizType(v.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-bold transition-all ${
                        vizType===v.id
                          ? 'bg-primary text-white shadow-md shadow-primary/30'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                      }`}>
                      <Icon size={18}/>
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Preview panel ── */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold dark:text-white">{reportName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Source: <span className="font-semibold text-primary">{source}</span> ·
                    {selFields.length} columns · {activeFilters.length} filter{activeFilters.length!==1?'s':''}
                  </p>
                </div>
                {hasRun && (
                  <div className="flex items-center gap-2">
                    {['CSV','Excel'].map(fmt => (
  <button key={fmt}
    onClick={() => {
      if (!previewRows.length) return;
      const headers = selFields.join(',');
      const rows = previewRows.map(r => selFields.map(f => `"${r[f] ?? ''}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${reportName}.csv`; a.click();
      URL.revokeObjectURL(url);
    }}
    className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all">
    <Download size={11}/>{fmt}
  </button>
))}
                  </div>
                )}
              </div>

              <div className="flex-1 p-5">
                {!hasRun && !isRunning && (
                  <div className="h-64 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Play size={24} className="text-primary" fill="currentColor"/>
                    </div>
                    <p className="text-base font-bold dark:text-white">Ready to run</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">
                      Configure your columns and filters, then click <strong className="text-primary">Run Report</strong> to see results.
                    </p>
                  </div>
                )}

                {isRunning && (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"
                      style={{borderWidth:3}}/>
                    <p className="text-sm font-semibold dark:text-white">Running report…</p>
                    <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{width:'0%'}} animate={{width:'100%'}}
                        transition={{duration:1.2,ease:'easeInOut'}}
                        className="h-full rounded-full bg-primary"/>
                    </div>
                  </div>
                )}

                {hasRun && vizType==='table' && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                    className="overflow-x-auto">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs text-slate-400">{previewRows.length} rows returned · Showing preview</p>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800">
                          {selFields.map(f => (
                            <th key={f} className="px-4 py-2.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{f}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <motion.tr key={i}
                            initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                            className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            {selFields.map(f => (
                              <td key={f} className="px-4 py-3 text-sm dark:text-slate-300 whitespace-nowrap">
                                {row[f] ?? '—'}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {hasRun && vizType==='bar' && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                    className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="flex items-end gap-3 h-40 w-full max-w-sm">
                      {[65,88,42,96,74,58].map((v,i)=>(
                        <motion.div key={i}
                          initial={{height:0}} animate={{height:`${v}%`}}
                          transition={{duration:0.8,delay:i*0.08}}
                          className="flex-1 rounded-t-lg"
                          style={{background:`linear-gradient(180deg,#939BFF,#C4B5F4)`}}/>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Bar chart preview — {source} data</p>
                  </motion.div>
                )}

                {hasRun && vizType==='pie' && (
                  <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                    className="flex flex-col items-center justify-center h-64 gap-4">
                    <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90">
                      {[
                        {pct:35,color:'#939BFF',offset:0},
                        {pct:25,color:'#C4B5F4',offset:35},
                        {pct:20,color:'#AEE9FF',offset:60},
                        {pct:12,color:'#B6EADA',offset:80},
                        {pct: 8,color:'#7B99D9',offset:92},
                      ].map((s,i)=>(
                        <motion.circle key={i} cx="50" cy="50" r="40"
                          fill="transparent" stroke={s.color} strokeWidth="20"
                          strokeDasharray={`${s.pct} ${100-s.pct}`}
                          strokeDashoffset={-s.offset}
                          initial={{strokeDasharray:'0 100'}}
                          animate={{strokeDasharray:`${s.pct} ${100-s.pct}`}}
                          transition={{duration:1,delay:i*0.15}}/>
                      ))}
                    </svg>
                    <p className="text-xs text-slate-400">Pie chart preview — {source} data</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}