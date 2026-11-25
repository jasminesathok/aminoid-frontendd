import React from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';

const SCALE = [
  { name:'Display',    size:'text-5xl',  weight:'font-bold',       sample:'The quick brown fox' },
  { name:'Heading 1',  size:'text-4xl',  weight:'font-bold',       sample:'The quick brown fox' },
  { name:'Heading 2',  size:'text-3xl',  weight:'font-bold',       sample:'The quick brown fox' },
  { name:'Heading 3',  size:'text-2xl',  weight:'font-bold',       sample:'The quick brown fox' },
  { name:'Heading 4',  size:'text-xl',   weight:'font-semibold',   sample:'The quick brown fox jumps' },
  { name:'Body Large', size:'text-base', weight:'font-normal',     sample:'The quick brown fox jumps over the lazy dog.' },
  { name:'Body',       size:'text-sm',   weight:'font-normal',     sample:'The quick brown fox jumps over the lazy dog.' },
  { name:'Caption',    size:'text-xs',   weight:'font-medium',     sample:'The quick brown fox jumps over the lazy dog. 0123456789' },
  { name:'Overline',   size:'text-[10px]',weight:'font-bold',      sample:'UPPERCASE TRACKING LABEL — 0123456789' },
];

const WEIGHTS = [
  { label:'Light 300',    cls:'font-light' },
  { label:'Regular 400',  cls:'font-normal' },
  { label:'Medium 500',   cls:'font-medium' },
  { label:'Semibold 600', cls:'font-semibold' },
  { label:'Bold 700',     cls:'font-bold' },
  { label:'Extrabold 800',cls:'font-extrabold' },
];

export default function Typography() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-10 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Typography</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Font scale and weight reference for the design system.</p>
        </div>

        {/* Type Scale */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-6">Type Scale</h2>
          <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
            {SCALE.map((t, i) => (
              <div key={i} className={`${i > 0 ? 'pt-5' : ''} flex items-baseline justify-between gap-6`}>
                <div className="shrink-0 w-28">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.name}</p>
                  <p className="text-[10px] text-slate-300 dark:text-slate-600 font-mono mt-0.5">{t.size} · {t.weight}</p>
                </div>
                <p className={`${t.size} ${t.weight} dark:text-white text-slate-900 flex-1 min-w-0 truncate`}>{t.sample}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Font Weights */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Font Weights</h2>
          <div className="space-y-4">
            {WEIGHTS.map((w, i) => (
              <div key={i} className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-slate-400 w-24 shrink-0">{w.label}</span>
                <p className={`text-lg ${w.cls} dark:text-white text-slate-900`}>Amnoid Dashboard · ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              </div>
            ))}
          </div>
        </section>

        {/* Colour Roles */}
        <section className="glass-card p-6 rounded-2xl">
          <h2 className="text-base font-bold dark:text-white mb-5">Text Colour Roles</h2>
          <div className="space-y-3">
            {[
              { cls:'text-slate-900 dark:text-white',      label:'Primary Text',   desc:'Headings, important labels, values' },
              { cls:'text-slate-600 dark:text-slate-300',  label:'Secondary Text',  desc:'Body content, descriptions' },
              { cls:'text-slate-400',                       label:'Muted Text',      desc:'Captions, placeholders, metadata' },
              { cls:'text-primary',                         label:'Brand Text',      desc:'Links, active states, highlights' },
              { cls:'text-emerald-500',                     label:'Success Text',    desc:'Positive values, success messages' },
              { cls:'text-rose-500',                        label:'Danger Text',     desc:'Errors, destructive warnings' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <p className={`${r.cls} text-sm font-semibold w-36 shrink-0`}>{r.label}</p>
                <p className="text-xs text-slate-400">{r.desc}</p>
                <code className="text-[10px] font-mono text-slate-300 hidden sm:block ml-auto">{r.cls.split(' ')[0]}</code>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
