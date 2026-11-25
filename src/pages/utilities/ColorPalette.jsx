import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';

const PALETTE = [
  { name:'Primary',   hex:'#939BFF', desc:'Brand primary — used for buttons, links, active states.' },
  { name:'Secondary', hex:'#C4B5F4', desc:'Lighter brand accent for hover and gradient ends.' },
  { name:'Emerald',   hex:'#10b981', desc:'Success states, positive values, active badges.' },
  { name:'Amber',     hex:'#f59e0b', desc:'Warnings, pending states, caution indicators.' },
  { name:'Rose',      hex:'#ef4444', desc:'Errors, destructive actions, danger indicators.' },
  { name:'Sky',       hex:'#0ea5e9', desc:'Info states, links, secondary accents.' },
  { name:'Violet',    hex:'#8b5cf6', desc:'Features, highlights, decorative elements.' },
  { name:'Slate 100', hex:'#f1f5f9', desc:'Light backgrounds, subtle card fills.' },
  { name:'Slate 800', hex:'#1e293b', desc:'Dark backgrounds, deep surface colours.' },
];

const CSS_VARS = [
  { var: '--color-primary',   value: '#939BFF' },
  { var: '--color-secondary', value: '#C4B5F4' },
  { var: '--color-bg',        value: '#0f172a' },
  { var: '--color-surface',   value: '#1e293b' },
];

export default function ColorPalette() {
  const [copied, setCopied] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-10 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Color Palette</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Brand colours and semantic tokens used across Amnoid.</p>
        </div>

        {/* Swatches */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Brand Colours</h2>
          
         

          {/* Simpler swatch grid */}
          <div className="grid grid-cols-1 gap-3 mt-2">
            {PALETTE.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                onClick={() => handleCopy(c.hex)}>
                <div className="w-12 h-12 rounded-xl shadow-md shrink-0 flex items-center justify-center" style={{ background:c.hex }}>
                  {copied === c.hex && <Check size={16} className="text-white"/>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold dark:text-white">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.desc}</p>
                </div>
                <code className="text-xs font-mono text-slate-400 hidden sm:block">{c.hex}</code>
              </div>
            ))}
          </div>
        </section>

        {/* CSS Variables */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">CSS Custom Properties</h2>
          <div className="space-y-2">
            {CSS_VARS.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl group cursor-pointer"
                onClick={() => handleCopy(`var(${v.var})`)}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg shrink-0" style={{ background: v.value }}/>
                  <code className="text-xs font-mono text-slate-600 dark:text-slate-300">{v.var}</code>
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-xs font-mono text-slate-400">{v.value}</code>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                    {copied === `var(${v.var})` ? <Check size={12} className="text-emerald-500"/> : <Copy size={12} className="text-slate-400"/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
