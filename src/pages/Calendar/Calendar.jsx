import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, X,
  Clock, MapPin, Users, Building2, Tag,
  Calendar as CalIcon, Grid, List,
} from 'lucide-react';

/* maps DB row → shape the component uses */
const mapEvent = (e) => ({
  id:              e.id,
  title:           e.title,
  date:            e.start_dt ? e.start_dt.slice(0, 10) : '',
  start:           e.start_dt ? e.start_dt.slice(11, 16) : '00:00',
  end:             e.end_dt   ? e.end_dt.slice(11, 16)   : '',
  color:           e.color || '#939BFF',
  type:            e.type  || 'Event',
  location:        e.location || '',
  assigner_name:   e.assigner_name  || '',
  assigner_email:  e.assigner_email || '',
  enterprise_name: e.enterprise_name || (e.ent_first ? `${e.ent_first} ${e.ent_last}` : ''),
  attendees:       [],
});

const TYPE_COLORS = {
  Meeting: '#939BFF', Task: '#AEE9FF', Review: '#B6EADA',
  Planning: '#f59e0b', Call: '#C4B5F4', Demo: '#10b981',
  Social: '#10b981', HR: '#ef4444',
};

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const HOURS  = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);

const fmtDate    = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
const eventsOn   = (all, dateStr) => all.filter(e => e.date === dateStr);
const hourToTop  = (t) => { const [h,m] = t.split(':').map(Number); return (h + m/60) * 56; };
const eventHeight= (s, e) => { const [sh,sm]=s.split(':').map(Number),[eh,em]=e.split(':').map(Number); return ((eh+em/60)-(sh+sm/60))*56; };

/* ── EventPill ── */
const EventPill = ({ event, onClick, compact = false }) => (
  <motion.div whileHover={{ scale: 1.02 }}
    onClick={(e) => { e.stopPropagation(); onClick(event); }}
    className="rounded-lg px-2 py-1 cursor-pointer text-white overflow-hidden"
    style={{ background: event.color, boxShadow: `0 2px 8px ${event.color}55` }}
    title={event.title}>
    <p className={`font-bold truncate leading-tight ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{event.title}</p>
    {!compact && <p className="text-[9px] opacity-80">{event.start}</p>}
  </motion.div>
);

/* ── Event Detail Modal ── */
const EventModal = ({ event, onClose, onEdit, isSA }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
      className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl"
      onClick={e => e.stopPropagation()}>
      <div className="h-1.5 rounded-full mb-5" style={{ background: event.color }} />
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block"
            style={{ background:`${event.color}20`, color: event.color }}>{event.type}</span>
          <h3 className="text-lg font-bold dark:text-white mt-1">{event.title}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
          <X size={16}/>
        </button>
      </div>

      <div className="space-y-3">
        {/* Time */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background:`${event.color}33`, color: event.color }}><Clock size={14}/></div>
          <span className="text-sm text-slate-600 dark:text-slate-300">{event.start} – {event.end}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background:`${event.color}33`, color: event.color }}><CalIcon size={14}/></div>
          <span className="text-sm text-slate-600 dark:text-slate-300">{event.date}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background:`${event.color}33`, color: event.color }}><MapPin size={14}/></div>
          <span className="text-sm text-slate-600 dark:text-slate-300">{event.location || 'No location set'}</span>
        </div>

        {/* Creator */}
        {event.assigner_name && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background:`${event.color}33`, color: event.color }}><Users size={14}/></div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-300">{event.assigner_name}</span>
              <p className="text-[10px] text-slate-400">{event.assigner_email}</p>
            </div>
          </div>
        )}

        {/* Enterprise — only for super admin */}
        {isSA && event.enterprise_name && (
          <div className="flex items-center gap-3 mt-1 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
              <Building2 size={14}/>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Enterprise</p>
              <span className="text-sm font-semibold text-primary">{event.enterprise_name}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-5">
        {!isSA && (
          <button className="btn-primary flex-1 text-xs py-2" onClick={() => onEdit(event)}>Edit Event</button>
        )}
        <button onClick={onClose}
          className="flex-1 text-xs py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          Close
        </button>
      </div>
    </motion.div>
  </div>
);

/* ── Add / Edit Event Modal ── */
const AddEventModal = ({ defaultDate, onClose, onAdd, editEvent }) => {
  const [title,     setTitle]     = useState(editEvent?.title    || '');
  const [date,      setDate]      = useState(editEvent?.date     || defaultDate || '');
  const [type,      setType]      = useState(editEvent?.type     || 'Meeting');
  const [startTime, setStartTime] = useState(editEvent?.start    || '09:00');
  const [endTime,   setEndTime]   = useState(editEvent?.end      || '10:00');
  const [location,  setLocation]  = useState(editEvent?.location || '');
  const [color,     setColor]     = useState(editEvent?.color    || TYPE_COLORS['Meeting']);
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        start: `${date}T${startTime}:00`,
        end:   `${date}T${endTime}:00`,
        type, color,
        location: location.trim(),
      };
      const res = editEvent
        ? await api.put(`/api/calendar/${editEvent.id}`, payload)
        : await api.post('/api/calendar', payload);
      const raw = res.data?.data || res.data;
      onAdd(mapEvent({ ...raw, location: raw.location ?? location.trim() }));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="glass-card rounded-2xl p-7 w-full max-w-md mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold dark:text-white">{editEvent ? 'Edit Event' : 'New Event'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Event Title</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="input-field w-full text-sm" placeholder="Add a title…" autoFocus/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Date</label>
              <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field w-full text-sm"/>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Type</label>
              <select value={type} onChange={e => { setType(e.target.value); setColor(TYPE_COLORS[e.target.value]); }} className="input-field w-full text-sm">
                {Object.keys(TYPE_COLORS).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Start Time</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="input-field w-full text-sm"/>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input-field w-full text-sm"/>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="input-field w-full text-sm" placeholder="Zoom, Office, etc."/>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Color</label>
            <div className="flex gap-2">
              {Object.values(TYPE_COLORS).filter((v,i,a)=>a.indexOf(v)===i).map((c,i) => (
                <button key={i} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform shadow ${color===c?'border-slate-600 dark:border-white scale-110':'border-transparent'}`}
                  style={{ background: c }}/>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm disabled:opacity-60">
              {saving ? 'Saving…' : editEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function Calendar() {
  const { user } = useAuth();
  const isSA = user?.role === 'super_admin';

  const today = new Date();
  const [events,        setEvents]        = useState([]);
  const [year,          setYear]          = useState(today.getFullYear());
  const [month,         setMonth]         = useState(today.getMonth());
  const [view,          setView]          = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [addDate,       setAddDate]       = useState('');
  const [selectedDay,   setSelectedDay]   = useState(today.getDate());
  const [editEvent,     setEditEvent]     = useState(null);

  // ── Fetch events on mount (and when navigating back) ──────────────────────
  useEffect(() => {
    api.get('/api/calendar')
      .then(res => setEvents(((res.data?.data || res.data) || []).map(mapEvent)))
      .catch(err => console.error('Calendar load error:', err));
  }, []);

  /* Navigation */
  const prevPeriod = () => { if (month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextPeriod = () => { if (month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };
  const goToday    = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()); };

  /* Month grid */
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month+1, 0).getDate();
  const prevCount = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i=0;i<firstDay;i++)   cells.push({ day: prevCount-firstDay+1+i, cur: false, dateStr: fmtDate(year,month-1,prevCount-firstDay+1+i) });
  for (let d=1;d<=daysCount;d++) cells.push({ day: d, cur: true,  dateStr: fmtDate(year,month,d) });
  const remaining = 42 - cells.length;
  for (let i=1;i<=remaining;i++) cells.push({ day: i, cur: false, dateStr: fmtDate(year,month+1,i) });

  const todayStr = fmtDate(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday  = (dateStr) => dateStr === todayStr;

  /* Week view */
  const baseDate  = new Date(year, month, selectedDay);
  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() - baseDate.getDay());
  const weekDates = Array.from({ length:7 }, (_,i) => {
    const d = new Date(weekStart); d.setDate(weekStart.getDate()+i);
    return { d, dateStr: fmtDate(d.getFullYear(), d.getMonth(), d.getDate()) };
  });

  /* Sidebar */
  const upcoming   = events.filter(e=>e.date>=todayStr).sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start)).slice(0,6);
  const monthEvents= events.filter(e=>{ const[ey,em]=e.date.split('-').map(Number); return ey===year&&em===month+1; });

  /* SA grouping for upcoming panel */
  const upcomingGrouped = isSA
    ? upcoming.reduce((acc,e)=>{ const k=e.enterprise_name||'Unknown'; if(!acc[k]) acc[k]=[]; acc[k].push(e); return acc; }, {})
    : null;

  return (
    <DashboardLayout>
      <div className="flex gap-6 h-full max-w-full mx-auto px-2">

        {/* ── LEFT: main calendar ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button onClick={goToday}
                className="text-sm font-bold px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Today</button>
              <div className="flex items-center gap-1">
                <button onClick={prevPeriod} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><ChevronLeft size={18}/></button>
                <button onClick={nextPeriod} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"><ChevronRight size={18}/></button>
              </div>
              <h2 className="text-xl font-bold dark:text-white">{MONTHS[month]} {year}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {[{id:'month',icon:Grid,label:'Month'},{id:'week',icon:CalIcon,label:'Week'},{id:'day',icon:List,label:'Day'}].map(v=>(
                  <button key={v.id} onClick={()=>setView(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${view===v.id?'bg-primary text-white':'text-slate-500 hover:text-primary'}`}>
                    <v.icon size={13}/>{v.label}
                  </button>
                ))}
              </div>
              {/* SA cannot add events — they observe only */}
              {!isSA && (
                <button onClick={()=>{setAddDate(fmtDate(year,month,selectedDay));setShowAddModal(true);}}
                  className="btn-primary flex items-center gap-2 text-sm">
                  <Plus size={15}/> New Event
                </button>
              )}
            </div>
          </div>

          {/* ══ MONTH VIEW ══ */}
          {view==='month' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800">
                {DAYS.map(d=><div key={d} className="py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {cells.map((cell,i)=>{
                  const evts=eventsOn(events,cell.dateStr);
                  const isT=isToday(cell.dateStr);
                  const isWeekend=i%7===0||i%7===6;
                  return (
                    <div key={i} onClick={()=>{if(cell.cur) setSelectedDay(cell.day);}}
                      className={`min-h-24 p-2 border-b border-r border-slate-200/60 dark:border-slate-800 cursor-pointer transition-colors
                        ${!cell.cur?'bg-slate-50/80 dark:bg-slate-900/40':'hover:bg-primary/3 dark:hover:bg-primary/5'}
                        ${isWeekend&&cell.cur?'bg-slate-100/30 dark:bg-slate-800/20':''}`}>
                      <div className="flex justify-end mb-1.5">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold
                          ${isT?'bg-primary text-white shadow-md shadow-primary/30':''}
                          ${!cell.cur?'text-slate-400 dark:text-slate-600':'text-slate-900 dark:text-slate-200'}`}>{cell.day}</span>
                      </div>
                      <div className="space-y-0.5">
                        {evts.slice(0,3).map(ev=><EventPill key={ev.id} event={ev} onClick={setSelectedEvent} compact/>)}
                        {evts.length>3&&<p className="text-[9px] font-bold text-slate-400 pl-1">+{evts.length-3} more</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ WEEK VIEW ══ */}
          {view==='week' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="grid border-b border-slate-100 dark:border-slate-800" style={{gridTemplateColumns:'56px repeat(7,1fr)'}}>
                <div className="py-3"/>
                {weekDates.map(({d,dateStr},i)=>(
                  <div key={i} className="py-3 text-center border-l border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{DAYS[i]}</p>
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold mx-auto mt-0.5 ${isToday(dateStr)?'bg-primary text-white shadow-md shadow-primary/30':'dark:text-white'}`}>{d.getDate()}</span>
                  </div>
                ))}
              </div>
              <div className="overflow-y-auto max-h-150 scrollbar-hide">
                <div className="relative grid" style={{gridTemplateColumns:'56px repeat(7,1fr)'}}>
                  <div className="relative">
                    {HOURS.map((h,i)=><div key={i} className="h-14 flex items-start pt-1 pr-2 justify-end"><span className="text-[10px] text-slate-500 font-medium">{h}</span></div>)}
                  </div>
                  {weekDates.map(({dateStr},ci)=>(
                    <div key={ci} className="relative border-l border-slate-200/60 dark:border-slate-800" style={{height:24*56}}>
                      {HOURS.map((_,hi)=><div key={hi} className="absolute w-full border-t border-slate-100 dark:border-slate-800/60" style={{top:hi*56}}/>)}
                      {eventsOn(events,dateStr).map(ev=>{
                        const top=hourToTop(ev.start); const h=Math.max(eventHeight(ev.start,ev.end),28);
                        return (<motion.div key={ev.id} whileHover={{scale:1.02,zIndex:20}} onClick={()=>setSelectedEvent(ev)}
                          className="absolute left-1 right-1 rounded-lg px-2 py-1 cursor-pointer overflow-hidden text-white z-10"
                          style={{top,height:h,background:ev.color,boxShadow:`0 2px 8px ${ev.color}55`}}>
                          <p className="text-[10px] font-bold leading-tight truncate">{ev.title}</p>
                          <p className="text-[9px] opacity-80">{ev.start} – {ev.end}</p>
                          {isSA && ev.enterprise_name && <p className="text-[8px] opacity-70 truncate">📌 {ev.enterprise_name}</p>}
                        </motion.div>);
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ DAY VIEW ══ */}
          {view==='day' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={()=>setSelectedDay(d=>Math.max(1,d-1))} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronLeft size={16}/></button>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 font-medium uppercase">{DAYS[new Date(year,month,selectedDay).getDay()]}</p>
                    <p className="text-2xl font-bold dark:text-white leading-tight">{selectedDay}</p>
                  </div>
                  <button onClick={()=>setSelectedDay(d=>Math.min(daysCount,d+1))} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronRight size={16}/></button>
                </div>
                <p className="text-sm font-semibold text-slate-500">{MONTHS[month]} {year}</p>
              </div>
              <div className="overflow-y-auto max-h-150 scrollbar-hide">
                <div className="relative flex" style={{height:24*56}}>
                  <div className="w-16 shrink-0 relative">
                    {HOURS.map((h,i)=><div key={i} className="h-14 flex items-start pt-1 pr-2 justify-end"><span className="text-[10px] text-slate-500 font-medium">{h}</span></div>)}
                  </div>
                  <div className="flex-1 relative">
                    {HOURS.map((_,i)=><div key={i} className="absolute w-full border-t border-slate-100 dark:border-slate-800/60" style={{top:i*56}}/>)}
                    {eventsOn(events,fmtDate(year,month,selectedDay)).map(ev=>{
                      const top=hourToTop(ev.start); const h=Math.max(eventHeight(ev.start,ev.end),40);
                      return (<motion.div key={ev.id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} whileHover={{scale:1.01}}
                        onClick={()=>setSelectedEvent(ev)}
                        className="absolute left-2 right-4 rounded-xl px-3 py-2 cursor-pointer text-white z-10"
                        style={{top,height:h,background:`linear-gradient(135deg,${ev.color},${ev.color}cc)`,boxShadow:`0 4px 14px ${ev.color}44`}}>
                        <p className="text-sm font-bold leading-tight">{ev.title}</p>
                        <p className="text-xs opacity-80 mt-0.5">{ev.start} – {ev.end}</p>
                        {isSA && ev.enterprise_name && <p className="text-[10px] opacity-80 mt-0.5">📌 {ev.enterprise_name}</p>}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <MapPin size={10} className="opacity-70"/><span className="text-[10px] opacity-70">{ev.location}</span>
                        </div>
                      </motion.div>);
                    })}
                    {eventsOn(events,fmtDate(year,month,selectedDay)).length===0&&(
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <CalIcon size={32} className="text-slate-200 dark:text-slate-700 mx-auto mb-2"/>
                          <p className="text-sm text-slate-400">No events today</p>
                          {!isSA && <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Click + New Event to add one</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: sidebar ── */}
        <div className="w-72 shrink-0 space-y-5">

          {/* Mini month picker */}
          <div className="glass-card p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevPeriod} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronLeft size={14}/></button>
              <p className="text-sm font-bold dark:text-white">{MONTHS[month].slice(0,3)} {year}</p>
              <button onClick={nextPeriod} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><ChevronRight size={14}/></button>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d=><div key={d} className="text-center text-[9px] font-bold text-slate-500">{d[0]}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((cell,i)=>{
                const hasEvt=eventsOn(events,cell.dateStr).length>0;
                const isT=isToday(cell.dateStr);
                return (
                  <div key={i} onClick={()=>{if(cell.cur) setSelectedDay(cell.day);}} className="flex flex-col items-center cursor-pointer">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-semibold transition-all
                      ${isT?'bg-primary text-white':''}
                      ${!cell.cur?'text-slate-400 dark:text-slate-600':'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{cell.day}</span>
                    {hasEvt&&cell.cur&&!isT&&<div className="w-1 h-1 rounded-full bg-primary mt-0.5"/>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event type legend */}
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3">
              Event Types — {monthEvents.length} this month
            </p>
            <div className="space-y-2">
              {Object.entries(TYPE_COLORS).map(([type,color])=>{
                const cnt=monthEvents.filter(e=>e.type===type).length;
                if(cnt===0) return null;
                return (
                  <div key={type} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:color}}/>
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{type}</span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-md" style={{background:`${color}33`,color}}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming events — grouped by enterprise for SA */}
          <div className="glass-card p-5 rounded-2xl">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Upcoming</p>
            {isSA && upcomingGrouped ? (
              <div className="space-y-4">
                {Object.entries(upcomingGrouped).map(([entName, evts]) => (
                  <div key={entName}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Building2 size={10} className="text-primary"/>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wide truncate">{entName}</p>
                    </div>
                    <div className="space-y-2 pl-3 border-l-2 border-primary/20">
                      {evts.map((ev,i)=>(
                        <motion.div key={ev.id} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                          onClick={()=>setSelectedEvent(ev)} className="flex items-start gap-2 cursor-pointer group">
                          <div className="w-8 h-8 rounded-lg flex flex-col items-center justify-center shrink-0 text-white"
                            style={{background:`linear-gradient(135deg,${ev.color},${ev.color}99)`}}>
                            <span className="text-[8px] font-bold leading-none opacity-80">{MONTHS[parseInt(ev.date.split('-')[1])-1].slice(0,3).toUpperCase()}</span>
                            <span className="text-xs font-bold leading-tight">{parseInt(ev.date.split('-')[2])}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-primary">{ev.title}</p>
                            <p className="text-[9px] text-slate-500">{ev.start} · {ev.assigner_name}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((ev,i)=>(
                  <motion.div key={ev.id} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                    onClick={()=>setSelectedEvent(ev)} className="flex items-start gap-3 cursor-pointer group">
                    <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 text-white"
                      style={{background:`linear-gradient(135deg,${ev.color},${ev.color}99)`}}>
                      <span className="text-[9px] font-bold leading-none opacity-80">{MONTHS[parseInt(ev.date.split('-')[1])-1].slice(0,3).toUpperCase()}</span>
                      <span className="text-sm font-bold leading-tight">{parseInt(ev.date.split('-')[2])}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-950 dark:text-white leading-tight truncate group-hover:text-primary">{ev.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-slate-500 shrink-0"/>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{ev.start} – {ev.end}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-slate-500 shrink-0"/>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate">{ev.location}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedEvent && (
          <EventModal event={selectedEvent} onClose={()=>setSelectedEvent(null)} isSA={isSA}
            onEdit={(ev)=>{ setSelectedEvent(null); setEditEvent(ev); setShowAddModal(true); }}/>
        )}
        {showAddModal && !isSA && (
          <AddEventModal defaultDate={addDate}
            onClose={()=>{ setShowAddModal(false); setEditEvent(null); }}
            editEvent={editEvent}
            onAdd={(ev)=>setEvents(prev=>editEvent?prev.map(e=>e.id===ev.id?ev:e):[...prev,ev])}/>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}