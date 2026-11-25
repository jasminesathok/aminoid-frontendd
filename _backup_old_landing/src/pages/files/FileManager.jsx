import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder, FileText, Image, Film, Music, Archive,
  Upload, Plus, Search, Grid, List, Trash2, Share2,
  Star, ChevronRight, HardDrive, Clock, X, Building2,
  ChevronLeft, Users,
} from 'lucide-react';

const PALETTE  = ['#939BFF','#C4B5F4','#f59e0b','#10b981','#AEE9FF','#B6EADA'];
const getColor = (i) => PALETTE[i % PALETTE.length];
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—';
const fmtBytes = (b) => { b=Number(b)||0; if(b<1024) return b+' B'; if(b<1048576) return (b/1024).toFixed(1)+' KB'; return (b/1048576).toFixed(1)+' MB'; };
const guessType= (file) => {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return 'image';
  if (['mp4','mov','avi','webm'].includes(ext)) return 'video';
  if (['mp3','wav','ogg'].includes(ext)) return 'audio';
  if (['zip','rar','7z','tar','gz'].includes(ext)) return 'zip';
  if (ext==='pdf') return 'pdf';
  if (['xls','xlsx','csv'].includes(ext)) return 'excel';
  if (['doc','docx'].includes(ext)) return 'word';
  return 'pdf';
};
const typeConfig = {
  pdf:   { icon: FileText, color:'#ef4444', label:'PDF'   },
  excel: { icon: FileText, color:'#10b981', label:'Excel' },
  image: { icon: Image,    color:'#f59e0b', label:'Image' },
  video: { icon: Film,     color:'#C4B5F4', label:'Video' },
  word:  { icon: FileText, color:'#3b82f6', label:'Word'  },
  zip:   { icon: Archive,  color:'#94a3b8', label:'ZIP'   },
};

export default function FileManager() {
  const { user } = useAuth();
  const isSA = user?.role === 'super_admin';

  const [files,          setFiles]          = useState([]);
  const [view,           setView]           = useState('grid');
  const [search,         setSearch]         = useState('');
  const [tab,            setTab]            = useState('All');
  const [loading,        setLoading]        = useState(true);
  const [showUpload,     setShowUpload]     = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [uploadErr,      setUploadErr]      = useState('');
  const [activeQuick,    setActiveQuick]    = useState('My Files');
  const [selectedFolder, setSelectedFolder] = useState('Root');

  // SA drill-down state
  const [selectedEnterprise, setSelectedEnterprise] = useState(null); // null = show enterprise list

  const fileInputRef = useRef(null);

  const loadFiles = () => api.get('/api/files').then(res => {
    const raw = res.data?.data || res.data || [];
    setFiles(raw.map(f => ({ ...f, size: f.size ? fmtBytes(Number(f.size)) : '0 B' })));
  });

  useEffect(() => { loadFiles().finally(() => setLoading(false)); }, []);

  // ── Group files by enterprise for SA ──────────────────────────────────────
  const enterpriseGroups = isSA
    ? Object.values(files.reduce((acc, f) => {
        const eid = f.enterprise_id || 'unknown';
        const name = f.enterprise_name || (f.ent_first ? `${f.ent_first} ${f.ent_last}` : 'Unknown');
        if (!acc[eid]) acc[eid] = { eid, name, files: [] };
        acc[eid].files.push(f);
        return acc;
      }, {}))
    : null;

  // Files visible in current view (SA: filtered to selected enterprise)
  const visibleFiles = isSA && selectedEnterprise
    ? files.filter(f => (f.enterprise_id || 'unknown') === selectedEnterprise.eid)
    : files;

  const folders = Object.entries(
    visibleFiles.reduce((acc, f) => {
      const key = f.folder || 'Root';
      if (!acc[key]) acc[key] = { name: key, count: 0 };
      acc[key].count++;
      return acc;
    }, {})
  ).map(([name, v], i) => ({ id: i, name, color: getColor(i), files: visibleFiles.filter(x => x.folder === name && x.name !== '.folder').length }));

  const filteredFiles = visibleFiles.filter(f => {
    if (f.name === '.folder') return false;
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchTab    = tab === 'All' || f.folder === tab;
    const matchQuick  = activeQuick === 'My Files' ? true : activeQuick === 'Starred' ? f.starred : activeQuick === 'Recent' ? !!f.modified : true;
    return matchSearch && matchTab && matchQuick;
  });

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;
    setUploading(true); setUploadErr('');
    try {
      await Promise.all(selectedFiles.map((file) =>
        api.post('/api/files', {
          name: file.name,
          size: file.size,
          type: guessType(file),
          folder: selectedFolder,
        })
      ));
      await loadFiles();
      setShowUpload(false);
    } catch (err) { setUploadErr(err.message); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try { await api.delete('/api/files/'+id); setFiles(prev => prev.filter(f => f.id !== id)); }
    catch (err) { console.error(err); }
  };

  const createFolder = async () => {
    const name = window.prompt('Folder name:');
    if (!name?.trim()) return;
    const folderName = name.trim();
    try {
      await api.post('/api/files', {
        name: '.folder',
        size: 0,
        type: 'folder',
        folder: folderName,
      });
      setSelectedFolder(folderName);
      await loadFiles();
    } catch (err) {
      console.error('Could not create folder:', err);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    </DashboardLayout>
  );

  // ════════════════════════════════════════════════════════
  // SUPER ADMIN — Enterprise List view (no enterprise selected)
  // ════════════════════════════════════════════════════════
  if (isSA && !selectedEnterprise) {
    return (
      <DashboardLayout>
        <div className="max-w-full mx-auto space-y-6 px-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold dark:text-white">File Manager</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {enterpriseGroups.length} enterprise{enterpriseGroups.length !== 1 ? 's' : ''} · {files.filter(f=>f.name!=='.folder').length} total files
              </p>
            </div>
          </div>

          {/* Enterprise cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enterpriseGroups.map((group, i) => {
              const nonFolder = group.files.filter(f => f.name !== '.folder');
              const folderSet = new Set(group.files.map(f => f.folder).filter(Boolean));
              return (
                <motion.div key={group.eid} whileHover={{ y: -4 }}
                  onClick={() => setSelectedEnterprise(group)}
                  className="glass-card p-6 rounded-2xl cursor-pointer group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${getColor(i)}18`, color: getColor(i) }}>
                      <Building2 size={22}/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold dark:text-white text-base truncate">{group.name}</p>
                      <p className="text-xs text-slate-400">{nonFolder.length} file{nonFolder.length !== 1 ? 's' : ''} · {folderSet.size} folder{folderSet.size !== 1 ? 's' : ''}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-primary transition-colors shrink-0"/>
                  </div>

                  {/* File type breakdown */}
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(
                      nonFolder.reduce((acc,f) => { acc[f.type]=(acc[f.type]||0)+1; return acc; }, {})
                    ).slice(0,4).map(([type,cnt]) => {
                      const cfg = typeConfig[type] || typeConfig.pdf;
                      return (
                        <span key={type} className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: `${cfg.color}18`, color: cfg.color }}>
                          {cfg.label} ({cnt})
                        </span>
                      );
                    })}
                  </div>

                  {/* Recent files preview */}
                  {nonFolder.length > 0 && (
                    <div className="mt-4 space-y-1.5">
                      {nonFolder.slice(0, 3).map(f => {
                        const cfg = typeConfig[f.type] || typeConfig.pdf;
                        return (
                          <div key={f.id} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: `${cfg.color}18`, color: cfg.color }}>
                              <cfg.icon size={11}/>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1">{f.name}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{fmtDate(f.modified)}</span>
                          </div>
                        );
                      })}
                      {nonFolder.length > 3 && (
                        <p className="text-[10px] text-slate-400 pl-8">+{nonFolder.length-3} more files</p>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
            {enterpriseGroups.length === 0 && (
              <div className="col-span-3 py-20 text-center text-slate-400">
                <Building2 size={40} className="mx-auto mb-3 opacity-30"/>
                <p>No files uploaded by any enterprise yet.</p>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ════════════════════════════════════════════════════════
  // NORMAL view — either regular user, or SA drilled into an enterprise
  // ════════════════════════════════════════════════════════
  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6 px-2">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {isSA && selectedEnterprise && (
              <button onClick={() => { setSelectedEnterprise(null); setTab('All'); setSearch(''); }}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                <ChevronLeft size={18}/>
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold dark:text-white">File Manager</h1>
              {isSA && selectedEnterprise
                ? <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <Building2 size={13}/> <span className="font-semibold text-primary">{selectedEnterprise.name}</span>
                    <span className="mx-1">·</span>{filteredFiles.length} files
                  </p>
                : <p className="text-slate-500 dark:text-slate-400 mt-1">All your files in one place.</p>
              }
            </div>
          </div>
          {!isSA && (
            <div className="flex items-center gap-3">
              <button onClick={() => setShowUpload(true)}
                className="btn-primary flex items-center gap-2 text-sm">
                <Upload size={15}/> Upload
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Storage */}
            <div className="glass-card p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HardDrive size={18} className="text-primary"/>
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">
                    {isSA && selectedEnterprise ? selectedEnterprise.name : 'Cloud Storage'}
                  </p>
                  <p className="text-xs text-slate-400">{visibleFiles.filter(f=>f.name!=='.folder').length} files stored</p>
                </div>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
                <div className="rounded-full" style={{ width:'18.4%', background:'#939BFF' }}/>
                <div className="rounded-full" style={{ width:'6.8%',  background:'#C4B5F4' }}/>
                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full"/>
              </div>
              {[
                { label:'Files',   value: visibleFiles.filter(f=>f.name!=='.folder').length, color:'#939BFF' },
                { label:'Folders', value: folders.length, color:'#C4B5F4' },
              ].map((s,i) => (
                <div key={i} className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }}/>
                    <span className="text-slate-500">{s.label}</span>
                  </div>
                  <span className="font-bold dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>

            {/* Quick Access — only for non-SA */}
            {!isSA && (
              <div className="glass-card p-5 rounded-2xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Access</p>
                <div className="space-y-1">
                  {[{label:'My Files',icon:HardDrive},{label:'Starred',icon:Star},{label:'Recent',icon:Clock}].map((item,i) => (
                    <button key={i} onClick={() => setActiveQuick(item.label)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeQuick===item.label?'bg-primary/10 text-primary':'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/30'
                      }`}>
                      <item.icon size={15}/>{item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 space-y-5">

            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-white/5 w-full max-w-xs">
              <Search size={14} className="text-slate-400 shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search files…"
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white"/>
            </div>

            {/* Folders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold dark:text-white">Folders</p>
                {!isSA && (
                  <button onClick={createFolder}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/80 flex items-center gap-1">
                    <Plus size={12}/> New Folder
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {folders.map((f,i) => (
                  <motion.div key={f.id} whileHover={{ y:-3 }}
                    onClick={() => setTab(f.name)}
                    className={`glass-card p-4 rounded-xl cursor-pointer flex items-center gap-3 group transition-all ${tab===f.name?'ring-2 ring-primary/30':''}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background:`${f.color}18`, color:f.color }}>
                      <Folder size={20}/>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold dark:text-white truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400">{f.files} file{f.files!==1?'s':''}</p>
                    </div>
                  </motion.div>
                ))}
                {folders.length === 0 && (
                  <div className="col-span-3 py-6 text-center text-slate-400 text-xs">No folders yet.</div>
                )}
              </div>
            </div>

            {/* File tabs + view toggle */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2 flex-wrap">
                {['All', ...folders.map(f => f.name)].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      tab===t?'bg-primary text-white shadow-sm shadow-primary/30':'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                    }`}>{t}</button>
                ))}
              </div>
              <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {[{v:'grid',I:Grid},{v:'list',I:List}].map(({v,I}) => (
                  <button key={v} onClick={() => setView(v)}
                    className={`px-3 py-1.5 transition-all ${view===v?'bg-primary text-white':'text-slate-400 hover:text-primary'}`}>
                    <I size={14}/>
                  </button>
                ))}
              </div>
            </div>

            {/* Grid view */}
            {view==='grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredFiles.map((f,i) => {
                  const cfg  = typeConfig[f.type] || typeConfig.pdf;
                  const Icon = cfg.icon;
                  const owner = f.enterprise_name || (f.ent_first ? `${f.ent_first} ${f.ent_last}` : null);
                  return (
                    <motion.div key={f.id}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
                      whileHover={{ y:-3 }}
                      className="glass-card p-4 rounded-xl cursor-pointer group flex flex-col">
                      <div className="w-full h-20 rounded-lg flex items-center justify-center mb-3"
                        style={{ background:`${cfg.color}12` }}>
                        <Icon size={28} style={{ color:cfg.color }}/>
                      </div>
                      <p className="text-xs font-bold dark:text-white leading-tight truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{f.size} · {fmtDate(f.modified)}</p>
                      {/* SA: show enterprise/owner attribution */}
                      {isSA && owner && (
                        <p className="text-[9px] text-primary font-semibold mt-0.5 truncate flex items-center gap-1">
                          <Building2 size={8}/>{owner}
                        </p>
                      )}
                      {!isSA && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-slate-400 hover:text-primary"><Share2 size={12}/></button>
                          <button onClick={() => handleDelete(f.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={12}/></button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
                {filteredFiles.length===0 && (
                  <div className="col-span-4 py-12 text-center text-slate-400 text-sm">No files found.</div>
                )}
              </div>
            )}

            {/* List view */}
            {view==='list' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Name','Type','Size','Modified', ...(isSA?['Enterprise/Owner']:[]), ''].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((f,i) => {
                      const cfg  = typeConfig[f.type] || typeConfig.pdf;
                      const Icon = cfg.icon;
                      const owner = f.enterprise_name || (f.ent_first ? `${f.ent_first} ${f.ent_last}` : '—');
                      return (
                        <motion.tr key={f.id}
                          initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.04 }}
                          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background:`${cfg.color}18`, color:cfg.color }}>
                                <Icon size={15}/>
                              </div>
                              <span className="text-sm font-semibold dark:text-white">{f.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                              style={{ background:`${cfg.color}18`, color:cfg.color }}>{cfg.label}</span>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{f.size}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-400">{fmtDate(f.modified)}</td>
                          {isSA && (
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <Building2 size={11} className="text-primary shrink-0"/>
                                <span className="text-xs text-primary font-semibold truncate max-w-32">{owner}</span>
                              </div>
                            </td>
                          )}
                          {!isSA && (
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDelete(f.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={14}/></button>
                              </div>
                            </td>
                          )}
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect}/>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && !isSA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowUpload(false)}>
            <motion.div initial={{ scale:.93,opacity:0 }} animate={{ scale:1,opacity:1 }}
              className="glass-card rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold dark:text-white">Upload Files</h3>
                <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X size={16}/></button>
              </div>
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <Upload size={32} className="text-primary mx-auto mb-3"/>
                <p className="text-sm font-bold dark:text-white">Drag & drop or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Any file type supported</p>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Upload to folder</label>
                <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)} className="input-field w-full text-sm">
                  <option value="Root">Root</option>
                  {folders.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
                </select>
              </div>
              {uploadErr && <p className="mt-3 text-xs text-rose-500 font-semibold text-center">{uploadErr}</p>}
              <div className="flex gap-3 mt-6">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="btn-primary flex-1 text-sm disabled:opacity-60">
                  {uploading ? 'Uploading…' : 'Browse & Upload'}
                </button>
                <button onClick={() => setShowUpload(false)}
                  className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
