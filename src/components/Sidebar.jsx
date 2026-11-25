import React from "react";
import {
  LayoutDashboard, Calendar, Trello, FileText, ShieldCheck, UserCircle,
  Tag, HelpCircle, ChevronRight, LogOut, Layers, Settings, Search,
  MessageSquare, ChevronDown, Home, Grid, Shield, Zap, Users, DollarSign,
  Clock, CalendarDays, MoreHorizontal, BarChart2, Megaphone, UserPlus,
  Mail, Share2, BookOpen, Receipt, CreditCard as CardIcon, ArrowLeftRight,
  PieChart, LayoutGrid, FolderKanban, ListTodo, UsersRound, GanttChartSquare,
  ClipboardList, TrendingUp as TrendUp, LineChart, BarChart3, Wrench, Crown,
  Building2, BookOpenText, FolderTree, Palette, Type, Boxes, Star, Bell,
  UserCog, Plug, Building, FileSignature, FileMinus, Package, UserCheck, MapPin,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const MENU_GROUP_ORDER = [
  "Applications",
  "Human Resource",
  "Marketing",
  "Sales",
  "Project Management",
  "Accounts",
  "Reports",
  "Knowledge Base",
  "Utilities",
  "Audiences",
  "Subscriptions",
  "Setup",
];

/* ── Mini icon button ─────────────────────────────────────── */
const MiniSidebarItem = ({ icon: Icon, active, badge, tooltip }) => (
  <div
    className={cn(
      "relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer group mb-4",
      active
        ? "bg-primary-contrast text-white shadow-lg shadow-primary-contrast/30"
        : "text-slate-400 dark:text-slate-500 hover:text-primary-contrast hover:bg-slate-100 dark:hover:bg-slate-800/50",
    )}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 2} />
    {badge && (
      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#050810] rounded-full" />
    )}
    {tooltip && !active && (
      <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
        {tooltip}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
      </div>
    )}
  </div>
);

/* ── Collapsible nav group ────────────────────────────────── */
const SidebarGroup = ({ title, items, open, onToggle }) => {
  const location = useLocation();
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 mb-2 group"
      >
        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.1em]">
          {title}
        </p>
        <ChevronDown
          size={13}
          className={cn(
            "text-slate-400 transition-transform duration-300",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      <div
        className={cn(
          "space-y-0.5 overflow-hidden transition-all duration-300",
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name || item.label}
              to={item.path}
              className={cn(
                "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary-contrast/10 text-primary-contrast border-l-4 border-primary-contrast rounded-r-xl"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-xl",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 relative",
                    isActive
                      ? "bg-primary-contrast text-white shadow-md shadow-primary-contrast/20"
                      : item.iconBg ||
                          "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white",
                  )}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm tracking-tight",
                    isActive
                      ? "text-primary-contrast dark:text-slate-100 font-bold"
                      : "font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-200",
                  )}
                >
                  {item.name || item.label}
                </span>
              </div>
              {item.hasSubmenu && (
                <ChevronRight
                  size={13}
                  className={cn(
                    "transition-transform",
                    isActive ? "text-primary rotate-90" : "text-slate-400",
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

/* ── Sidebar ──────────────────────────────────────────────── */
export const Sidebar = ({ isOpen, className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = React.useState(true);

  const navRef = React.useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;
  const isMember = user?.role === "member";

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "User";
  const initials =
    fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
 const displayRole = isSuperAdmin ? "Super Admin" : isAdmin ? "Enterprise" : "Individual";

  const memberAccess = React.useMemo(() => {
    if (!isMember) return null;
    if (!user?.approved_sections) return [];
    try {
      const parsed = typeof user.approved_sections === "string"
        ? JSON.parse(user.approved_sections)
        : user.approved_sections;
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }, [isMember, user?.approved_sections]);

  const canSee = (section) => {
    if (memberAccess === null) return true;
    return memberAccess.includes(section);
  };

  const pendingCount = 0;

  // ── Menu groups ──────────────────────────────────────────────
  const allMenuGroups = [
    {
      title: "Super Admin",
      defaultOpen: true,
      // Mega Dashboard is now visible to Enterprise (admin) too, not just super_admin.
      // Coupons / Tenants / Settings stay super_admin-only.
      show: isAdmin,
      items: isSuperAdmin
        ? [
            { name: "Mega Dashboard", icon: Crown,    path: "/superadmin/mega-dashboard", iconBg: "bg-amber-500/10 text-amber-500" },
            { name: "Coupons",        icon: Tag,       path: "/superadmin/coupons",        iconBg: "bg-emerald-500/10 text-emerald-500" },
            { name: "Tenants",        icon: Building2, path: "/superadmin/tenants",        iconBg: "bg-indigo-500/10 text-indigo-500" },
            { name: "Settings",       icon: Settings,  path: "/superadmin/settings",       iconBg: "bg-slate-500/10 text-slate-500" },
          ]
        : [
            { name: "Mega Dashboard", icon: Crown, path: "/superadmin/mega-dashboard", iconBg: "bg-amber-500/10 text-amber-500" },
          ],
    },
    {
      title: "Applications",
      defaultOpen: false,
      show: canSee("applications"),
      items: [
        { key: "dashboards",  name: "Dashboards",     icon: LayoutDashboard, path: "/dashboard",           iconBg: "bg-blue-500/10 text-blue-500" },
        { key: "calendar",    name: "Calendar",       icon: Calendar,        path: "/calendar",             iconBg: "bg-purple-500/10 text-purple-500" },
        { key: "kanban",      name: "Kanban Board",   icon: Trello,          path: "/kanban",               iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "files",       name: "File Manager",   icon: FileText,        path: "/files",                iconBg: "bg-amber-500/10 text-amber-500" },
        { key: "auth",        name: "Authentication", icon: ShieldCheck,     path: "/auth",                 iconBg: "bg-rose-500/10 text-rose-500" },
        ...(isSuperAdmin ? [{ key: "tenants", name: "Tenants", icon: Building2, path: "/superadmin/tenants", iconBg: "bg-indigo-500/10 text-indigo-500" }] : []),
        { key: "price_plans", name: "Price Plans",    icon: CardIcon,        path: "/subscriptions/plans",  iconBg: "bg-teal-500/10 text-teal-500" },
      ],
    },
    {
      title: "Human Resource",
      defaultOpen: false,
      show: canSee("hr"),
      items: isAdmin
        ? [
            { key: "hr_dashboard", name: "HR Dashboard",   icon: Users,          path: "/hr/dashboard",         iconBg: "bg-violet-500/10 text-violet-500" },
            { key: "employees",    name: "Employees",      icon: UserPlus,       path: "/hr/employees",          iconBg: "bg-sky-500/10 text-sky-500" },
            { key: "payroll",      name: "Payroll",        icon: DollarSign,     path: "/hr/payroll",            iconBg: "bg-emerald-500/10 text-emerald-500" },
            { key: "attendance",   name: "Attendance",     icon: Clock,          path: "/hr/attendance",         iconBg: "bg-sky-500/10 text-sky-500" },
            { key: "leave",        name: "Leave",          icon: CalendarDays,   path: "/hr/leave",              iconBg: "bg-amber-500/10 text-amber-500" },
            { key: "others",       name: "Others",         icon: MoreHorizontal, path: "/hr/others",             iconBg: "bg-pink-500/10 text-pink-500" },
            { key: "member_requests", label: "Individual Requests", icon: UserCheck, path: "/admin/member-requests", iconBg: "bg-violet-500/10 text-violet-500", badge: pendingCount > 0 },
          ]
        : [
            { key: "employees",  name: "My Profile",    icon: UserCheck,    path: "/hr/my/profile",    iconBg: "bg-violet-500/10 text-violet-500" },
            { key: "payroll",    name: "My Payslip",    icon: DollarSign,   path: "/hr/my/payslip",    iconBg: "bg-emerald-500/10 text-emerald-500" },
            { key: "attendance", name: "My Attendance", icon: Clock,        path: "/hr/my/attendance", iconBg: "bg-sky-500/10 text-sky-500" },
            { key: "leave",      name: "My Leave",      icon: CalendarDays, path: "/hr/my/leave",      iconBg: "bg-amber-500/10 text-amber-500" },
          ],
    },
    {
      title: "Marketing",
      defaultOpen: false,
      show: canSee("marketing"),
      items: [
        { key: "marketing_overview", name: "Overview",             icon: BarChart2, path: "/marketing/overview",   iconBg: "bg-primary/10 text-primary" },
        { key: "campaigns",          name: "Campaigns",            icon: Megaphone, path: "/marketing/campaigns",  iconBg: "bg-rose-500/10 text-rose-500" },
        { key: "leads",              name: "Leads",                icon: UserPlus,  path: "/marketing/leads",      iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "email_marketing",    name: "Email Marketing",      icon: Mail,      path: "/marketing/email",      iconBg: "bg-amber-500/10 text-amber-500" },
        { key: "social_media",       name: "Social Media",         icon: Share2,    path: "/marketing/social",     iconBg: "bg-sky-500/10 text-sky-500" },
        { key: "influencer",         name: "Influencer Marketing", icon: UserCheck, path: "/marketing/influencer", iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "field_marketing",    name: "Field Marketing",      icon: MapPin,    path: "/marketing/field",      iconBg: "bg-orange-500/10 text-orange-500" },
      ],
    },
    {
      title: "Sales",
      defaultOpen: false,
      show: canSee("sales"),
      items: [
        { key: "sales_overview", name: "Overview",     icon: BarChart2,     path: "/sales/overview",     iconBg: "bg-primary/10 text-primary" },
        { key: "accounts",       name: "Accounts",     icon: Building2,     path: "/sales/accounts",     iconBg: "bg-sky-500/10 text-sky-500" },
        { key: "proposals",      name: "Proposals",    icon: FileSignature, path: "/sales/proposals",    iconBg: "bg-blue-500/10 text-blue-500" },
        { key: "estimates",      name: "Estimates",    icon: FileText,      path: "/sales/estimates",    iconBg: "bg-sky-500/10 text-sky-500" },
        { key: "invoices",       name: "Invoices",     icon: Receipt,       path: "/sales/invoices",     iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "payments",       name: "Payments",     icon: CardIcon,      path: "/sales/payments",     iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "credit_notes",   name: "Credit Notes", icon: FileMinus,     path: "/sales/credit-notes", iconBg: "bg-rose-500/10 text-rose-500" },
        { key: "items",          name: "Items",        icon: Package,       path: "/sales/items",        iconBg: "bg-amber-500/10 text-amber-500" },
      ],
    },
    {
      title: "Project Management",
      defaultOpen: false,
      show: canSee("projects"),
      items: [
        { key: "projects_overview", name: "Overview",  icon: LayoutGrid,       path: "/projects/overview", iconBg: "bg-primary/10 text-primary" },
        { key: "projects_list",     name: "Projects",  icon: FolderKanban,     path: "/projects/list",     iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "tasks",             name: "Tasks",     icon: ListTodo,         path: "/projects/tasks",    iconBg: "bg-sky-500/10 text-sky-500" },
        { key: "team",              name: "Team",      icon: UsersRound,       path: "/projects/team",     iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "timeline",          name: "Timeline",  icon: GanttChartSquare, path: "/projects/timeline", iconBg: "bg-amber-500/10 text-amber-500" },
      ],
    },
    {
      title: "Knowledge Base",
      defaultOpen: false,
      show: canSee("knowledge"),
      items: [
        { key: "knowledge_overview", name: "Overview",   icon: BookOpenText, path: "/knowledge/overview",   iconBg: "bg-primary/10 text-primary" },
        { key: "articles",           name: "Articles",   icon: FileText,     path: "/knowledge/articles",   iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "categories",         name: "Categories", icon: FolderTree,   path: "/knowledge/categories", iconBg: "bg-sky-500/10 text-sky-500" },
      ],
    },
    {
      title: "Utilities",
      defaultOpen: false,
      show: canSee("utilities"),
      items: [
        { key: "components", name: "Components", icon: Boxes,   path: "/utilities/components", iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "colours",    name: "Colours",    icon: Palette, path: "/utilities/colors",     iconBg: "bg-pink-500/10 text-pink-500" },
        { key: "typography", name: "Typography", icon: Type,    path: "/utilities/typography", iconBg: "bg-amber-500/10 text-amber-500" },
        { key: "icons",      name: "Icons",      icon: Layers,  path: "/utilities/icons",      iconBg: "bg-sky-500/10 text-sky-500" },
      ],
    },
    {
      title: "Subscriptions",
      defaultOpen: false,
      show: canSee("subscriptions"),
      items: [
        { key: "sub_overview", name: "Overview", icon: Star,      path: "/subscriptions/overview", iconBg: "bg-primary/10 text-primary" },
        { key: "plans",        name: "Plans",    icon: Zap,       path: "/subscriptions/plans",    iconBg: "bg-amber-500/10 text-amber-500" },
        { key: "billing",      name: "Billing",  icon: Receipt,   path: "/subscriptions/billing",  iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "usage",        name: "Usage",    icon: BarChart3, path: "/subscriptions/usage",    iconBg: "bg-sky-500/10 text-sky-500" },
      ],
    },
    {
      title: "Setup",
      defaultOpen: false,
      show: canSee("setup"),
      items: [
        { key: "company_setting",  name: "Company Setting",  icon: Building, path: "/setup/company",       iconBg: "bg-primary/10 text-primary" },
        { key: "users_roles",      name: "Users & Roles",    icon: UserCog,  path: "/setup/users",         iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "integrations",     name: "Integrations",     icon: Plug,     path: "/setup/integrations",  iconBg: "bg-sky-500/10 text-sky-500" },
        { key: "asset_management", name: "Asset Management", icon: Package,  path: "/assets",              iconBg: "bg-teal-500/10 text-teal-500" },
        { key: "notifications",    name: "Notifications",    icon: Bell,     path: "/setup/notifications", iconBg: "bg-rose-500/10 text-rose-500" },
      ],
    },
    {
      title: "Reports",
      defaultOpen: false,
      show: canSee("reports"),
      items: [
        { key: "reports_overview", name: "Overview",    icon: ClipboardList, path: "/reports/overview",    iconBg: "bg-primary/10 text-primary" },
        { key: "reports_sales",    name: "Sales",       icon: TrendUp,       path: "/reports/sales",       iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "analytics",        name: "Analytics",   icon: LineChart,     path: "/reports/analytics",   iconBg: "bg-violet-500/10 text-violet-500" },
        { key: "performance",      name: "Performance", icon: BarChart3,     path: "/reports/performance", iconBg: "bg-amber-500/10 text-amber-500" },
        { key: "custom",           name: "Custom",      icon: Wrench,        path: "/reports/custom",      iconBg: "bg-sky-500/10 text-sky-500" },
      ],
    },
    {
      title: "Accounts",
      defaultOpen: false,
      show: canSee("accounts_module"),
      items: [
        { key: "accounts_overview", name: "Overview",     icon: PieChart,      path: "/accounts/overview",     iconBg: "bg-primary/10 text-primary" },
        { key: "accounts_invoices", name: "Invoices",     icon: Receipt,       path: "/accounts/invoices",     iconBg: "bg-emerald-500/10 text-emerald-500" },
        { key: "expenses",          name: "Expenses",     icon: CardIcon,      path: "/accounts/expenses",     iconBg: "bg-rose-500/10 text-rose-500" },
        { key: "transactions",      name: "Transactions", icon: ArrowLeftRight,path: "/accounts/transactions", iconBg: "bg-amber-500/10 text-amber-500" },
        { key: "accounts_reports",  name: "Reports",      icon: BookOpen,      path: "/accounts/reports",      iconBg: "bg-violet-500/10 text-violet-500" },
      ],
    },
    {
      title: "Audiences",
      defaultOpen: false,
      show: canSee("audiences"),
      items: [
        { key: "profile",       name: "Profile",       icon: UserCircle, path: "/profile", hasSubmenu: true, iconBg: "bg-indigo-500/10 text-indigo-500" },
        { key: "pricing_plans", name: "Pricing Plans", icon: Tag,        path: "/pricing",                  iconBg: "bg-cyan-500/10 text-cyan-500" },
        { key: "faqs",          name: "FAQs",          icon: HelpCircle, path: "/faq",                      iconBg: "bg-orange-500/10 text-orange-500" },
      ],
    },
  ];

  const menuGroups = allMenuGroups
    .filter((g) => g.show)
    .sort((a, b) => {
      const position = (group) =>
        group.title === "Super Admin"
          ? -1
          : MENU_GROUP_ORDER.indexOf(group.title);
      return position(a) - position(b);
    })
    .map(g => {
      // For members, only show items that have been explicitly approved
      if (isMember && g.items) {
        return {
          ...g,
          items: g.items.filter(item => !item.key || canSee(item.key))
        };
      }
      return g;
    })
    // Remove groups that ended up with 0 items after filtering
    .filter((g) => g.items && g.items.length > 0);

  // ── Initialize open/close state ──────────────────────────────
  const [openGroups, setOpenGroups] = React.useState(() => {
    const state = {};
    allMenuGroups.forEach((g) => {
      const hasActive = g.items.some(
        (item) =>
          location.pathname === item.path ||
          location.pathname.startsWith(item.path + "/"),
      );
      state[g.title] = hasActive || g.defaultOpen;
    });
    return state;
  });

  // ── On navigation: open the active group, then scroll active item into view ──
  //
  // WHY scrollIntoView instead of scrollTop restore:
  //   The sidebar has many groups. Items like /pricing and /profile live in
  //   "Audiences" near the bottom. On first visit scrollByPath has no saved
  //   value so restoring to 0 sends the sidebar to the top every time.
  //   scrollIntoView({ block: "nearest" }) moves the minimum amount needed to
  //   make the active link visible — it never jumps if the item is already
  //   in view, and it smoothly scrolls down when the item is below the fold.
  //   We wait 320ms (just past the 300ms CSS max-h transition) so the group
  //   has fully expanded before we measure element position.
  React.useEffect(() => {
    const newPath = location.pathname;

    // Open the group containing the newly active item (if not already open)
    setOpenGroups((prev) => {
      const next = { ...prev };
      let changed = false;
      allMenuGroups.forEach((g) => {
        const hasActive = g.items.some(
          (item) => newPath === item.path || newPath.startsWith(item.path + "/"),
        );
        if (hasActive && !next[g.title]) {
          next[g.title] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    // After the group-open CSS transition finishes (300ms), scroll only if
    // the active item is outside the visible area of the nav container.
    // We center it vertically so items near the bottom do not get clipped.
    const timerId = setTimeout(() => {
      const nav = navRef.current;
      if (!nav) return;
      const activeLink = nav.querySelector(`a[href="${newPath}"]`);
      if (!activeLink) return;

      const navRect  = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const isAbove  = linkRect.top    < navRect.top    + 40;
      const isBelow  = linkRect.bottom > navRect.bottom - 40;

      if (isAbove || isBelow) {
        // Center the active item within the nav panel
        nav.scrollTo({
          top: activeLink.offsetTop - nav.clientHeight / 2 + activeLink.clientHeight / 2,
          behavior: "smooth",
        });
      }
    }, 320);

    return () => clearTimeout(timerId);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "flex h-screen transition-all duration-500 ease-in-out",
        "fixed md:relative inset-y-0 left-0 z-40 md:z-auto md:flex-shrink-0",
        isOpen
          ? "translate-x-0"
          : "-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden",
        className,
      )}
    >
      {/* ── Mini bar ── */}
      <aside className="mini-sidebar w-[80px] shrink-0">
        <div
          onClick={() => setIsPanelOpen((p) => !p)}
          className="mb-10 w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group cursor-pointer relative overflow-hidden"
        >
          <Zap
            size={24}
            fill="currentColor"
            className={cn("transition-transform duration-500", !isPanelOpen && "scale-110")}
          />
          <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </div>

        <div className="flex-1 flex flex-col items-center">
          <MiniSidebarItem icon={Home}          active={location.pathname === "/dashboard"} tooltip="Dashboard" />
          <MiniSidebarItem icon={Users}         active={location.pathname.startsWith("/hr")} tooltip="HR" />
          <MiniSidebarItem icon={Grid}          tooltip="Apps" />
          <MiniSidebarItem icon={Layers}        tooltip="Layers" />
          <MiniSidebarItem icon={Shield}        tooltip="Security" />
          <MiniSidebarItem icon={Search}        tooltip="Search" />
          <MiniSidebarItem icon={MessageSquare} badge tooltip="Messages" />
          {isAdmin && pendingCount > 0 && (
            <MiniSidebarItem icon={UserCheck} badge tooltip="Member Requests" />
          )}
          <div className="mt-auto">
            <button
              onClick={() => setIsPanelOpen((p) => !p)}
              className="relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 cursor-pointer group mb-4 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              <ChevronRight
                size={22}
                className={cn("transition-transform duration-500", isPanelOpen ? "rotate-180" : "rotate-0")}
              />
            </button>
            <MiniSidebarItem icon={Settings} tooltip="Settings" />
          </div>
        </div>
      </aside>

      {/* ── Full panel ── */}
      <aside
        className={cn(
          "glass-sidebar flex flex-col pt-8 border-none transition-all duration-500 overflow-hidden",
          isPanelOpen ? "w-[280px] opacity-100 px-4" : "w-0 opacity-0 px-0",
        )}
      >
        <div className="shrink-0">
          <Logo className="mb-10 px-2" size="lg" />
          <div className="mb-8 px-2">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl ring-2 ring-primary/20 bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {initials}
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-200 block">{fullName}</span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{displayRole}</span>
                </div>
              </div>
              <ChevronDown size={15} className="text-slate-500" />
            </div>
          </div>
        </div>

        <div role="navigation" aria-label="Main Navigation" className="flex-1 overflow-y-auto scrollbar-hide flex flex-col space-y-2" ref={navRef}>
          {menuGroups.map((group) => (
            <SidebarGroup
              key={group.title}
              title={group.title}
              items={group.items}
              open={!!openGroups[group.title]}
              onToggle={() =>
                setOpenGroups((prev) => ({
                  ...prev,
                  [group.title]: !prev[group.title],
                }))
              }
            />
          ))}
        </div>

        <div className="mt-auto pb-8 px-2 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-semibold text-sm"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
};