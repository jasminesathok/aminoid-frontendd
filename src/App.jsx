import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';

import Login     from './pages/Login';
import SignUp    from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import LandingPage from './components/landing/LandingPage';

import MegaDashboard     from './pages/superadmin/MegaDashboard';
import Coupons           from './pages/superadmin/Coupons';
import Tenants           from './pages/superadmin/Tenants';
import SuperAdminSettings from './pages/superadmin/Settings';

import Calendar       from './pages/Calendar/Calendar';
import KanbanBoard    from './pages/kanban/KanbanBoard';
import FileManager    from './pages/files/FileManager';
import Authentication from './pages/auth/Authentication';
import Profile        from './pages/profile/Profile';
import Pricing        from './pages/pricing/Pricing';
import FAQ            from './pages/faq/FAQ';
import PrivacyPolicy  from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';

import HRDashboard  from './pages/hr/HRDashboard';
import Employees    from './pages/hr/Employees';
import AddEmployee  from './pages/hr/AddEmployee';
import Payroll      from './pages/hr/Payroll';
import Attendance   from './pages/hr/Attendance';
import Leave        from './pages/hr/Leave';
import Others       from './pages/hr/Others';
import MyPayslip    from './pages/hr/MyPayslip';
import MyAttendance from './pages/hr/MyAttendance';
import MyLeave      from './pages/hr/MyLeave';
import MyProfile    from './pages/hr/MyProfile';

// New pages for member approval flow
import PendingApproval from './pages/PendingApproval';
import MemberRequests  from './pages/admin/MemberRequests';

import MarketingOverview   from './pages/marketing/MarketingOverview';
import Campaigns           from './pages/marketing/Campaigns';
import Leads               from './pages/marketing/Leads';
import EmailMarketing      from './pages/marketing/EmailMarketing';
import SocialMedia         from './pages/marketing/SocialMedia';
import InfluencerMarketing from './pages/marketing/InfluencerMarketing';
import FieldMarketing      from './pages/marketing/FieldMarketing';

import AccountsOverview from './pages/accounts/AccountsOverview';
import Invoices         from './pages/accounts/Invoices';
import Expenses         from './pages/accounts/Expenses';
import Transactions     from './pages/accounts/Transactions';
import Reports          from './pages/accounts/Reports';

import ProjectOverview from './pages/projects/ProjectOverview';
import Projects        from './pages/projects/Projects';
import Tasks           from './pages/projects/Tasks';
import Team            from './pages/projects/Team';
import Timeline        from './pages/projects/Timeline';

import ReportsOverview   from './pages/reports/ReportsOverview';
import SalesReport       from './pages/reports/SalesReport';
import AnalyticsReport   from './pages/reports/AnalyticsReport';
import PerformanceReport from './pages/reports/PerformanceReport';
import CustomReport      from './pages/reports/CustomReport';

import SalesOverview  from './pages/sales/SalesOverview';
import SalesAccounts  from './pages/sales/SalesAccounts';
import Contacts       from './pages/sales/Contacts';
import SalesDeals     from './pages/sales/Deals';
import Pipeline       from './pages/sales/Pipeline';
import Proposals      from './pages/sales/Proposals';
import Estimates      from './pages/sales/Estimates';
import SalesInvoices  from './pages/sales/SalesInvoices';
import Payments       from './pages/sales/Payments';
import CreditNotes    from './pages/sales/CreditNotes';
import Items          from './pages/sales/Items';

import KBOverview   from './pages/knowledge/KBOverview';
import Articles     from './pages/knowledge/Articles';
import KBCategories from './pages/knowledge/KBCategories';

import UIComponents from './pages/utilities/UIComponents';
import ColorPalette from './pages/utilities/ColorPalette';
import Typography   from './pages/utilities/Typography';
import Icons        from './pages/utilities/Icons';

import SubsOverview from './pages/subscriptions/SubsOverview';
import Plans        from './pages/subscriptions/Plans';
import Billing      from './pages/subscriptions/Billing';
import Usage        from './pages/subscriptions/Usage';

import CompanySettings from './pages/setup/CompanySettings';
import AssetManagement from './pages/assets/AssetManagement';
import UsersRoles      from './pages/setup/UsersRoles';
import Integrations    from './pages/setup/Integrations';
import Notifications   from './pages/setup/Notifications';

import Contact from './pages/contact/contact';
import ContactUs from './pages/ContactUs';



/* ─────────────────────────────────────────────────────────────────
   Route guards
───────────────────────────────────────────────────────────────── */

// Any logged-in user
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

// Admin or super_admin only
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return (user.role === 'admin' || user.role === 'super_admin')
    ? children
    : <Navigate to="/dashboard" replace />;
};

// Super admin only
const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'super_admin'
    ? children
    : <Navigate to="/dashboard" replace />;
};

// Not logged in
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

/**
 * MemberRoute — guards Marketing, Sales, and Project Management routes.
 */
const MemberRoute = ({ section, children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Admins bypass all access checks
  if (user.role === 'admin' || user.role === 'super_admin') return children;

  let approvedSections = [];
  try {
    approvedSections = typeof user.approved_sections === 'string'
      ? JSON.parse(user.approved_sections)
      : (user.approved_sections || []);
  } catch (_) {}

  if (approvedSections.length === 0) {
    return <Navigate to="/pending-approval" replace />;
  }
  if (!approvedSections.includes(section)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

/* ─────────────────────────────────────────────────────────────────
   App
───────────────────────────────────────────────────────────────── */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CurrencyProvider>
          <BrowserRouter>
            <Routes>

              {/* ── Public ── */}
              <Route path="/"              element={<LandingPage />} />
              <Route path="/contact-us"      element={<ContactUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-conditions" element={<TermsConditions />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login"  element={<GuestRoute><Login /></GuestRoute>} />
              <Route path="/signup"           element={<GuestRoute><SignUp /></GuestRoute>} />
              <Route path="/signup/:roleSlug" element={<GuestRoute><SignUp /></GuestRoute>} />

              {/* ── Member approval flow ── */}
              <Route path="/pending-approval"      element={<PrivateRoute><PendingApproval /></PrivateRoute>} />
              <Route path="/admin/member-requests" element={<AdminRoute><MemberRequests /></AdminRoute>} />

              {/* ── General protected ── */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/calendar"  element={<PrivateRoute><Calendar /></PrivateRoute>} />
              <Route path="/kanban"    element={<PrivateRoute><KanbanBoard /></PrivateRoute>} />
              <Route path="/files"     element={<PrivateRoute><FileManager /></PrivateRoute>} />
              <Route path="/auth"      element={<AdminRoute><Authentication /></AdminRoute>} />
              <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/faq"       element={<PrivateRoute><FAQ /></PrivateRoute>} />

              {/* ── Super Admin ── */}
              <Route path="/superadmin/mega-dashboard" element={<AdminRoute><MegaDashboard /></AdminRoute>} />
              <Route path="/superadmin/coupons"        element={<SuperAdminRoute><Coupons /></SuperAdminRoute>} />
              <Route path="/superadmin/tenants"        element={<SuperAdminRoute><Tenants /></SuperAdminRoute>} />
              <Route path="/superadmin/settings"       element={<SuperAdminRoute><SuperAdminSettings /></SuperAdminRoute>} />

              {/* ── HR — admin only ── */}
              <Route path="/hr"                element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="/hr/dashboard"      element={<AdminRoute><HRDashboard /></AdminRoute>} />
              <Route path="/hr/employees"      element={<AdminRoute><Employees /></AdminRoute>} />
              <Route path="/hr/employees/add"  element={<AdminRoute><AddEmployee /></AdminRoute>} />
              <Route path="/hr/payroll"        element={<AdminRoute><Payroll /></AdminRoute>} />
              <Route path="/hr/attendance"     element={<AdminRoute><Attendance /></AdminRoute>} />
              <Route path="/hr/leave"          element={<AdminRoute><Leave /></AdminRoute>} />
              <Route path="/hr/others"         element={<AdminRoute><Others /></AdminRoute>} />

              {/* ── HR — member self-service ── */}
              <Route path="/hr/my/profile"    element={<PrivateRoute><MyProfile /></PrivateRoute>} />
              <Route path="/hr/my/payslip"    element={<PrivateRoute><MyPayslip /></PrivateRoute>} />
              <Route path="/hr/my/attendance" element={<PrivateRoute><MyAttendance /></PrivateRoute>} />
              <Route path="/hr/my/leave"      element={<PrivateRoute><MyLeave /></PrivateRoute>} />

              {/* ── Marketing — MemberRoute guards section='marketing' ── */}
              <Route path="/marketing"            element={<Navigate to="/marketing/overview" replace />} />
              <Route path="/marketing/overview"   element={<MemberRoute section="marketing"><MarketingOverview /></MemberRoute>} />
              <Route path="/marketing/campaigns"  element={<MemberRoute section="marketing"><Campaigns /></MemberRoute>} />
              <Route path="/marketing/leads"      element={<MemberRoute section="marketing"><Leads /></MemberRoute>} />
              <Route path="/marketing/email"      element={<MemberRoute section="marketing"><EmailMarketing /></MemberRoute>} />
              <Route path="/marketing/social"     element={<MemberRoute section="marketing"><SocialMedia /></MemberRoute>} />
              <Route path="/marketing/influencer" element={<MemberRoute section="marketing"><InfluencerMarketing /></MemberRoute>} />
              <Route path="/marketing/field"      element={<MemberRoute section="marketing"><FieldMarketing /></MemberRoute>} />

              {/* ── Accounts — admin only ── */}
              <Route path="/accounts"              element={<Navigate to="/accounts/overview" replace />} />
              <Route path="/accounts/overview"     element={<AdminRoute><AccountsOverview /></AdminRoute>} />
              <Route path="/accounts/invoices"     element={<AdminRoute><Invoices /></AdminRoute>} />
              <Route path="/accounts/expenses"     element={<AdminRoute><Expenses /></AdminRoute>} />
              <Route path="/accounts/transactions" element={<AdminRoute><Transactions /></AdminRoute>} />
              <Route path="/accounts/reports"      element={<AdminRoute><Reports /></AdminRoute>} />

              {/* ── Projects — MemberRoute guards section='projects' ── */}
              <Route path="/projects"          element={<Navigate to="/projects/overview" replace />} />
              <Route path="/projects/overview" element={<MemberRoute section="projects"><ProjectOverview /></MemberRoute>} />
              <Route path="/projects/list"     element={<MemberRoute section="projects"><Projects /></MemberRoute>} />
              <Route path="/projects/tasks"    element={<MemberRoute section="projects"><Tasks /></MemberRoute>} />
              <Route path="/projects/team"     element={<MemberRoute section="projects"><Team /></MemberRoute>} />
              <Route path="/projects/timeline" element={<MemberRoute section="projects"><Timeline /></MemberRoute>} />

              {/* ── Reports — everyone ── */}
              <Route path="/reports"             element={<Navigate to="/reports/overview" replace />} />
              <Route path="/reports/overview"    element={<PrivateRoute><ReportsOverview /></PrivateRoute>} />
              <Route path="/reports/sales"       element={<PrivateRoute><SalesReport /></PrivateRoute>} />
              <Route path="/reports/analytics"   element={<PrivateRoute><AnalyticsReport /></PrivateRoute>} />
              <Route path="/reports/performance" element={<PrivateRoute><PerformanceReport /></PrivateRoute>} />
              <Route path="/reports/custom"      element={<PrivateRoute><CustomReport /></PrivateRoute>} />

              {/* ── Sales — MemberRoute guards section='sales' ── */}
              <Route path="/sales"               element={<Navigate to="/sales/overview" replace />} />
              <Route path="/sales/overview"      element={<MemberRoute section="sales"><SalesOverview /></MemberRoute>} />
              <Route path="/sales/accounts"      element={<MemberRoute section="sales"><SalesAccounts /></MemberRoute>} />
              <Route path="/sales/contacts"      element={<MemberRoute section="sales"><Contacts /></MemberRoute>} />
              <Route path="/sales/deals"         element={<MemberRoute section="sales"><SalesDeals /></MemberRoute>} />
              <Route path="/sales/pipeline"      element={<MemberRoute section="sales"><Pipeline /></MemberRoute>} />
              <Route path="/sales/proposals"     element={<MemberRoute section="sales"><Proposals /></MemberRoute>} />
              <Route path="/sales/estimates"     element={<MemberRoute section="sales"><Estimates /></MemberRoute>} />
              <Route path="/sales/invoices"      element={<MemberRoute section="sales"><SalesInvoices /></MemberRoute>} />
              <Route path="/sales/payments"      element={<MemberRoute section="sales"><Payments /></MemberRoute>} />
              <Route path="/sales/credit-notes"  element={<MemberRoute section="sales"><CreditNotes /></MemberRoute>} />
              <Route path="/sales/items"         element={<MemberRoute section="sales"><Items /></MemberRoute>} />

              {/* ── Knowledge Base — everyone ── */}
              <Route path="/knowledge"            element={<Navigate to="/knowledge/overview" replace />} />
              <Route path="/knowledge/overview"   element={<PrivateRoute><KBOverview /></PrivateRoute>} />
              <Route path="/knowledge/articles"   element={<PrivateRoute><Articles /></PrivateRoute>} />
              <Route path="/knowledge/categories" element={<PrivateRoute><KBCategories /></PrivateRoute>} />

              {/* ── Utilities — everyone ── */}
              <Route path="/utilities"            element={<Navigate to="/utilities/components" replace />} />
              <Route path="/utilities/components" element={<PrivateRoute><UIComponents /></PrivateRoute>} />
              <Route path="/utilities/colors"     element={<PrivateRoute><ColorPalette /></PrivateRoute>} />
              <Route path="/utilities/typography" element={<PrivateRoute><Typography /></PrivateRoute>} />
              <Route path="/utilities/icons"      element={<PrivateRoute><Icons /></PrivateRoute>} />

              {/* ── Subscriptions — everyone ── */}
              <Route path="/subscriptions"         element={<Navigate to="/subscriptions/overview" replace />} />
              <Route path="/subscriptions/overview" element={<PrivateRoute><SubsOverview /></PrivateRoute>} />
              <Route path="/subscriptions/plans"   element={<PrivateRoute><Plans /></PrivateRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/subscriptions/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
              <Route path="/subscriptions/usage"   element={<PrivateRoute><Usage /></PrivateRoute>} />

              {/* ── Setup — admin only ── */}
              <Route path="/setup"               element={<Navigate to="/setup/company" replace />} />
              <Route path="/setup/company"       element={<AdminRoute><CompanySettings /></AdminRoute>} />
              <Route path="/setup/users"         element={<AdminRoute><UsersRoles /></AdminRoute>} />
              <Route path="/setup/integrations"  element={<AdminRoute><Integrations /></AdminRoute>} />
              <Route path="/setup/notifications" element={<AdminRoute><Notifications /></AdminRoute>} />

              {/* ── Assets — admin only ── */}
              <Route path="/assets" element={<AdminRoute><AssetManagement /></AdminRoute>} />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
          </CurrencyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
