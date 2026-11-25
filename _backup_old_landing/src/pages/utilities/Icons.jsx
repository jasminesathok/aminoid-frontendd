import React, { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const ICON_NAMES = [
  'LayoutDashboard','Calendar','Trello','FileText','ShieldCheck','UserCircle','Tag','HelpCircle',
  'LogOut','Settings','Search','MessageSquare','Home','Grid','Shield','Zap','Users','DollarSign',
  'Clock','CalendarDays','MoreHorizontal','BarChart2','Megaphone','UserPlus','Mail','Share2',
  'BookOpen','Receipt','CreditCard','ArrowLeftRight','PieChart','LayoutGrid','FolderKanban',
  'ListTodo','UsersRound','GanttChartSquare','ClipboardList','TrendingUp','LineChart','BarChart3',
  'Wrench','Crown','Building2','Handshake','GitBranch','Target','BookOpenText','FolderTree',
  'Layers','Palette','Type','Boxes','Star','HardDrive','Activity','Plug','UserCog','Bell',
  'Building','Save','Download','Plus','Pencil','Trash2','X','Eye','Globe','Phone',
  'ChevronRight','ChevronDown','Check','AlertCircle','Info','CheckCircle','XCircle','RefreshCcw',
  'ArrowUpRight','Maximize','Minimize','PanelLeftClose','PanelLeftOpen','Moon','Sun','Copy',
];

export default function Icons() {
  const [search,  setSearch]  = useState('');
  const [copied,  setCopied]  = useState(null);
  const [preview, setPreview] = useState(null);

  const handleCopy = (name) => {
    navigator.clipboard.writeText(name);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = ICON_NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 px-2">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Icon Library</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">All Lucide React icons used in Amnoid. Click to copy name.</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 px-4 py-2.5 rounded-xl w-72">
          <LucideIcons.Search size={16} className="text-slate-400 shrink-0"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search icons..."
            className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <p className="text-xs text-slate-400 mb-4">{filtered.length} icons</p>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {filtered.map(name => {
              const Icon = LucideIcons[name];
              if (!Icon) return null;
              const isCopied = copied === name;
              return (
                <button key={name} onClick={() => { handleCopy(name); setPreview(name); }}
                  title={name}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all group ${isCopied ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary'}`}>
                  {isCopied ? <Check size={20} className="text-primary"/> : <Icon size={20}/>}
                  <span className="text-[9px] font-medium leading-tight text-center line-clamp-1 w-full">{name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {preview && (() => {
          const Icon = LucideIcons[preview];
          return Icon ? (
            <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Icon size={28}/>
              </div>
              <div>
                <p className="text-base font-bold dark:text-white">{preview}</p>
                <code className="text-xs font-mono text-slate-400">import {"{"} {preview} {"}"} from 'lucide-react'</code>
              </div>
              <button onClick={() => handleCopy(`import { ${preview} } from 'lucide-react'`)}
                className="ml-auto btn-secondary text-xs flex items-center gap-1.5">
                <LucideIcons.Copy size={12}/>{copied === `import { ${preview} } from 'lucide-react'` ? 'Copied!' : 'Copy Import'}
              </button>
            </div>
          ) : null;
        })()}
      </div>
    </DashboardLayout>
  );
}
