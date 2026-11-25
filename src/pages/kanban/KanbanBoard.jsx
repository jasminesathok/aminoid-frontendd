import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MoreVertical, X, Search,
  Clock, Trash2, Building2, User, ArrowRight,
} from 'lucide-react';
import { api } from '../../utils/api';
import { useToast } from '../../context/ToastContext';

const COLORS = {
  Design:'#939BFF',Development:'#10b981',Marketing:'#f59e0b',
  Research:'#C4B5F4',Testing:'#ef4444',Planning:'#AEE9FF',
};
const AVATAR_COLORS = { SJ:'#939BFF',MW:'#C4B5F4',AP:'#AEE9FF',TB:'#B6EADA',NR:'#7B99D9',JC:'#939BFF' };
const fmtDue = (d) => { if(!d) return null; const date=new Date(d); if(isNaN(date)) return d; return date.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); };
const fmtDateTime = (d) => { if(!d) return '—'; return new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); };

const COL_META = [
  { name:'Todo',        label:'To Do',       color:'#3b82f6' },
  { name:'In Progress', label:'In Progress', color:'#939BFF' },
  { name:'Review',      label:'In Review',   color:'#f59e0b' },
  { name:'Done',        label:'Done',        color:'#10b981' },
];
const priorityStyle = {
  High:'bg-rose-500/10 text-rose-500', Medium:'bg-amber-500/10 text-amber-600',
  Low:'bg-slate-100 dark:bg-slate-800 text-slate-500',
};

/* ── Mini card ── */
const KanbanCard = ({ card, onOpen, onDelete, onMove, columns, isSA }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const tagColor = COLORS[card.tag] || '#939BFF';
  return (
    <motion.div layout initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.95}}
      whileHover={{y:-2,boxShadow:'0 8px 24px rgba(0,0,0,0.10)'}}
      onClick={() => onOpen(card)}
      className="glass-card p-4 rounded-xl cursor-pointer group relative">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{background:`${tagColor}18`,color:tagColor}}>{card.tag||'General'}</span>
        {!isSA && (
          <button onClick={e=>{e.stopPropagation();setMenuOpen(o=>!o);}} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={13}/>
          </button>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}}
            className="absolute right-3 top-10 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-36"
            onClick={e=>e.stopPropagation()}>
            <p className="text-[10px] font-bold text-slate-400 uppercase px-3 pt-1 pb-0.5 tracking-wider">Move to</p>
            {columns.filter(c=>c.name!==card.col_name).map(col=>(
              <button key={col.name} onClick={()=>{onMove(card.id,col.name);setMenuOpen(false);}}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                {col.label}
              </button>
            ))}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
              <button onClick={()=>{onDelete(card.id);setMenuOpen(false);}}
                className="w-full text-left text-xs px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 flex items-center gap-2">
                <Trash2 size={11}/> Delete card
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-sm font-semibold dark:text-white leading-snug mb-2">{card.title}</p>

      {/* Enterprise badge for SA */}
      {isSA && (card.enterprise_name || card.ent_owner) && (
        <div className="flex items-center gap-1 mb-2">
          <Building2 size={10} className="text-primary shrink-0"/>
          <span className="text-[10px] font-semibold text-primary truncate">{card.enterprise_name || card.ent_owner}</span>
        </div>
      )}

      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${priorityStyle[card.priority]||priorityStyle.Low}`}>
        {card.priority||'Low'}
      </span>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          {card.assignee && (
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[8px] font-bold shrink-0"
              style={{background:`linear-gradient(135deg,${AVATAR_COLORS[card.assignee]||'#939BFF'},${AVATAR_COLORS[card.assignee]||'#939BFF'}88)`}}>
              {card.assignee}
            </div>
          )}
          {card.due && (()=>{
            const dueDate=new Date(card.due); const today=new Date();
            const diffDays=Math.ceil((dueDate-today)/(1000*60*60*24));
            const isOverdue=diffDays<0&&card.col_name!=='Done';
            const isDueSoon=diffDays>=0&&diffDays<=2&&card.col_name!=='Done';
            return (
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${isOverdue?'bg-rose-500/10 text-rose-500':isDueSoon?'bg-amber-500/10 text-amber-600':'text-slate-400'}`}>
                <Clock size={10}/><span className="text-[10px] font-semibold">{fmtDue(card.due)}</span>
              </div>
            );
          })()}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Card Detail Modal ── */
const CardModal = ({ card, onClose, onDelete, onMove, columns, onEdit, isSA }) => {
  const tagColor = COLORS[card.tag] || '#939BFF';
  const history  = card.history || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{scale:.93,opacity:0}} animate={{scale:1,opacity:1}}
        className="glass-card rounded-2xl p-7 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
              style={{background:`${tagColor}18`,color:tagColor}}>{card.tag||'General'}</span>
            <h3 className="text-lg font-bold dark:text-white mt-1 leading-snug">{card.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 shrink-0 ml-3"><X size={16}/></button>
        </div>

        {/* Enterprise + Creator info */}
        {(card.enterprise_name || card.ent_owner || card.creator_first) && (
          <div className="mb-5 p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
            {(card.enterprise_name || card.ent_owner) && (
              <div className="flex items-center gap-2.5">
                <Building2 size={14} className="text-primary shrink-0"/>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Enterprise</p>
                  <p className="text-sm font-bold text-primary">{card.enterprise_name || card.ent_owner}</p>
                </div>
              </div>
            )}
            {card.creator_first && (
              <div className="flex items-center gap-2.5">
                <User size={14} className="text-slate-500 shrink-0"/>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Created by</p>
                  <p className="text-sm font-semibold dark:text-white">{card.creator_first} {card.creator_last}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label:'Assignee', value:card.assignee||'—' },
            { label:'Due Date', value:fmtDue(card.due)||'—' },
            { label:'Priority', value:card.priority||'—' },
            { label:'Status',   value:card.col_name },
          ].map((r,i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{r.label}</p>
              <p className="text-sm font-bold dark:text-white mt-0.5">{r.value}</p>
            </div>
          ))}
        </div>

        {/* Move to column */}
        {!isSA && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Move to column</p>
            <div className="flex gap-2 flex-wrap">
              {columns.filter(c=>c.name!==card.col_name).map(col => (
                <button key={col.name} onClick={()=>{onMove(card.id,col.name);onClose();}}
                  className="text-xs font-bold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary transition-all">
                  → {col.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Movement history */}
        {history.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Stage History</p>
            <div className="space-y-2">
              {history.map((h,i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowRight size={10} className="text-primary"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {h.from_col
                        ? <><span className="font-semibold text-slate-500">{h.from_col}</span><ArrowRight size={10} className="text-slate-400"/><span className="font-bold text-primary">{h.to_col}</span></>
                        : <span className="font-bold text-emerald-500">Created in {h.to_col}</span>
                      }
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {h.moved_by_name && <span className="font-semibold">{h.moved_by_name}</span>}
                      {h.enterprise_name && <span> · <Building2 size={8} className="inline"/> {h.enterprise_name}</span>}
                      {h.moved_at && <span> · {fmtDateTime(h.moved_at)}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSA && (
          <div className="flex gap-2">
            <button onClick={()=>onEdit(card)}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all">
              Edit
            </button>
            <button onClick={()=>{onDelete(card.id);onClose();}}
              className="flex items-center gap-1.5 text-xs font-bold py-2 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 transition-all">
              <Trash2 size={12}/> Delete
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

/* ── Add/Edit Card Modal ── */
const AddCardModal = ({ columnId, onClose, onAdd, editCard }) => {
  const [title,    setTitle]    = useState(editCard?.title    || '');
  const [tag,      setTag]      = useState(editCard?.tag      || Object.keys(COLORS)[0]);
  const [priority, setPriority] = useState(editCard?.priority || 'Medium');
  const [assignee, setAssignee] = useState(editCard?.assignee || Object.keys(AVATAR_COLORS)[0]);
  const [due,      setDue]      = useState(editCard?.due      || '');
  const [saving,   setSaving]   = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSaving(true);
    if (editCard) {
      try { await api.put(`/api/kanban/cards/${editCard.id}`,{title,tag,priority,assignee,due,column:columnId}); }
      catch(err) { console.error(err); }
    } else {
      await onAdd(columnId, { title, tag, priority, assignee, due });
    }
    setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{scale:.93,opacity:0}} animate={{scale:1,opacity:1}}
        className="glass-card rounded-2xl p-7 w-full max-w-md mx-4 shadow-2xl"
        onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold dark:text-white">{editCard?'Edit Card':'New Card'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={16}/></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Title</label>
            <input autoFocus value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleAdd()}
              className="input-field w-full text-sm" placeholder="Card title…"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Tag</label>
              <select value={tag} onChange={e=>setTag(e.target.value)} className="input-field w-full text-sm">
                {Object.keys(COLORS).map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Priority</label>
              <select value={priority} onChange={e=>setPriority(e.target.value)} className="input-field w-full text-sm">
                {['High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Assignee</label>
              <select value={assignee} onChange={e=>setAssignee(e.target.value)} className="input-field w-full text-sm">
                {Object.keys(AVATAR_COLORS).map(a=><option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Due Date</label>
              <input type="date" value={due} onChange={e=>setDue(e.target.value)} className="input-field w-full text-sm"/>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={handleAdd} disabled={saving||!title.trim()} className="btn-primary flex-1 text-sm disabled:opacity-50">
            {saving?'Saving…':editCard?'Save Changes':'Add Card'}
          </button>
          <button onClick={onClose} className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ══ MAIN ══ */
export default function KanbanBoard() {
  const { user } = useAuth();
  const isSA = user?.role === 'super_admin';

  const [cards,        setCards]        = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [addingTo,     setAddingTo]     = useState(null);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [editingCard,  setEditingCard]  = useState(null);
  const toast = useToast();

  const loadBoard = () => api.get('/api/kanban')
    .then(res => setCards((res.data.cards||[]).map(c=>({...c,due:c.due||c.due_date||''}))))
    .finally(() => setLoading(false));

  useEffect(() => { loadBoard(); }, []);

  const columns = COL_META.map(meta => ({ ...meta, cards: cards.filter(c=>c.col_name===meta.name) }));
  const totalCards = cards.length;
  const doneCards  = cards.filter(c=>c.col_name==='Done').length;
  const donePct    = totalCards>0 ? Math.round((doneCards/totalCards)*100) : 0;

  const handleAdd = async (colName, { title, tag, priority, assignee, due }) => {
    try {
      const res = await api.post('/api/kanban/cards', { title, column:colName, tag, priority, assignee, due });
      setCards(prev => [...prev, { ...res.data, due: res.data.due||res.data.due_date||'' }]);
      toast.success('Card added!');
    } catch (err) { console.error(err); }
  };

  const handleMove = async (cardId, newColName) => {
    setCards(prev => prev.map(c => c.id===cardId ? {...c,col_name:newColName} : c));
    try { await api.put(`/api/kanban/cards/${cardId}`, { column:newColName }); toast.success(`Moved to ${newColName}`); }
    catch (err) { loadBoard(); }
  };

  const handleDelete = async (cardId) => {
    setCards(prev => prev.filter(c=>c.id!==cardId));
    try { await api.delete(`/api/kanban/cards/${cardId}`); toast.success('Card deleted'); }
    catch (err) { loadBoard(); }
  };

  const filterCards = (cardList) => search ? cardList.filter(c=>c.title.toLowerCase().includes(search.toLowerCase())) : cardList;

  // Group by enterprise for SA
  const saGroups = isSA
    ? Object.values(cards.reduce((acc,c)=>{
        const key = c.enterprise_id||'unknown';
        const label = c.enterprise_name||c.ent_owner||'Unknown';
        if (!acc[key]) acc[key]={label,cards:[]};
        acc[key].cards.push(c);
        return acc;
      }, {}))
    : null;

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Kanban Board</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{doneCards}/{totalCards} tasks completed this sprint</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-52 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cards…"
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
            </div>
            {/* SA can also add cards */}
            <button onClick={()=>setAddingTo('Todo')} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15}/> Add Card
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="glass-card p-4 rounded-2xl flex items-center gap-4">
          <span className="text-xs font-bold text-slate-400 shrink-0">Sprint Progress</span>
          <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:`${donePct}%`}} transition={{duration:1.2}}
              className="h-full rounded-full" style={{background:'linear-gradient(90deg,#939BFF,#10b981)'}}/>
          </div>
          <span className="text-xs font-bold dark:text-white shrink-0">{donePct}%</span>
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
            {columns.map(col=>(
              <div key={col.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{background:col.color}}/>
                <span className="text-[10px] font-bold text-slate-400">{col.cards.length}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SA: enterprise summary header */}
        {isSA && saGroups && (
          <div className="flex gap-3 flex-wrap">
            {saGroups.map((g,i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
                <Building2 size={12} className="text-primary"/>
                <span className="text-xs font-bold text-primary">{g.label}</span>
                <span className="text-[10px] text-slate-400">{g.cards.length} cards</span>
              </div>
            ))}
          </div>
        )}

        {/* Board */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {columns.map(col => (
            <div key={col.name} className="shrink-0 w-64 sm:w-72 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{background:col.color}}/>
                  <span className="text-sm font-bold dark:text-white">{col.label}</span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{background:col.color}}>{filterCards(col.cards).length}</span>
                </div>
                <button onClick={()=>setAddingTo(col.name)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary">
                  <Plus size={14}/>
                </button>
              </div>
              <div className="h-0.5 rounded-full mb-3" style={{background:col.color}}/>
              <div className="space-y-3 flex-1 min-h-30">
                <AnimatePresence>
                  {filterCards(col.cards).map(card => (
                    <KanbanCard key={card.id} card={card} onOpen={c=>{setSelectedCard({...c});}} onDelete={handleDelete}
                      onMove={handleMove} columns={COL_META} isSA={isSA}/>
                  ))}
                </AnimatePresence>
                {filterCards(col.cards).length===0 && (
                  <div onClick={()=>setAddingTo(col.name)}
                    className="h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <span className="text-xs text-slate-400">+ Add card</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCard && (
          <CardModal card={selectedCard} onClose={()=>setSelectedCard(null)}
            onDelete={handleDelete} onMove={handleMove} columns={COL_META} isSA={isSA}
            onEdit={(card)=>{setSelectedCard(null);setEditingCard(card);setAddingTo(card.col_name);}}/>
        )}
        {addingTo && (
          <AddCardModal columnId={addingTo}
            onClose={()=>{setAddingTo(null);setEditingCard(null);loadBoard();}}
            onAdd={handleAdd} editCard={editingCard}/>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}