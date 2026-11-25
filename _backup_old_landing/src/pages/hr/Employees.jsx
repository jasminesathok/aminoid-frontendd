import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Search, MoreVertical,
  Edit2, Trash2, X, Save, Building2, DollarSign, Briefcase,Calendar, Eye
} from 'lucide-react';
import { api } from '../../utils/api';
import { useCurrency } from '../../context/CurrencyContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PALETTE    = ['#939BFF','#C4B5F4','#AEE9FF','#B6EADA','#7B99D9','#f59e0b','#10b981'];
const getColor   = i => PALETTE[i % PALETTE.length];
const getInitials= n => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U';


const DEPARTMENTS = ['Engineering','Design','Marketing','Sales','HR','Analytics','Operations','Finance'];

export default function Employees() {
  const { fmt } = useCurrency();
  const { symbol } = useCurrency();
  const navigate = useNavigate();
  const toast    = useToast();
  const { user } = useAuth();
const isSA = user?.role === 'super_admin';

  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [deptFilter,setDeptFilter]= useState('All');
  const [editEmp,   setEditEmp]   = useState(null);   // employee being edited
  const [editForm,  setEditForm]  = useState({});
  const [saving,    setSaving]    = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(null);   // id of row with open dropdown
  const [viewEmp, setViewEmp] = useState(null);

  useEffect(() => {
    api.get('/api/hr/employees')
      .then(res => setEmployees(res.data))
      .finally(() => setLoading(false));
  }, []);

  const depts = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))];

  const filtered = employees.filter(e => {
    const name = e.name || (e.first_name ? `${e.first_name} ${e.last_name || ''}`.trim() : '');
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                        e.role?.toLowerCase().includes(search.toLowerCase()) ||
                        e.employee_code?.toLowerCase().includes(search.toLowerCase());
    const matchDept   = deptFilter === 'All' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const grouped = isSA ? filtered.reduce((acc, e) => {
  const key = e.enterprise_id || 'unknown';
  const label = e.owner_first ? `${e.owner_first} ${e.owner_last}` : key;
  if (!acc[key]) acc[key] = { label, employees: [] };
  acc[key].employees.push(e);
  return acc;
}, {}) : null;
const groupList = grouped ? Object.values(grouped) : [];

  

  /* ── Edit ── */
  const openEdit = (emp) => {
    setEditEmp(emp);
    setEditForm({
      employeeCode:     emp.employee_code || '',
      name:             emp.name,
      role:             emp.role,
      department:       emp.department,
      salary:           emp.salary,
      status:           emp.status,
      phone:            emp.phone            || '',
      email:            emp.email            || '',
      emergencyContact: emp.emergency_contact || '',
      joinDate:         emp.join_date ? emp.join_date.split('T')[0] : '',  
      rank:             emp.emp_rank         || '',
      accountNo:        emp.account_no        || '',
      ifscCode:         emp.ifsc_code         || '',
      uan:              emp.uan              || '',
      esi:              emp.esi              || '',
      branch:           emp.branch           || '',
    });
    setMenuOpen(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/api/hr/employees/${editEmp.id}`, editForm);
      setEmployees(prev => prev.map(e => e.id === editEmp.id ? res.data : e));
      
      toast.success('Employee updated.');
      setEditEmp(null);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (emp) => {
    if (!window.confirm(`Remove ${emp.name} from the system?`)) return;
    await api.delete(`/api/hr/employees/${emp.id}`);
    setEmployees(prev => prev.filter(e => e.id !== emp.id));
    toast.success(`${emp.name} removed.`);
    setMenuOpen(null);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-8 px-2" onClick={() => setMenuOpen(null)}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Employees</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {employees.length} total · {employees.filter(e=>e.status==='Active').length} active
            </p>
          </div>
          <button onClick={() => navigate('/hr/employees/add')}
            className="btn-primary flex items-center gap-2 text-sm">
            <UserPlus size={16} /> Add Employee
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label:'Total',    value: employees.length,                                        color:'#939BFF', icon: Users      },
            { label:'Active',   value: employees.filter(e=>e.status==='Active').length,         color:'#10b981', icon: Users      },
            { label:'On Leave', value: employees.filter(e=>e.status==='On Leave').length,       color:'#f59e0b', icon: Users      },
            { label:'Inactive', value: employees.filter(e=>e.status==='Inactive').length,       color:'#ef4444', icon: Users      },
          ].map((c,i) => (
            <motion.div key={i} whileHover={{y:-4}} className="glass-card p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{background:`${c.color}18`,color:c.color}}><c.icon size={18}/></div>
              <div>
                <p className="text-2xl font-bold dark:text-white">{c.value}</p>
                <p className="text-xs text-slate-400">{c.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters + table */}
        <div className="glass-card rounded-2xl overflow-hidden">

          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100/60 dark:bg-slate-800/40 px-3 py-2 rounded-xl w-60 border border-white/5">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search name or role…"
                className="bg-transparent border-none outline-none text-sm w-full dark:text-white" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {depts.map(d => (
                <button key={d} onClick={() => setDeptFilter(d)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    deptFilter===d ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {['Employee','Role','Department','Salary','Status','Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                  {filtered.length === 0 && (
  <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400 text-sm">No employees found.</td></tr>
)}
{isSA ? (
  groupList.map((group, gi) => (
    <React.Fragment key={gi}>
      <tr>
        <td colSpan={6} className="px-5 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{group.label}</span>
            <span className="ml-1 text-xs text-slate-400">{group.employees.length} employees</span>
          </div>
        </td>
      </tr>
      {group.employees.map((emp, i) => (
        <motion.tr key={emp.id}
          initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
          className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
           {/* Employee */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{background:`linear-gradient(135deg,${getColor(i)},${getColor(i)}88)`}}>
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold dark:text-white">{emp.name}</p>
                          <p className="text-xs text-slate-400">
                            {emp.employee_code ? `${emp.employee_code} · ` : ''}
                            {emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{emp.role}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{emp.department || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold dark:text-white">{fmt(emp.salary)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        emp.status === 'Active'   ? 'bg-emerald-500/10 text-emerald-500' :
                        emp.status === 'On Leave' ? 'bg-amber-500/10 text-amber-600'    :
                                                    'bg-rose-500/10 text-rose-500'
                      }`}>{emp.status}</span>
                    </td>

                    {/* Actions */}
                    {/* Actions */}
                    <td className="px-5 py-3.5 relative">
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); setViewEmp(emp); setMenuOpen(null); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors" title="View">
                          <Eye size={16}/>
                        </button>
                        <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === emp.id ? null : emp.id); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <MoreVertical size={16}/>
                        </button>
                      </div>
                      <AnimatePresence>
                        {menuOpen === emp.id && (
                          <motion.div
                            initial={{opacity:0,scale:0.95,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-4}}
                            transition={{duration:0.12}}
                            onClick={e => e.stopPropagation()}
                            className="absolute right-2 top-10 z-50 w-32 glass-card rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <button onClick={() => openEdit(emp)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                              <Edit2 size={14}/> Edit
                            </button>
                            <button onClick={() => handleDelete(emp)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors">
                              <Trash2 size={14}/> Remove
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
        </motion.tr>
      ))}
    </React.Fragment>
  ))
) : (
  filtered.map((emp, i) => (
    <motion.tr key={emp.id}
                    initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">

                   {/* Employee */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{background:`linear-gradient(135deg,${getColor(i)},${getColor(i)}88)`}}>
                          {getInitials(emp.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold dark:text-white">{emp.name}</p>
                          <p className="text-xs text-slate-400">
                            {emp.employee_code ? `${emp.employee_code} · ` : ''}
                            {emp.join_date ? new Date(emp.join_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{emp.role}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">{emp.department || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold dark:text-white">{fmt(emp.salary)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        emp.status === 'Active'   ? 'bg-emerald-500/10 text-emerald-500' :
                        emp.status === 'On Leave' ? 'bg-amber-500/10 text-amber-600'    :
                                                    'bg-rose-500/10 text-rose-500'
                      }`}>{emp.status}</span>
                    </td>

                    {/* Actions */}
                    {/* Actions */}
                    <td className="px-5 py-3.5 relative">
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); setViewEmp(emp); setMenuOpen(null); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors" title="View">
                          <Eye size={16}/>
                        </button>
                        <button onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === emp.id ? null : emp.id); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <MoreVertical size={16}/>
                        </button>
                      </div>
                      <AnimatePresence>
                        {menuOpen === emp.id && (
                          <motion.div
                            initial={{opacity:0,scale:0.95,y:-4}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95,y:-4}}
                            transition={{duration:0.12}}
                            onClick={e => e.stopPropagation()}
                            className="absolute right-2 top-10 z-50 w-32 glass-card rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <button onClick={() => openEdit(emp)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-colors">
                              <Edit2 size={14}/> Edit
                            </button>
                            <button onClick={() => handleDelete(emp)}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors">
                              <Trash2 size={14}/> Remove
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                   
                  </motion.tr>
  ))
)}

                
                
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit slide-over */}
        <AnimatePresence>
          {editEmp && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={() => setEditEmp(null)}/>
              <motion.div
                initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setEditEmp(null)}>
                <div className="glass-card rounded-2xl p-8 w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold dark:text-white">Edit Employee</h2>
                    <button onClick={() => setEditEmp(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <X size={18}/>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      {[
                        { label:'Employee ID', key:'employeeCode', type:'text', icon: Users,      placeholder:'EMP-001' },
                        { label:'Full Name',   key:'name',       type:'text',   icon: Users,      placeholder:'John Doe' },
                        { label:'Role',        key:'role',       type:'text',   icon: Briefcase,  placeholder:'Software Engineer' },
                        { label:`Salary (${symbol})`, key:'salary',     type:'number', icon: DollarSign, placeholder:'5000' },
                        { label:'Phone',             key:'phone',            type:'text',   icon: Users, placeholder:'+91 9876543210' },
                        { label:'Email',             key:'email',             type:'email',  icon: Users, placeholder:'emp@company.com' },
                        { label:'Emergency Contact', key:'emergencyContact',  type:'text',   icon: Users, placeholder:'Name — phone' },
                        { label:'Date of Joining', key:'joinDate', type:'date', icon: Calendar, placeholder:'' },
                        { label:'Rank', key:'rank', type:'text', icon: Briefcase, placeholder:'e.g. Senior Grade A' },
                        { label:'Account No', key:'accountNo', type:'text', icon: DollarSign, placeholder:'e.g. 1234567890' },
                        { label:'IFSC Code', key:'ifscCode', type:'text', icon: Building2, placeholder:'e.g. HDFC0000123' },
                        { label:'UAN', key:'uan', type:'text', icon: Users, placeholder:'e.g. 100987654321' },
                        { label:'ESI Number', key:'esi', type:'text', icon: Users, placeholder:'e.g. ESI-123456' },
                        { label:'Branch / Location', key:'branch', type:'text', icon: Building2, placeholder:'e.g. New York' },
                      ].map(f => (
                        <div key={f.key} className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <f.icon size={13} className="text-slate-400"/>{f.label}
                          </label>
                          <input type={f.type} placeholder={f.placeholder}
                            value={editForm[f.key] ?? ''}
                            onChange={e => setEditForm(p => ({...p,[f.key]:e.target.value}))}
                            className={`input-field ${f.type === 'date' ? 'dark:[color-scheme:dark]' : ''}`}/>
                        </div>
                      ))}

                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Building2 size={13} className="text-slate-400"/>Department
                        </label>
                        <select value={editForm.department ?? ''}
                          onChange={e => setEditForm(p => ({...p,department:e.target.value}))}
                          className="input-field">
                          <option value="">Select department</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Status</label>
                        <div className="flex gap-2 w-full md:w-1/2">
                          {['Active','On Leave','Inactive'].map(s => (
                            <button key={s} type="button"
                              onClick={() => setEditForm(p => ({...p,status:s}))}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                                editForm.status === s
                                  ? s==='Active' ? 'bg-emerald-500 text-white' : s==='On Leave' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary'
                              }`}>{s}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => setEditEmp(null)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={saving}
                        className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm disabled:opacity-60">
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Save size={15}/>}
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
  {viewEmp && (
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={() => setViewEmp(null)}/>
      <motion.div
        initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={() => setViewEmp(null)}>
        <div className="glass-card rounded-2xl p-8 w-full max-w-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold dark:text-white">Employee Details</h2>
            <button onClick={() => setViewEmp(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18}/>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            {[
              { label: 'Employee ID',        value: viewEmp.employee_code || '—' },
              { label: 'Full Name',          value: viewEmp.name },
              { label: 'Role',               value: viewEmp.role },
              { label: 'Department',         value: viewEmp.department },
              { label: 'Salary',             value: fmt(viewEmp.salary) },
              { label: 'Status',             value: viewEmp.status },
              { label: 'Phone',              value: viewEmp.phone || '—' },
              { label: 'Email',              value: viewEmp.email || '—' },
              { label: 'Emergency Contact',  value: viewEmp.emergency_contact || '—' },
              { label: 'Date of Joining',    value: viewEmp.join_date ? new Date(viewEmp.join_date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—' },
              { label: 'Rank',               value: viewEmp.emp_rank || '—' },
              { label: 'Account No',         value: viewEmp.account_no || '—' },
              { label: 'IFSC Code',          value: viewEmp.ifsc_code || '—' },
              { label: 'UAN',                value: viewEmp.uan || '—' },
              { label: 'ESI Number',         value: viewEmp.esi || '—' },
              { label: 'Branch / Location',  value: viewEmp.branch || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-semibold dark:text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </DashboardLayout>
  );
}