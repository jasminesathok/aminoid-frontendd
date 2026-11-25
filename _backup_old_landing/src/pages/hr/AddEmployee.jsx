import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Save,
  Copy,
  Check,
  LayoutDashboard,
  Trello,
  FileText,
  ShieldCheck,
  UserCircle,
  Tag,
  HelpCircle,
  Users,
  Clock,
  CalendarDays,
  MoreHorizontal,
  BarChart2,
  Megaphone,
  UserPlus,
  Mail,
  Share2,
  BookOpen,
  Receipt,
  CreditCard as CardIcon,
  FileMinus,
  Package,
  UserCheck,
  MapPin,
  LayoutGrid,
  FolderKanban,
  ListTodo,
  UsersRound,
  GanttChartSquare,
  ClipboardList,
  TrendingUp as TrendUp,
  LineChart,
  BarChart3,
  Wrench,
  Building,
  BookOpenText,
  FolderTree,
  Palette,
  Type,
  Boxes,
  Layers,
  Star,
  Zap,
  Bell,
  UserCog,
  Plug,
  PieChart,
  ArrowLeftRight,
  FileSignature,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { api } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import { useCurrency } from "../../context/CurrencyContext";

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Analytics",
  "Operations",
  "Finance",
];
const ROLES_LIST = [
  "Software Engineer",
  "Senior Engineer",
  "Designer",
  "Product Manager",
  "HR Manager",
  "Sales Executive",
  "Data Analyst",
  "DevOps Engineer",
  "Marketing Lead",
  "Finance Officer",
];

/* ── All sidebar sections available for employee access ── */
const SIDEBAR_SECTION_ORDER = [
  "applications",
  "hr",
  "marketing",
  "sales",
  "projects",
  "accounts_module",
  "reports",
  "knowledge",
  "utilities",
  "audiences",
  "subscriptions",
  "setup",
];

const SIDEBAR_SECTIONS = [
  {
    groupTitle: "Applications",
    key: "applications",
    items: [
      { key: "dashboards", label: "Dashboards", icon: LayoutDashboard, iconBg: "bg-blue-500/10 text-blue-500" },
      { key: "calendar", label: "Calendar", icon: Calendar, iconBg: "bg-purple-500/10 text-purple-500" },
      { key: "kanban", label: "Kanban Board", icon: Trello, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "files", label: "File Manager", icon: FileText, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "auth", label: "Authentication", icon: ShieldCheck, iconBg: "bg-rose-500/10 text-rose-500" },
      { key: "price_plans", label: "Price Plans", icon: CardIcon, iconBg: "bg-teal-500/10 text-teal-500" },
    ],
  },
  {
    groupTitle: "Human Resource",
    key: "hr",
    items: [
      { key: "hr_dashboard", label: "HR Dashboard", icon: Users, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "employees", label: "Employees", icon: UserPlus, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "payroll", label: "Payroll", icon: DollarSign, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "attendance", label: "Attendance", icon: Clock, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "leave", label: "Leave", icon: CalendarDays, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "others", label: "Others", icon: MoreHorizontal, iconBg: "bg-pink-500/10 text-pink-500" },
    ],
  },
  {
    groupTitle: "Marketing",
    key: "marketing",
    items: [
      { key: "marketing_overview", label: "Overview", icon: BarChart2, iconBg: "bg-primary/10 text-primary" },
      { key: "campaigns", label: "Campaigns", icon: Megaphone, iconBg: "bg-rose-500/10 text-rose-500" },
      { key: "leads", label: "Leads", icon: UserPlus, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "email_marketing", label: "Email Marketing", icon: Mail, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "social_media", label: "Social Media", icon: Share2, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "influencer", label: "Influencer Marketing", icon: UserCheck, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "field_marketing", label: "Field Marketing", icon: MapPin, iconBg: "bg-orange-500/10 text-orange-500" },
    ],
  },
  {
    groupTitle: "Sales",
    key: "sales",
    items: [
      { key: "sales_overview", label: "Overview", icon: BarChart2, iconBg: "bg-primary/10 text-primary" },
      { key: "accounts", label: "Accounts", icon: Building2, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "proposals", label: "Proposals", icon: FileSignature, iconBg: "bg-blue-500/10 text-blue-500" },
      { key: "estimates", label: "Estimates", icon: FileText, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "invoices", label: "Invoices", icon: Receipt, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "payments", label: "Payments", icon: CardIcon, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "credit_notes", label: "Credit Notes", icon: FileMinus, iconBg: "bg-rose-500/10 text-rose-500" },
      { key: "items", label: "Items", icon: Package, iconBg: "bg-amber-500/10 text-amber-500" },
    ],
  },
  {
    groupTitle: "Project Management",
    key: "projects",
    items: [
      { key: "projects_overview", label: "Overview", icon: LayoutGrid, iconBg: "bg-primary/10 text-primary" },
      { key: "projects_list", label: "Projects", icon: FolderKanban, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "tasks", label: "Tasks", icon: ListTodo, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "team", label: "Team", icon: UsersRound, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "timeline", label: "Timeline", icon: GanttChartSquare, iconBg: "bg-amber-500/10 text-amber-500" },
    ],
  },
  {
    groupTitle: "Knowledge Base",
    key: "knowledge",
    items: [
      { key: "knowledge_overview", label: "Overview", icon: BookOpenText, iconBg: "bg-primary/10 text-primary" },
      { key: "articles", label: "Articles", icon: FileText, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "categories", label: "Categories", icon: FolderTree, iconBg: "bg-sky-500/10 text-sky-500" },
    ],
  },
  {
    groupTitle: "Utilities",
    key: "utilities",
    items: [
      { key: "components", label: "Components", icon: Boxes, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "colours", label: "Colours", icon: Palette, iconBg: "bg-pink-500/10 text-pink-500" },
      { key: "typography", label: "Typography", icon: Type, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "icons", label: "Icons", icon: Layers, iconBg: "bg-sky-500/10 text-sky-500" },
    ],
  },
  {
    groupTitle: "Subscriptions",
    key: "subscriptions",
    items: [
      { key: "sub_overview", label: "Overview", icon: Star, iconBg: "bg-primary/10 text-primary" },
      { key: "plans", label: "Plans", icon: Zap, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "billing", label: "Billing", icon: Receipt, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "usage", label: "Usage", icon: BarChart3, iconBg: "bg-sky-500/10 text-sky-500" },
    ],
  },
  {
    groupTitle: "Setup",
    key: "setup",
    items: [
      { key: "company_setting", label: "Company Setting", icon: Building, iconBg: "bg-primary/10 text-primary" },
      { key: "users_roles", label: "Users & Roles", icon: UserCog, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "integrations", label: "Integrations", icon: Plug, iconBg: "bg-sky-500/10 text-sky-500" },
      { key: "asset_management", label: "Asset Management", icon: Package, iconBg: "bg-teal-500/10 text-teal-500" },
      { key: "notifications", label: "Notifications", icon: Bell, iconBg: "bg-rose-500/10 text-rose-500" },
    ],
  },
  {
    groupTitle: "Reports",
    key: "reports",
    items: [
      { key: "reports_overview", label: "Overview", icon: ClipboardList, iconBg: "bg-primary/10 text-primary" },
      { key: "reports_sales", label: "Sales", icon: TrendUp, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "analytics", label: "Analytics", icon: LineChart, iconBg: "bg-violet-500/10 text-violet-500" },
      { key: "performance", label: "Performance", icon: BarChart3, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "custom", label: "Custom", icon: Wrench, iconBg: "bg-sky-500/10 text-sky-500" },
    ],
  },
  {
    groupTitle: "Accounts",
    key: "accounts_module",
    items: [
      { key: "accounts_overview", label: "Overview", icon: PieChart, iconBg: "bg-primary/10 text-primary" },
      { key: "accounts_invoices", label: "Invoices", icon: Receipt, iconBg: "bg-emerald-500/10 text-emerald-500" },
      { key: "expenses", label: "Expenses", icon: CardIcon, iconBg: "bg-rose-500/10 text-rose-500" },
      { key: "transactions", label: "Transactions", icon: ArrowLeftRight, iconBg: "bg-amber-500/10 text-amber-500" },
      { key: "accounts_reports", label: "Reports", icon: BookOpen, iconBg: "bg-violet-500/10 text-violet-500" },
    ],
  },
  {
    groupTitle: "Audiences",
    key: "audiences",
    items: [
      { key: "profile", label: "Profile", icon: UserCircle, iconBg: "bg-indigo-500/10 text-indigo-500" },
      { key: "pricing_plans", label: "Pricing Plans", icon: Tag, iconBg: "bg-cyan-500/10 text-cyan-500" },
      { key: "faqs", label: "FAQs", icon: HelpCircle, iconBg: "bg-orange-500/10 text-orange-500" },
    ],
  },
];

const Field = ({ label, icon: Icon, children }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
      <Icon size={14} className="text-slate-400" />
      {label}
    </label>
    {children}
  </div>
);

export default function AddEmployee() {
  const { symbol } = useCurrency();
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    employeeCode: "",
    name: "",
    role: "",
    department: "",
    salary: "",
    joinDate: new Date().toISOString().split("T")[0],
    userId: "",
    phone: "",
    email: "",
    emergencyContact: "",
    rank: "",
    accountNo: "",
    ifscCode: "",
    uan: "",
    esi: "",
    branch: "",
  });
  const [selectedSections, setSelectedSections] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    const emergencyContact = form.emergencyContact.trim();
    const emergencyContactDigits = emergencyContact.replace(/\D/g, "");
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.role.trim()) e.role = "Role is required";
    if (!form.department) e.department = "Department is required";
    if (!form.salary || isNaN(form.salary) || Number(form.salary) < 0)
      e.salary = "Enter a valid salary";
    if (!form.joinDate) e.joinDate = "Join date is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!emergencyContact) {
      e.emergencyContact = "Emergency contact number is required";
    } else if (
      !/^\+?[\d\s().-]+$/.test(emergencyContact) ||
      emergencyContactDigits.length < 7 ||
      emergencyContactDigits.length > 15
    ) {
      e.emergencyContact = "Enter a valid emergency contact number";
    }
    return e;
  };

  const handleNext = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  /* ── Section toggle helpers ── */
  const toggleSection = (key) => {
    setSelectedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleGroup = (group) => {
    const allKeys = group.items.map((i) => i.key);
    const allSelected = allKeys.every((k) => selectedSections.includes(k));
    if (allSelected) {
      setSelectedSections((prev) => prev.filter((k) => !allKeys.includes(k)));
    } else {
      setSelectedSections((prev) => [...new Set([...prev, ...allKeys])]);
    }
  };

  const toggleExpandGroup = (key) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    const allKeys = SIDEBAR_SECTIONS.flatMap((g) => g.items.map((i) => i.key));
    setSelectedSections(allKeys);
  };

  const deselectAll = () => {
    setSelectedSections([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setStep(1);
      return;
    }
    setLoading(true);
    try {
      // Build the approved sections array: include both item-level keys
      // AND group-level keys so the sidebar canSee() remains compatible
      const groupLevelKeys = SIDEBAR_SECTIONS
        .filter((group) =>
          group.items.some((item) => selectedSections.includes(item.key))
        )
        .map((group) => group.key);
      const approvedSections = [
        ...new Set([...selectedSections, ...groupLevelKeys]),
      ];

      const res = await api.post("/api/hr/employees", {
        employeeCode: form.employeeCode.trim() || undefined,
        name: form.name.trim(),
        role: form.role.trim(),
        department: form.department,
        salary: Number(form.salary),
        joinDate: form.joinDate,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        emergencyContact: form.emergencyContact.trim() || undefined,
        rank: form.rank.trim() || undefined,
        accountNo: form.accountNo.trim() || undefined,
        ifscCode: form.ifscCode.trim() || undefined,
        uan: form.uan.trim() || undefined,
        esi: form.esi.trim() || undefined,
        branch: form.branch.trim() || undefined,
        approvedSections,
      });
      toast.success(`${form.name} added successfully!`);
      setSuccessData({
        employeeCode: res.employeeCode,
        password: res.generatedPassword,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!successData) return;
    const text = `Employee ID: ${successData.employeeCode}\nPassword: ${successData.password}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Success screen ── */
  if (successData) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto space-y-8 px-2 pt-10 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-10 rounded-2xl space-y-6 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold dark:text-white">
              Employee Added!
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              A user account has been automatically created for {form.name}.
              Please securely share these login details with them.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl w-full text-left space-y-4 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Employee ID (Login)
                </label>
                <div className="text-xl font-mono font-bold dark:text-white mt-1">
                  {successData.employeeCode}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Temporary Password
                </label>
                <div className="text-xl font-mono font-bold text-primary mt-1">
                  {successData.password}
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full pt-4">
              <button
                onClick={handleCopy}
                className="flex-1 py-3 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} />
                )}
                {copied ? "Copied!" : "Copy Details"}
              </button>
              <button
                onClick={() => navigate("/hr/employees")}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  /* ── Step indicator ── */
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2].map((s) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                step >= s
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              {step > s ? <Check size={16} strokeWidth={3} /> : s}
            </div>
            <span
              className={`text-sm font-semibold hidden sm:block transition-colors ${
                step >= s
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400"
              }`}
            >
              {s === 1 ? "Employee Details" : "Dashboard Access"}
            </span>
          </div>
          {s < 2 && (
            <div
              className={`w-12 h-0.5 rounded-full transition-colors duration-300 ${
                step > 1
                  ? "bg-primary"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 px-2">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => step === 2 ? handleBack() : navigate("/hr/employees")}
            className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-primary/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">Add Employee</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {step === 1
                ? "Fill in the details to register a new employee."
                : "Choose which dashboard sections this employee can access."}
            </p>
          </div>
        </div>

        <StepIndicator />

        <AnimatePresence mode="wait">
          {/* ═══════════════ STEP 1: Employee Details ═══════════════ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass-card p-8 rounded-2xl space-y-6"
            >
              {/* Avatar preview */}
              <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary/20">
                  {form.name ? (
                    form.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  ) : (
                    <User size={24} />
                  )}
                </div>
                <div>
                  <p className="font-bold dark:text-white text-lg">
                    {form.name || "New Employee"}
                  </p>
                  <p className="text-sm text-slate-400">
                    {form.role || "Role not set"} ·{" "}
                    {form.department || "No department"}
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Employee ID (Optional)" icon={User}>
                  <input
                    type="text"
                    placeholder="e.g. EMP-001 (Auto-generated if blank)"
                    value={form.employeeCode}
                    onChange={(e) => set("employeeCode", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <Field label="Full Name" icon={User}>
                  <input
                      type="text"
                      placeholder="e.g. Sarah Johnson"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={`input-field ${errors.name ? "border-rose-500 focus:border-rose-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
                    )}
                  </Field>

                <Field label="Role / Position" icon={Briefcase}>
                  <input
                    type="text"
                    list="roles-list"
                    placeholder="e.g. Software Engineer"
                    value={form.role}
                    onChange={(e) => set("role", e.target.value)}
                    className={`input-field ${errors.role ? "border-rose-500 focus:border-rose-500" : ""}`}
                  />
                  <datalist id="roles-list">
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                  {errors.role && (
                    <p className="text-xs text-rose-500 mt-1">{errors.role}</p>
                  )}
                </Field>

                <Field label="Department" icon={Building2}>
                  <input
                    type="text"
                    list="departments-list"
                    placeholder="e.g. Engineering"
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    className={`input-field ${errors.department ? "border-rose-500 focus:border-rose-500" : ""}`}
                  />
                  <datalist id="departments-list">
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                  {errors.department && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.department}
                    </p>
                  )}
                </Field>

                <Field label="Branch / Location" icon={Building2}>
                  <input
                    type="text"
                    placeholder="e.g. New York Office"
                    value={form.branch}
                    onChange={(e) => set("branch", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <Field label={`Monthly Salary (${symbol})`} icon={DollarSign}>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    min="0"
                    value={form.salary}
                    onChange={(e) => set("salary", e.target.value)}
                    className={`input-field ${errors.salary ? "border-rose-500 focus:border-rose-500" : ""}`}
                  />
                  {errors.salary && (
                    <p className="text-xs text-rose-500 mt-1">{errors.salary}</p>
                  )}
                </Field>

                <Field label="Join Date" icon={Calendar}>
                  <input
                    type="date"
                    value={form.joinDate}
                    onChange={(e) => set("joinDate", e.target.value)}
                    className="input-field dark:[color-scheme:dark]"
                  />
                  {errors.joinDate && (
                    <p className="text-xs text-rose-500">{errors.joinDate}</p>
                  )}
                </Field>

                <Field label="Phone Number" icon={User}>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={`input-field ${errors.phone ? "border-rose-500 focus:border-rose-500" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>
                  )}
                </Field>

                <Field label="Email (optional)" icon={User}>
                  <input
                    type="email"
                    placeholder="e.g. sarah@company.com"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <Field label="Emergency Contact" icon={User}>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="e.g. +91 9876543210"
                    value={form.emergencyContact}
                    onChange={(e) => set("emergencyContact", e.target.value)}
                    className={`input-field ${errors.emergencyContact ? "border-rose-500 focus:border-rose-500" : ""}`}
                  />
                  {errors.emergencyContact && (
                    <p className="text-xs text-rose-500 mt-1">
                      {errors.emergencyContact}
                    </p>
                  )}
                </Field>

                <Field label="Rank / Designation Level" icon={Briefcase}>
                  <input
                    type="text"
                    placeholder="e.g. Senior Grade A"
                    value={form.rank}
                    onChange={(e) => set("rank", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <Field label="Account No" icon={DollarSign}>
                  <input
                    type="text"
                    placeholder="e.g. 1234567890"
                    value={form.accountNo}
                    onChange={(e) => set("accountNo", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <Field label="IFSC Code" icon={Building2}>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0000123"
                    value={form.ifscCode}
                    onChange={(e) => set("ifscCode", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <Field label="UAN" icon={User}>
                  <input
                    type="text"
                    placeholder="e.g. 100987654321"
                    value={form.uan}
                    onChange={(e) => set("uan", e.target.value)}
                    className="input-field"
                  />
                </Field>

                <div className="md:col-span-2">
                  <Field label="ESI Number" icon={User}>
                    <input
                      type="text"
                      placeholder="e.g. 31123456780010101"
                      value={form.esi}
                      onChange={(e) => set("esi", e.target.value)}
                      className="input-field"
                    />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => navigate("/hr/employees")}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2 text-sm ml-auto"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ STEP 2: Dashboard Access ═══════════════ */}
          {step === 2 && (
            <motion.form
              key="step2"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="glass-card p-8 rounded-2xl space-y-6"
            >
              {/* Header info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary/20">
                    {form.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold dark:text-white text-lg">
                      {form.name}
                    </p>
                    <p className="text-sm text-slate-400">
                      {form.role} · {form.department}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 mt-3 sm:mt-0">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all shrink-0 whitespace-nowrap"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 whitespace-nowrap"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select the sidebar menu items this employee will see in their
                dashboard. Only checked sections will be visible to them.
              </p>

              {/* Section groups */}
              <div className="space-y-3">
                {[...SIDEBAR_SECTIONS]
                  .sort(
                    (a, b) =>
                      SIDEBAR_SECTION_ORDER.indexOf(a.key) -
                      SIDEBAR_SECTION_ORDER.indexOf(b.key)
                  )
                  .map((group) => {
                  const allKeys = group.items.map((i) => i.key);
                  const selectedCount = allKeys.filter((k) =>
                    selectedSections.includes(k)
                  ).length;
                  const allSelected = selectedCount === allKeys.length;
                  const someSelected = selectedCount > 0 && !allSelected;
                  const isExpanded = expandedGroups[group.key] !== false;

                  return (
                    <div
                      key={group.key}
                      className="rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all hover:border-primary/30"
                    >
                      {/* Group header */}
                      <div
                        className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/30 cursor-pointer select-none"
                        onClick={() => toggleExpandGroup(group.key)}
                      >
                        <label
                          className="relative flex items-center cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected;
                            }}
                            onChange={() => toggleGroup(group)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 peer-checked:border-primary peer-checked:bg-primary flex items-center justify-center transition-all">
                            {allSelected && (
                              <Check size={12} className="text-white" strokeWidth={3} />
                            )}
                            {someSelected && (
                              <div className="w-2.5 h-0.5 bg-primary rounded-full" />
                            )}
                          </div>
                        </label>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">
                          {group.groupTitle}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 mr-2">
                          {selectedCount}/{allKeys.length}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400" />
                        )}
                      </div>

                      {/* Group items */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 p-2">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const isSelected = selectedSections.includes(item.key);
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? "bg-primary/10 border border-primary/30"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-transparent"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSection(item.key)}
                                  className="sr-only peer"
                                />
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                                    isSelected
                                      ? "border-primary bg-primary"
                                      : "border-slate-300 dark:border-slate-600"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check size={12} className="text-white" strokeWidth={3} />
                                  )}
                                </div>
                                <div
                                  className={`w-7 h-7 flex items-center justify-center rounded-lg shrink-0 ${item.iconBg}`}
                                >
                                  <Icon size={14} />
                                </div>
                                <span
                                  className={`text-sm font-semibold truncate ${
                                    isSelected
                                      ? "text-primary dark:text-primary"
                                      : "text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                  })}
              </div>

              {/* Selected summary */}
              <div className="flex items-center gap-2 px-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {selectedSections.length} section
                  {selectedSections.length !== 1 ? "s" : ""} selected
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60 ml-auto"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Add Employee
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
