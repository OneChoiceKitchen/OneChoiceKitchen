import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import {
  // KPI Cards
  IndianRupee, ShoppingCart, Users, Store, ClipboardList,
  PackageCheck, CalendarDays,
  // Workspace / Explore categories
  Building2, UtensilsCrossed, Receipt, BadgePercent, Globe,
  Wallet, BriefcaseBusiness, ShieldCheck, Settings2, LifeBuoy,
  BarChart3, MessageSquare, Monitor,
  // Continue Working / Favorites modules
  ShoppingBag, Package, Tags, UserRoundCog, Cog, Calendar,
  LayoutGrid, Coffee, TableProperties,
  // Header
  Bell, PlusCircle, Search as LucideSearch, ChevronDown,
  // Profile dropdown
  User, SlidersHorizontal, History, Keyboard, Moon, LogOut,
  // Utility
  Star, ArrowRight, Plus, X, Check, AlertTriangle, Info, CircleCheck,
  // Downloads
  Smartphone,
  // Explore item icons
  MapPin, Ticket, CreditCard, FileText, ClipboardCheck,
  KeyRound, Mail, MessageCircle, Link2, Layers, Megaphone,
  UserCheck, Users2, Truck, Percent, BookOpen, Image,
  MessagesSquare, Activity, Cpu, HeadphonesIcon, BarChart2,
  List, UserCog, Banknote, GitBranch, Timer, LogIn,
  Bike,
} from 'lucide-react';

import styles from './app.module.css';
import { GlobalMetadataInjector, ModalProvider } from '@org/ui-design-system';
import axios from 'axios';


// ── Lazy-loaded page modules (code-split per route for performance) ────────────
// Restaurant Ops
const BranchesAdmin          = React.lazy(() => import('./pages/BranchesAdmin'));
const MenusAdmin             = React.lazy(() => import('./pages/MenusAdmin'));
const TiffinAdmin            = React.lazy(() => import('./pages/TiffinAdmin'));
const InventoryAdmin         = React.lazy(() => import('./pages/InventoryAdmin'));
const TablesAdmin            = React.lazy(() => import('./pages/TablesAdmin'));
const ReservationsAdmin      = React.lazy(() => import('./pages/ReservationsAdmin'));
const WaitlistAdmin          = React.lazy(() => import('./pages/WaitlistAdmin'));

// Orders / Finance
const OrdersAdmin            = React.lazy(() => import('./pages/OrdersAdmin'));
const RefundsAdmin           = React.lazy(() => import('./pages/RefundsAdmin'));
const CorporateAdmin         = React.lazy(() => import('./pages/CorporateAdmin'));
const DeliverySettingsAdmin  = React.lazy(() => import('./pages/DeliverySettingsAdmin'));
const PayoutsAdmin           = React.lazy(() => import('./pages/PayoutsAdmin'));
const SurgePricingAdmin      = React.lazy(() => import('./pages/SurgePricingAdmin'));
const PaymentConfiguration   = React.lazy(() => import('./pages/PaymentConfiguration'));
const SubscriptionPlansAdmin = React.lazy(() => import('./pages/SubscriptionPlansAdmin'));

// Customers
const UsersAdmin             = React.lazy(() => import('./pages/UsersAdmin'));
const ReviewsAdmin           = React.lazy(() => import('./pages/ReviewsAdmin'));
const ReferralsAdmin         = React.lazy(() => import('./pages/ReferralsAdmin'));
const SupportAdmin           = React.lazy(() => import('./pages/SupportAdmin'));

// Marketing / CMS
const OffersAdmin            = React.lazy(() => import('./pages/OffersAdmin'));
const RewardsAdmin           = React.lazy(() => import('./pages/RewardsAdmin'));
const CouponsAdmin           = React.lazy(() => import('./pages/CouponsAdmin'));
const BlogsAdmin             = React.lazy(() => import('./pages/BlogsAdmin'));
const PagesAdmin             = React.lazy(() => import('./pages/PagesAdmin'));
const SlidersAdmin           = React.lazy(() => import('./pages/SlidersAdmin'));
const CommentsAdmin          = React.lazy(() => import('./pages/CommentsAdmin'));
const SeoManagement          = React.lazy(() => import('./pages/SeoManagement'));

// HRMS
const HRMSAdmin              = React.lazy(() => import('./pages/HRMSAdmin'));
const HRMSDashboard          = React.lazy(() => import('./pages/HRMSDashboard'));
const LeavesAdmin            = React.lazy(() => import('./pages/LeavesAdmin'));
const PayrollAdmin           = React.lazy(() => import('./pages/PayrollAdmin'));
const AttendanceAdmin        = React.lazy(() => import('./pages/AttendanceAdmin'));
const AssetsAdmin            = React.lazy(() => import('./pages/AssetsAdmin'));
const ShiftsAdmin            = React.lazy(() => import('./pages/ShiftsAdmin'));
const OffboardingAdmin       = React.lazy(() => import('./pages/OffboardingAdmin'));
const HRComplianceAdmin      = React.lazy(() => import('./pages/HRComplianceAdmin'));
const HRHelpdeskAdmin        = React.lazy(() => import('./pages/HRHelpdeskAdmin'));

// Administration
const TasksAdmin             = React.lazy(() => import('./pages/TasksAdmin'));
const ComplianceAdmin        = React.lazy(() => import('./pages/ComplianceAdmin'));
const AuditLogsAdmin         = React.lazy(() => import('./pages/AuditLogsAdmin'));
const RolesPermissionsAdmin  = React.lazy(() => import('./pages/RolesPermissionsAdmin'));
const NotificationTemplatesAdmin = React.lazy(() => import('./pages/NotificationTemplatesAdmin'));
const PartnerPermissionsAdmin = React.lazy(() => import('./pages/PartnerPermissionsAdmin'));
const NotificationLogs       = React.lazy(() => import('./pages/NotificationLogs'));

// Settings / Platform
const SettingsAdmin              = React.lazy(() => import('./pages/SettingsAdmin'));
const EmailConfiguration         = React.lazy(() => import('./pages/EmailConfiguration'));
const SmsConfiguration           = React.lazy(() => import('./pages/SmsConfiguration'));
const WhatsappConfigAdmin        = React.lazy(() => import('./pages/WhatsappConfigAdmin'));
const MapsConfigAdmin            = React.lazy(() => import('./pages/MapsConfigAdmin'));
const SlaConfigAdmin             = React.lazy(() => import('./pages/SlaConfigAdmin'));
const ServiceProvidersConfiguration = React.lazy(() => import('./pages/ServiceProvidersConfiguration'));

// Dashboards
const DashboardAdmin          = React.lazy(() => import('./pages/DashboardAdmin'));
const OverallDashboardAdmin   = React.lazy(() => import('./pages/OverallDashboardAdmin'));
const FinanceDashboardAdmin   = React.lazy(() => import('./pages/FinanceDashboardAdmin'));
const MarketingDashboardAdmin = React.lazy(() => import('./pages/MarketingDashboardAdmin'));
const SystemDashboardAdmin    = React.lazy(() => import('./pages/SystemDashboardAdmin'));
const ConfigDashboardAdmin    = React.lazy(() => import('./pages/ConfigDashboardAdmin'));
const BranchDashboardAdmin    = React.lazy(() => import('./pages/BranchDashboardAdmin'));
const MenuDashboardAdmin      = React.lazy(() => import('./pages/MenuDashboardAdmin'));
const MessDashboardAdmin      = React.lazy(() => import('./pages/MessDashboardAdmin'));

// Other
const MyProfileAdmin   = React.lazy(() => import('./pages/MyProfileAdmin'));
const PreferencesAdmin = React.lazy(() => import('./pages/PreferencesAdmin'));
const DirectoryAdmin   = React.lazy(() => import('./pages/DirectoryAdmin'));
const VenuesAdmin      = React.lazy(() => import('./pages/VenuesAdmin'));

// Chat & AI
const InternalChatAdmin      = React.lazy(() => import('./pages/InternalChatAdmin'));
const AiChatManagementAdmin  = React.lazy(() => import('./pages/AiChatManagementAdmin'));

// Downloads (all 4 apps — including Admin App — visible only in Admin Portal)
const DownloadPage           = React.lazy(() => import('./pages/DownloadPage'));
const AppLinksSettings       = React.lazy(() => import('./pages/AppLinksSettings'));
const BrandSiteAdmin         = React.lazy(() => import('./pages/BrandSiteAdmin'));

// Category Overview Pages (Explore Workspace → View All / Title click)
const CategoryPage           = React.lazy(() => import('./pages/CategoryPage').then(m => ({ default: m.CategoryPage })));

// Footer Pages (Privacy Policy, Terms of Service, Support, API Docs)
const PrivacyPolicyPage      = React.lazy(() => import('./pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage     = React.lazy(() => import('./pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const SupportCenterPage      = React.lazy(() => import('./pages/SupportCenterPage').then(m => ({ default: m.SupportCenterPage })));
const ApiDocumentationPage   = React.lazy(() => import('./pages/ApiDocumentationPage').then(m => ({ default: m.ApiDocumentationPage })));


// ── Skeleton loader shown while lazy modules load ─────────────────────────────
function SkeletonPage() {
  return (
    <div className="page-skeleton" style={{ padding: 'clamp(1rem,2vw,2rem)', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div className="skeleton page-skeleton-header" style={{ width:'40%' }} />
      <div className="page-skeleton-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
        {[...Array(5)].map((_,i)=><div key={i} className="skeleton page-skeleton-card" />)}
      </div>
      <div className="skeleton page-skeleton-table" />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1rem' }}>
        {[...Array(2)].map((_,i)=><div key={i} className="skeleton" style={{ height:180, borderRadius:14 }} />)}
      </div>
    </div>
  );
}

// ─── Auth interceptor ─────────────────────────────────────────────────────────
axios.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      ['admin_token','admin_role','admin_restaurant_id','admin_permissions'].forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
    return Promise.reject(error);
  }
);
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('admin_token')}`, 'Content-Type': 'application/json' });

// ─── Types ────────────────────────────────────────────────────────────────────
interface WItem { id: string; label: string; desc: string; }
interface WCat {
  id: string; label: string; color: string; bg: string;
  icon: React.ReactElement | string; description: string; items: WItem[];
}

// ─── Workspace Icons — Lucide React (consistent, clean, MIT licensed) ──────────
const WS_ICONS: Record<string, React.ReactElement> = {
  'restaurant-ops': <Building2     size={20} strokeWidth={2} />,
  'dining':         <UtensilsCrossed size={20} strokeWidth={2} />,
  'orders':         <Receipt        size={20} strokeWidth={2} />,
  'customers':      <Users          size={20} strokeWidth={2} />,
  'marketing':      <BadgePercent   size={20} strokeWidth={2} />,
  'cms':            <Globe          size={20} strokeWidth={2} />,
  'finance':        <Wallet         size={20} strokeWidth={2} />,
  'hrms':           <BriefcaseBusiness size={20} strokeWidth={2} />,
  'admin-ops':      <ShieldCheck    size={20} strokeWidth={2} />,
  'platform':       <Settings2      size={20} strokeWidth={2} />,
  'system':         <Monitor        size={20} strokeWidth={2} />,
  'helpdesk':       <LifeBuoy       size={20} strokeWidth={2} />,
  'dashboards':     <BarChart3      size={20} strokeWidth={2} />,
  'communication':  <MessageSquare  size={20} strokeWidth={2} />,
};

// ─── Per-item icons (small, 13px) — used in breadcrumbs & explore cards ────────
const ITEM_ICONS_SM: Record<string, React.ReactElement> = {
  branches:          <MapPin size={16} strokeWidth={2}/>,
  menus:           <UtensilsCrossed size={16} strokeWidth={2}/>,
  tiffin:          <Coffee          size={16} strokeWidth={2}/>,
  inventory:       <Package         size={16} strokeWidth={2}/>,
  tables:          <TableProperties  size={16} strokeWidth={2}/>,
  reservations:    <Calendar        size={16} strokeWidth={2}/>,
  waitlist:        <List            size={16} strokeWidth={2}/>,
  orders:          <ShoppingBag     size={16} strokeWidth={2}/>,
  refunds:         <Receipt         size={16} strokeWidth={2}/>,
  corporate:       <BriefcaseBusiness size={16} strokeWidth={2}/>,
  delivery_settings:<Truck          size={16} strokeWidth={2}/>,
  users:           <Users           size={16} strokeWidth={2}/>,
  reviews:         <Star            size={16} strokeWidth={2}/>,
  referrals:       <Link2           size={16} strokeWidth={2}/>,
  support:         <HeadphonesIcon  size={16} strokeWidth={2}/>,
  offers:          <Percent         size={16} strokeWidth={2}/>,
  rewards:         <Tags            size={16} strokeWidth={2}/>,
  coupons:         <Ticket          size={16} strokeWidth={2}/>,
  blogs:           <BookOpen        size={16} strokeWidth={2}/>,
  pages:           <FileText        size={16} strokeWidth={2}/>,
  sliders:         <Image           size={16} strokeWidth={2}/>,
  comments:        <MessageCircle   size={16} strokeWidth={2}/>,
  seo:             <Globe           size={16} strokeWidth={2}/>,
  payouts:         <Banknote        size={16} strokeWidth={2}/>,
  payment_config:  <CreditCard      size={16} strokeWidth={2}/>,
  subscription_plans:<Layers        size={16} strokeWidth={2}/>,
  surge_pricing:   <Activity        size={16} strokeWidth={2}/>,
  hrms:            <UserCog         size={16} strokeWidth={2}/>,
  attendance:      <ClipboardCheck  size={16} strokeWidth={2}/>,
  leaves:          <Calendar        size={16} strokeWidth={2}/>,
  payroll:         <Banknote        size={16} strokeWidth={2}/>,
  tasks:           <ClipboardList   size={16} strokeWidth={2}/>,
  compliance:      <ShieldCheck     size={16} strokeWidth={2}/>,
  audit_logs:      <History         size={16} strokeWidth={2}/>,
  roles:           <KeyRound        size={16} strokeWidth={2}/>,
  settings:        <Cog             size={16} strokeWidth={2}/>,
  email_config:    <Mail            size={16} strokeWidth={2}/>,
  sms_config:      <MessageSquare   size={16} strokeWidth={2}/>,
  whatsapp_config: <MessageCircle   size={16} strokeWidth={2}/>,
  sla_config:      <Timer           size={16} strokeWidth={2}/>,
  maps_config:     <MapPin          size={16} strokeWidth={2}/>,
  service_providers:<Cpu            size={16} strokeWidth={2}/>,
  templates:       <Megaphone       size={16} strokeWidth={2}/>,
  overall_dashboard:<BarChart3      size={16} strokeWidth={2}/>,
  dashboard:        <BarChart2      size={16} strokeWidth={2}/>,
  internal_chat:   <MessageSquare   size={16} strokeWidth={2}/>,
  ai_chat:         <MessagesSquare  size={16} strokeWidth={2}/>,
  app_downloads:   <Smartphone      size={16} strokeWidth={2}/>,
  app_links_settings:<Link2         size={16} strokeWidth={2}/>,
  my_profile:      <User            size={16} strokeWidth={2}/>,
  preferences:     <SlidersHorizontal size={16} strokeWidth={2}/>,
  hrms_dash:       <BriefcaseBusiness size={16} strokeWidth={2}/>,
  hr_helpdesk:     <HeadphonesIcon  size={16} strokeWidth={2}/>,
  hr_compliance:   <ShieldCheck     size={16} strokeWidth={2}/>,
  shifts:          <Timer           size={16} strokeWidth={2}/>,
  assets:          <Package         size={16} strokeWidth={2}/>,
  offboarding:     <LogIn           size={16} strokeWidth={2}/>,
  notification_logs:<List           size={16} strokeWidth={2}/>,
  partner_permissions:<UserCheck    size={16} strokeWidth={2}/>,
  tasks_admin:     <ClipboardList   size={16} strokeWidth={2}/>,
  brand_site:      <Globe           size={16} strokeWidth={2}/>,
  // Dashboards (sub-type)
  branch_dashboard:    <Building2      size={16} strokeWidth={2}/>,
  menu_dashboard:      <UtensilsCrossed size={16} strokeWidth={2}/>,
  mess_dashboard:      <Coffee         size={16} strokeWidth={2}/>,
  finance_dashboard:   <Wallet         size={16} strokeWidth={2}/>,
  marketing_dashboard: <BadgePercent   size={16} strokeWidth={2}/>,
  system_dashboard:    <Monitor        size={16} strokeWidth={2}/>,
  config_dashboard:    <Monitor        size={16} strokeWidth={2}/>,
  // Downloads category item
  downloads:           <Smartphone     size={16} strokeWidth={2}/>,
};

// ─── Workspace Structure (matches reference design exactly) ───────────────────
export const WORKSPACE: WCat[] = [
  {
    id: 'restaurant-ops', label: 'Restaurant Operations', color: '#2563EB', bg: '#EFF6FF', icon: '🏪',
    description: 'Manage your restaurants, menus and daily operations.',
    items: [
      { id: 'branches',   label: 'Branch Management',   desc: 'Locations & hours' },
      { id: 'menus',      label: 'Menu Management',      desc: 'Items & categories' },
      { id: 'tiffin',     label: 'Tiffin Management',  desc: 'Subscription meals' },
      { id: 'inventory',  label: 'Inventory Management', desc: 'Stock & alerts' },
    ],
  },
  {
    id: 'dining', label: 'Dining Management', color: '#16A34A', bg: '#F0FDF4', icon: '🍽️',
    description: 'Handle tables, reservations and walk-in guests.',
    items: [
      { id: 'tables',       label: 'Tables',       desc: 'Layout & capacity' },
      { id: 'reservations', label: 'Reservations', desc: 'Pre-booked slots' },
      { id: 'waitlist',     label: 'Waitlist',     desc: 'Queue management' },
    ],
  },
  {
    id: 'orders', label: 'Orders Management', color: '#EA580C', bg: '#FFF7ED', icon: '🛍️',
    description: 'Track and fulfil all customer orders.',
    items: [
      { id: 'orders',           label: 'Orders',          desc: 'All incoming orders' },
      { id: 'refunds',          label: 'Refunds',         desc: 'Process refunds' },
      { id: 'corporate',        label: 'Corporate Orders', desc: 'Bulk plans' },
      { id: 'delivery_settings',label: 'Delivery',        desc: 'Zones & fees' },
    ],
  },
  {
    id: 'customers', label: 'Customer Management', color: '#7C3AED', bg: '#F5F3FF', icon: '👥',
    description: 'Manage customers, reviews and support.',
    items: [
      { id: 'users',     label: 'Customers',       desc: 'Profiles & history' },
      { id: 'reviews',   label: 'Reviews',         desc: 'Ratings & feedback' },
      { id: 'referrals', label: 'Referrals',       desc: 'Referral program' },
      { id: 'support',   label: 'Support Tickets', desc: 'Help queue' },
    ],
  },
  {
    id: 'marketing', label: 'Marketing', color: '#DB2777', bg: '#FDF2F8', icon: '🎯',
    description: 'Drive growth with offers, rewards and campaigns.',
    items: [
      { id: 'offers',   label: 'Offers',   desc: 'Discounts & promo' },
      { id: 'rewards',  label: 'Rewards',  desc: 'Loyalty store' },
      { id: 'coupons',  label: 'Coupons',  desc: 'Coupon codes' },
      { id: 'blogs',    label: 'Blogs',    desc: 'Content marketing' },
    ],
  },
  {
    id: 'cms', label: 'Website & CMS', color: '#0891B2', bg: '#ECFEFF', icon: '🌐',
    description: 'Website content, banners, pages and comments.',
    items: [
      { id: 'pages',    label: 'Pages',    desc: 'Static pages' },
      { id: 'sliders',  label: 'Sliders',  desc: 'Banners' },
      { id: 'comments', label: 'Comments', desc: 'User comments' },
      { id: 'seo',      label: 'SEO',      desc: 'Search optimization' },
    ],
  },
  {
    id: 'finance', label: 'Finance', color: '#059669', bg: '#ECFDF5', icon: '💰',
    description: 'Revenue, payouts, refunds and corporate billing.',
    items: [
      { id: 'payouts',           label: 'Payouts',          desc: 'Vendor payouts' },
      { id: 'payment_config',    label: 'Payments Config',  desc: 'Gateway setup' },
      { id: 'subscription_plans',label: 'Subscriptions',    desc: 'Plan management' },
      { id: 'surge_pricing',     label: 'Pricing',          desc: 'Surge & base' },
    ],
  },
  {
    id: 'hrms', label: 'HRMS', color: '#6D28D9', bg: '#F5F3FF', icon: '👔',
    description: 'Employees, attendance, leaves and payroll.',
    items: [
      { id: 'hrms',       label: 'Employees',  desc: 'Staff directory' },
      { id: 'attendance', label: 'Attendance', desc: 'Timesheets' },
      { id: 'leaves',     label: 'Leaves',     desc: 'Leave approvals' },
      { id: 'payroll',    label: 'Payroll',    desc: 'Salary & payslips' },
    ],
  },
  {
    id: 'admin-ops', label: 'Administration', color: '#D97706', bg: '#FFFBEB', icon: '⚙️',
    description: 'Tasks, compliance, audit logs and access control.',
    items: [
      { id: 'tasks',               label: 'Tasks',               desc: 'Task management' },
      { id: 'compliance',          label: 'Compliance',          desc: 'Regulatory docs' },
      { id: 'audit_logs',          label: 'Audit Logs',          desc: 'Activity trail' },
      { id: 'roles',               label: 'Roles & Permissions', desc: 'Access control' },
      { id: 'partner_permissions', label: 'Partner Permissions', desc: 'Module access' },
    ],
  },
  {
    id: 'platform', label: 'Platform Settings', color: '#0284C7', bg: '#F0F9FF', icon: '🔧',
    description: 'Integrations, channels and system configuration.',
    items: [
      { id: 'settings',        label: 'General Settings',       desc: 'Core config' },
      { id: 'email_config',    label: 'Email Configuration',    desc: 'SMTP' },
      { id: 'sms_config',      label: 'SMS Configuration',      desc: 'SMS provider' },
      { id: 'whatsapp_config', label: 'WhatsApp Configuration', desc: 'WA integration' },
      { id: 'brand_site',      label: 'Brand & Site Settings',  desc: 'Logo, SEO & social' },
    ],
  },
  {
    id: 'system', label: 'System & Config', color: '#0D9488', bg: '#F0FDFA', icon: '🛡️',
    description: 'Maps, SLA, surge pricing and service providers.',
    items: [
      { id: 'config_dashboard',  label: 'Configuration Dashboard', desc: 'System overview' },
      { id: 'sla_config',        label: 'SLA Configuration',       desc: 'Service levels' },
      { id: 'maps_config',       label: 'Maps & Location',         desc: 'Geolocation' },
      { id: 'service_providers', label: 'Service Providers',       desc: 'Third-party' },
    ],
  },
  {
    id: 'helpdesk', label: 'Support & Helpdesk', color: '#DC2626', bg: '#FEF2F2', icon: '🎫',
    description: 'Support tickets, helpdesk and knowledge base.',
    items: [
      { id: 'support',           label: 'Support Tickets',    desc: 'Customer issues' },
      { id: 'hr_helpdesk',       label: 'Helpdesk',           desc: 'Internal support' },
      { id: 'templates',         label: 'Announcements',      desc: 'Broadcasts' },
      { id: 'notification_logs', label: 'Notification Logs',  desc: 'Message history' },
    ],
  },
  {
    id: 'dashboards', label: 'Dashboards', color: '#7C3AED', bg: '#F5F3FF', icon: '📊',
    description: 'Analytics dashboards for all business areas.',
    items: [
      { id: 'overall_dashboard',   label: 'Overall Dashboard',   desc: 'Business overview' },
      { id: 'dashboard',           label: 'Core Dashboard',      desc: 'Key metrics' },
      { id: 'finance_dashboard',   label: 'Finance Dashboard',   desc: 'Revenue & costs' },
      { id: 'marketing_dashboard', label: 'Marketing Dashboard', desc: 'Campaign analytics' },
      { id: 'branch_dashboard',    label: 'Branch Dashboard',    desc: 'Per-branch stats' },
      { id: 'menu_dashboard',      label: 'Menu Dashboard',      desc: 'Item performance' },
      { id: 'mess_dashboard',      label: 'Mess Dashboard',      desc: 'Tiffin analytics' },
      { id: 'hrms_dash',           label: 'HRMS Dashboard',      desc: 'HR analytics' },
      { id: 'system_dashboard',    label: 'System Dashboard',    desc: 'Infrastructure' },
    ],
  },
  {
    id: 'communication', label: 'Chat & AI', color: '#2563EB', bg: '#EFF6FF', icon: '💬',
    description: 'Internal messaging, AI chatbot configuration and management.',
    items: [
      { id: 'internal_chat', label: 'Internal Chat',       desc: 'Team messaging' },
      { id: 'ai_chat',       label: 'AI Chat Management',  desc: 'Chatbot & providers' },
    ],
  },
  {
    id: 'downloads', label: 'App Downloads', color: '#0F172A', bg: '#F8FAFC', icon: '📲',
    description: 'Manage mobile app download links and publish to stores.',
    items: [
      { id: 'app_downloads',     label: 'Download Apps',     desc: 'All 4 apps & links' },
      { id: 'app_links_settings',label: 'Manage Store Links', desc: 'Update Play/App Store URLs' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ALL_ITEMS = (() => {
  const seen = new Set<string>();
  const out: { id: string; label: string; category: string; color: string; catId: string }[] = [];
  WORKSPACE.forEach(cat => cat.items.forEach(item => {
    const k = `${item.id}|${item.label}`;
    if (!seen.has(k)) { seen.add(k); out.push({ id: item.id, label: item.label, category: cat.label, color: cat.color, catId: cat.id }); }
  }));
  return out;
})();

function getCat(tabId: string): WCat | undefined {
  return WORKSPACE.find(c => c.items.some(i => i.id === tabId));
}
function getItem(tabId: string): WItem | undefined {
  for (const c of WORKSPACE) { const i = c.items.find(x => x.id === tabId); if (i) return i; }
  return undefined;
}

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem('ock_recent') || '[]'); } catch { return []; }
}
function pushRecent(tab: string) {
  if (tab === 'home') return;
  const r = [tab, ...getRecent().filter(x => x !== tab)].slice(0, 10);
  localStorage.setItem('ock_recent', JSON.stringify(r));
}
function getFavs(): string[] {
  try { return JSON.parse(localStorage.getItem('ock_favs') || '["branches","orders","users","offers","hrms"]'); } catch { return []; }
}
function toggleFav(id: string): string[] {
  const f = getFavs();
  const n = f.includes(id) ? f.filter(x => x !== id) : [...f, id];
  localStorage.setItem('ock_favs', JSON.stringify(n));
  return n;
}

// ═══════════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.message || 'Invalid credentials');
      const me = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${d.access_token}` } }).then(x => x.json());
      const role = (me.role || '').toUpperCase();
      if (!role.includes('ADMIN')) throw new Error('Admin access required. Use admin@test.com / test123');
      localStorage.setItem('admin_token', d.access_token);
      localStorage.setItem('admin_role', me.role);
      if (me.restaurantId) localStorage.setItem('admin_restaurant_id', me.restaurantId);
      localStorage.setItem('admin_permissions', JSON.stringify(me.permissions || []));
      onLogin();
    } catch (err: any) { setError(err.message || 'Invalid credentials'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.loginBg}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogoWrap}>
          <img src="/branding/transparent-logo.png" alt="One Choice Kitchen" className={styles.loginLogoImg} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className={styles.loginLogoBadge}>OCK</div>
        </div>
        <h1 className={styles.loginTitle}>Welcome back</h1>
        <p className={styles.loginSub}>One Choice Kitchen Admin Portal</p>
        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={styles.loginInput} placeholder="admin@test.com" autoFocus />
          </div>
          <div className={styles.loginField}>
            <label className={styles.loginLabel}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className={styles.loginInput} placeholder="••••••••" style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>{showPw ? '🙈' : '👁️'}</button>
            </div>
          </div>
          {error && <div className={styles.loginError}>⚠️ {error}</div>}
          <button type="submit" disabled={loading} className={styles.loginBtn}>
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
        <p className={styles.loginHint}>Demo: <strong>admin@test.com</strong> / <strong>test123</strong></p>
      </div>
      <GlobalMetadataInjector portalName="Admin Panel" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  COMMAND PALETTE  (Ctrl+K)
// ═══════════════════════════════════════════════════════════════════
function CommandPalette({ onNav, onClose }: { onNav: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const results = q.trim()
    ? ALL_ITEMS.filter(i => i.label.toLowerCase().includes(q.toLowerCase()) || i.category.toLowerCase().includes(q.toLowerCase())).slice(0, 10)
    : WORKSPACE.map(c => ({ id: c.items[0].id, label: c.label, category: 'Category', color: c.color, catId: c.id })).slice(0, 8);

  useEffect(() => setSel(0), [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && results[sel]) { onNav(results[sel].id); onClose(); }
    else if (e.key === 'Escape') onClose();
  };

  const grouped: Record<string, typeof results> = {};
  results.forEach(r => { if (!grouped[r.category]) grouped[r.category] = []; grouped[r.category].push(r); });

  return (
    <div className={styles.paletteOverlay} onClick={onClose}>
      <div className={styles.paletteBox} onClick={e => e.stopPropagation()}>
        <div className={styles.paletteInputRow}>
          <svg className={styles.palIcon} viewBox="0 0 20 20" fill="none" width="18" height="18">
            <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input ref={ref} className={styles.palInput} placeholder="Search modules, orders, customers, employees…" value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey} />
          <kbd className={styles.palEsc} onClick={onClose}>ESC</kbd>
        </div>
        <div className={styles.palResults}>
          {results.length === 0 ? <div className={styles.palEmpty}>No results for "{q}"</div> : null}
          {Object.entries(grouped).map(([cat, items]) => {
            const ci = WORKSPACE.find(c => c.label === cat);
            return (
              <div key={cat}>
                <div className={styles.palGroup}>{ci?.icon || '📂'} {cat}</div>
                {items.map((item, idx) => {
                  const gi = results.indexOf(item);
                  return (
                    <div key={idx} className={`${styles.palItem} ${sel === gi ? styles.palItemSel : ''}`}
                      onMouseEnter={() => setSel(gi)} onClick={() => { onNav(item.id); onClose(); }}>
                      <span className={styles.palDot} style={{ background: item.color }} />
                      <span className={styles.palLabel}>{item.label}</span>
                      <span className={styles.palArrow}>↵</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className={styles.palFoot}>
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>↵</kbd> Open</span>
          <span><kbd>ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  KPI STRIP
// ═══════════════════════════════════════════════════════════════════
function KpiStrip({ onNav }: { onNav: (id: string) => void }) {
  const [d, setD] = useState({ rev: 0, orders: 0, customers: 0, restaurants: 0, today: 0, pending: 0, lowStock: 0, plans: 0, riders: 0, partners: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders',              { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/users',               { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/branches',            { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/inventory',           { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/subscriptions/plans', { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/riders',              { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/partners',            { headers: authH() }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([orders, users, branches, inventory, plans, riders, partners]) => {
      const arr   = Array.isArray(orders)   ? orders   : (orders?.data   ?? []);
      const uArr  = Array.isArray(users)    ? users    : (users?.data    ?? []);
      const bArr  = Array.isArray(branches) ? branches : (branches?.data ?? []);
      const iArr  = Array.isArray(inventory)? inventory: (inventory?.data ?? []);
      const pArr  = Array.isArray(plans)    ? plans    : (plans?.data    ?? []);
      const rArr  = Array.isArray(riders)   ? riders   : (riders?.data   ?? []);
      const ptArr = Array.isArray(partners) ? partners : (partners?.data ?? []);
      const today = new Date().toDateString();
      const rev   = arr.filter((o: any) => ['DELIVERED','COMPLETED'].includes(o.status)).reduce((s: number, o: any) => s + (Number(o.totalAmount) || 0), 0);
      setD({
        rev,
        orders:      arr.length,
        customers:   uArr.length,
        restaurants: bArr.length,
        today:       arr.filter((o: any) => new Date(o.createdAt).toDateString() === today).length,
        pending:     arr.filter((o: any) => ['PENDING','CONFIRMED'].includes(o.status)).length,
        lowStock:    iArr.filter((i: any) => (i.quantity ?? i.stock ?? 0) <= (i.minStock ?? i.reorderLevel ?? 5)).length,
        plans:       pArr.length,
        riders:      rArr.filter((r: any) => r.status === 'APPROVED' || r.isActive).length,
        partners:    ptArr.filter((p: any) => p.status === 'APPROVED').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const fmtRev = (n: number) => n > 0 ? `₹ ${n.toLocaleString('en-IN')}` : '₹ 0';

  const KPIS = [
    { label: 'Total Revenue',      value: fmtRev(d.rev),                color: '#2563EB', bg: '#DBEAFE', sub: 'delivered + completed', icon: <IndianRupee size={22} strokeWidth={2.5} />, navId: 'orders' },
    { label: 'Total Orders',       value: d.orders.toLocaleString(),    color: '#16A34A', bg: '#DCFCE7', sub: 'all time orders',        icon: <ShoppingBag size={22} strokeWidth={2} />,   navId: 'orders' },
    { label: "Today's Orders",     value: d.today.toLocaleString(),     color: '#0284C7', bg: '#E0F2FE', sub: 'placed today',           icon: <ClipboardList size={22} strokeWidth={2} />, navId: 'orders' },
    { label: 'Pending Orders',     value: d.pending.toLocaleString(),   color: '#EA580C', bg: '#FFF7ED', sub: 'awaiting processing',    icon: <PackageCheck size={22} strokeWidth={2} />,  navId: 'orders' },
    { label: 'Total Customers',    value: d.customers.toLocaleString(), color: '#7C3AED', bg: '#EDE9FE', sub: 'registered users',       icon: <Users size={22} strokeWidth={2} />,          navId: 'users' },
    { label: 'Active Restaurants', value: d.restaurants.toLocaleString(), color: '#D97706', bg: '#FEF3C7', sub: 'branches configured', icon: <Store size={22} strokeWidth={2} />,          navId: 'branches' },
    { label: 'Active Riders',      value: d.riders.toLocaleString(),    color: '#0891B2', bg: '#CFFAFE', sub: 'approved delivery riders', icon: <Bike size={22} strokeWidth={2} />,          navId: 'users' },
    { label: 'Partner Restaurants',value: d.partners.toLocaleString(),  color: '#7C3AED', bg: '#EDE9FE', sub: 'approved partners',      icon: <Building2 size={22} strokeWidth={2} />,     navId: 'users' },
    { label: 'Low Stock Items',    value: d.lowStock.toLocaleString(),  color: '#DC2626', bg: '#FEF2F2', sub: 'need restocking',         icon: <AlertTriangle size={22} strokeWidth={2} />, navId: 'inventory' },
    { label: 'Active Plans',       value: d.plans.toLocaleString(),     color: '#059669', bg: '#ECFDF5', sub: 'subscription plans',      icon: <CalendarDays size={22} strokeWidth={2} />,  navId: 'tiffin' },
  ];

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  return (
    <div className={styles.kpiRow}>
      {KPIS.map((k, i) => (
        <div
          key={i}
          className={styles.kpiCard}
          role="button" tabIndex={0} aria-label={`View ${k.label}`}
          onClick={() => onNav(k.navId)}
          onKeyDown={e => e.key === 'Enter' && onNav(k.navId)}
          style={{
            '--card-color': k.color,
            cursor: 'pointer',
            boxShadow: `0 4px 16px ${hexToRgba(k.color, 0.18)}, 0 1px 4px ${hexToRgba(k.color, 0.1)}`,
          } as React.CSSProperties}
        >
          <div className={styles.kpiIcon} style={{ background: k.bg, color: k.color }}>{k.icon}</div>
          <div className={styles.kpiContent}>
            <p className={styles.kpiLbl}>{k.label}</p>
            <h3 className={styles.kpiVal} style={{ color: k.color }}>
              {loading ? <span className={styles.kpiSkel} /> : k.value}
            </h3>
            <div className={styles.kpiBottom}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>{k.trend}</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>{k.sub}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  WORKSPACE HOME
// ═══════════════════════════════════════════════════════════════════
function WorkspaceHome({ onNav }: { onNav: (id: string) => void }) {
  const [recent, setRecent] = useState<string[]>(getRecent());
  const [favs, setFavs] = useState<string[]>(getFavs());
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllFavs, setShowAllFavs] = useState(false);
  const [showFavManager, setShowFavManager] = useState(false);
  const toggleExpand = (catId: string) => setExpandedCards(prev => ({ ...prev, [catId]: !prev[catId] }));

  const CW_LIMIT = 8;  // cards shown before "View All Recent →"
  const FAV_LIMIT = 8; // cards shown before "Manage Favourites →"

  // 20 default recent items — covers all major modules
  const RECENT_DEFAULTS = [
    'branches','orders','users','menus','inventory','offers','hrms','settings',
    'tiffin','tables','reservations','dashboard','support','internal_chat',
    'payouts','reviews','referrals','rewards','coupons','audit_logs',
  ];
  const displayRecent = recent.length >= 4 ? recent : RECENT_DEFAULTS;
  const visibleRecent = showAllRecent ? displayRecent : displayRecent.slice(0, CW_LIMIT);
  const hiddenRecentCount = displayRecent.length - CW_LIMIT;

  // 16 default favourites
  const FAV_DEFAULTS = [
    'branches','orders','users','offers','hrms',
    'menus','inventory','tiffin','tables','reservations',
    'dashboard','support','payouts','reviews','roles','settings',
  ];
  const displayFavs = favs.length > 0 ? favs : FAV_DEFAULTS;
  const visibleFavs  = showAllFavs ? displayFavs : displayFavs.slice(0, FAV_LIMIT);
  const hiddenFavCount = displayFavs.length - FAV_LIMIT;

  const getInfo = (id: string) => {
    const cat = getCat(id);
    const item = cat?.items.find(i => i.id === id);
    return { cat, item };
  };

  const doFav = (e: React.MouseEvent, id: string) => { e.stopPropagation(); setFavs(toggleFav(id)); };

  // ── Stroke SVG icons: category fallback (same as WS_ICONS but 18px) ──────
  // ── Lucide icons for category fallback (Explore Workspace label area) ──
  const CAT_SVG: Record<string, React.ReactElement> = {
    'restaurant-ops': <Building2      size={18} strokeWidth={2} />,
    'dining':         <UtensilsCrossed size={18} strokeWidth={2} />,
    'orders':         <Receipt         size={18} strokeWidth={2} />,
    'customers':      <Users           size={18} strokeWidth={2} />,
    'marketing':      <BadgePercent    size={18} strokeWidth={2} />,
    'cms':            <Globe           size={18} strokeWidth={2} />,
    'finance':        <Wallet          size={18} strokeWidth={2} />,
    'hrms':           <BriefcaseBusiness size={18} strokeWidth={2} />,
    'admin-ops':      <ShieldCheck     size={18} strokeWidth={2} />,
    'platform':       <Settings2       size={18} strokeWidth={2} />,
    'system':         <Monitor         size={18} strokeWidth={2} />,
    'helpdesk':       <LifeBuoy        size={18} strokeWidth={2} />,
    'dashboards':     <BarChart3       size={18} strokeWidth={2} />,
    'communication':  <MessageSquare   size={18} strokeWidth={2} />,
  };

  // ── Lucide icons per module (Continue Working & Favorites) ──
  const CW_SVG: Record<string, { icon: React.ReactElement; color: string; bg: string }> = {
    branches:    { color: '#2563EB', bg: '#EFF6FF', icon: <Building2       size={20} strokeWidth={2} /> },
    orders:      { color: '#16A34A', bg: '#DCFCE7', icon: <ShoppingBag      size={20} strokeWidth={2} /> },
    users:       { color: '#7C3AED', bg: '#F5F3FF', icon: <Users            size={20} strokeWidth={2} /> },
    menus:       { color: '#D97706', bg: '#FEF3C7', icon: <UtensilsCrossed  size={20} strokeWidth={2} /> },
    inventory:   { color: '#6366F1', bg: '#EEF2FF', icon: <Package          size={20} strokeWidth={2} /> },
    offers:      { color: '#DB2777', bg: '#FDF2F8', icon: <Tags             size={20} strokeWidth={2} /> },
    hrms:        { color: '#6D28D9', bg: '#F5F3FF', icon: <UserRoundCog     size={20} strokeWidth={2} /> },
    settings:    { color: '#475569', bg: '#F1F5F9', icon: <Cog              size={20} strokeWidth={2} /> },
    tiffin:      { color: '#D97706', bg: '#FEF3C7', icon: <Coffee           size={20} strokeWidth={2} /> },
    tables:      { color: '#7C3AED', bg: '#F5F3FF', icon: <TableProperties  size={20} strokeWidth={2} /> },
    reservations:{ color: '#0D9488', bg: '#F0FDFA', icon: <Calendar         size={20} strokeWidth={2} /> },
    dashboard:   { color: '#0284C7', bg: '#E0F2FE', icon: <BarChart3        size={20} strokeWidth={2} /> },
    support:     { color: '#DC2626', bg: '#FEF2F2', icon: <LifeBuoy         size={20} strokeWidth={2} /> },
    internal_chat:{ color: '#2563EB', bg: '#EFF6FF', icon: <MessageSquare   size={20} strokeWidth={2} /> },
    payouts:     { color: '#059669', bg: '#ECFDF5', icon: <Wallet           size={20} strokeWidth={2} /> },
    reviews:     { color: '#EA580C', bg: '#FFF7ED', icon: <Star             size={20} strokeWidth={2} /> },
    referrals:   { color: '#7C3AED', bg: '#F5F3FF', icon: <Users            size={20} strokeWidth={2} /> },
    rewards:     { color: '#D97706', bg: '#FEF3C7', icon: <BadgePercent     size={20} strokeWidth={2} /> },
    coupons:     { color: '#DB2777', bg: '#FDF2F8', icon: <Tags             size={20} strokeWidth={2} /> },
    audit_logs:  { color: '#475569', bg: '#F1F5F9', icon: <ShieldCheck      size={20} strokeWidth={2} /> },
    roles:       { color: '#0D9488', bg: '#F0FDFA', icon: <ShieldCheck      size={20} strokeWidth={2} /> },
    app_downloads:      { color: '#0F172A', bg: '#F1F5F9', icon: <Smartphone size={20} strokeWidth={2} /> },
    app_links_settings: { color: '#0F172A', bg: '#F1F5F9', icon: <Smartphone size={20} strokeWidth={2} /> },
    // Category page icons
    cat_orders:         { color: '#16A34A', bg: '#DCFCE7', icon: <ShoppingBag   size={20} strokeWidth={2} /> },
    cat_customers:      { color: '#7C3AED', bg: '#F5F3FF', icon: <Users         size={20} strokeWidth={2} /> },
    cat_marketing:      { color: '#DB2777', bg: '#FDF2F8', icon: <Tags          size={20} strokeWidth={2} /> },
    'cat_restaurant-ops':{ color: '#D97706', bg: '#FEF3C7', icon: <UtensilsCrossed size={20} strokeWidth={2} /> },
    cat_dining:         { color: '#7C3AED', bg: '#F5F3FF', icon: <TableProperties size={20} strokeWidth={2} /> },
    cat_finance:        { color: '#059669', bg: '#ECFDF5', icon: <Wallet        size={20} strokeWidth={2} /> },
    cat_hrms:           { color: '#6D28D9', bg: '#F5F3FF', icon: <UserRoundCog  size={20} strokeWidth={2} /> },
    cat_cms:            { color: '#0284C7', bg: '#E0F2FE', icon: <BarChart3     size={20} strokeWidth={2} /> },
    'cat_admin-ops':    { color: '#475569', bg: '#F1F5F9', icon: <ShieldCheck   size={20} strokeWidth={2} /> },
    cat_platform:       { color: '#2563EB', bg: '#EFF6FF', icon: <Cog          size={20} strokeWidth={2} /> },
    cat_system:         { color: '#0F172A', bg: '#F1F5F9', icon: <Cog          size={20} strokeWidth={2} /> },
    cat_helpdesk:       { color: '#DC2626', bg: '#FEF2F2', icon: <LifeBuoy     size={20} strokeWidth={2} /> },
    cat_communication:  { color: '#2563EB', bg: '#EFF6FF', icon: <MessageSquare size={20} strokeWidth={2} /> },
    cat_downloads:      { color: '#0F172A', bg: '#F1F5F9', icon: <Smartphone   size={20} strokeWidth={2} /> },
    'cat_mobile-apps':  { color: '#0F172A', bg: '#F1F5F9', icon: <Smartphone   size={20} strokeWidth={2} /> },
    cat_dashboards:     { color: '#0284C7', bg: '#E0F2FE', icon: <BarChart3    size={20} strokeWidth={2} /> },
  };

  // Label overrides for better display
  const LABEL_MAP: Record<string, string> = {
    branches: 'Branch Management', orders: 'Orders', users: 'Customers',
    menus: 'Menu Management', inventory: 'Inventory Management', offers: 'Offers',
    hrms: 'Employees', settings: 'Settings', tiffin: 'Tiffin Management',
    tables: 'Tables', reservations: 'Reservations',
    // Category page IDs (cat_<catId>) — must be listed so Continue Working shows proper names
    cat_orders:         'Orders',
    cat_customers:      'Customers',
    cat_marketing:      'Marketing',
    cat_restaurant_ops: 'Restaurant Ops',
    'cat_restaurant-ops': 'Restaurant Ops',
    cat_dining:         'Dining',
    cat_finance:        'Finance',
    cat_hrms:           'HR & Staff',
    cat_cms:            'Content',
    cat_admin_ops:      'Admin Ops',
    'cat_admin-ops':    'Admin Ops',
    cat_platform:       'Platform',
    cat_system:         'System',
    cat_helpdesk:       'Help & Support',
    cat_communication:  'Communication',
    cat_downloads:      'Download Apps',
    'cat_mobile-apps':  'Mobile Apps',
    cat_dashboards:     'Dashboards',
  };

  // Short descriptions shown on cards and as hover tooltips
  const DESC_MAP: Record<string, string> = {
    branches:          'Manage restaurant branches, locations & hours',
    orders:            'View, track & manage all customer orders',
    users:             'Customer profiles, loyalty & purchase history',
    menus:             'Create & update menus, items & pricing',
    inventory:         'Stock levels, low-stock alerts & reordering',
    offers:            'Discounts, promo codes & seasonal deals',
    hrms:              'Employee records, roles & HR operations',
    hrms_dash:         'HR overview, headcount & attendance KPIs',
    settings:          'Platform-wide config & preferences',
    tiffin:            'Subscription meal plans & delivery schedule',
    tables:            'Floor plan, table status & seating capacity',
    reservations:      'Booking calendar, walk-ins & waitlist',
    dashboard:         'Overall business performance at a glance',
    overall_dashboard: 'Revenue, orders & key metrics dashboard',
    support:           'Customer support tickets & helpdesk',
    internal_chat:     'Team messaging & internal communications',
    ai_chat:           'AI assistant & chatbot configuration',
    payouts:           'Partner payouts, settlements & history',
    payment_config:    'Payment gateways & payout settings',
    reviews:           'Customer ratings, feedback & responses',
    referrals:         'Referral program tracking & rewards',
    rewards:           'Loyalty points & OCK coins management',
    coupons:           'Coupon generation & redemption tracking',
    audit_logs:        'System activity log & admin audit trail',
    roles:             'Role definitions & access permissions',
    tasks:             'Admin task board & to-do management',
    attendance:        'Staff attendance records & timesheets',
    leaves:            'Leave requests, approvals & balances',
    payroll:           'Salary processing & payslip generation',
    // Category descriptions
    cat_orders:          'All order management & tracking tools',
    cat_customers:       'Customers, partners & rider management',
    cat_marketing:       'Offers, coupons, loyalty & referrals',
    'cat_restaurant-ops':'Kitchen ops, menus, tables & reservations',
    cat_dining:          'Dining tables, reservations & floor plan',
    cat_finance:         'Revenue, payouts & payment configuration',
    cat_hrms:            'HR, attendance, leaves & payroll',
    cat_cms:             'Content & static page management',
    'cat_admin-ops':     'Admin tasks, roles & audit logs',
    cat_platform:        'Platform settings & configurations',
    cat_system:          'System-level controls & developer tools',
    cat_helpdesk:        'Customer support & help desk tools',
    cat_communication:   'Internal chat & AI assistant',
    cat_downloads:       'App download links & mobile setup',
    'cat_mobile-apps':   'Mobile app management & publishing',
    cat_dashboards:      'Business analytics & reporting dashboards',
  };

  // Per-item icons for explore cards — alias to module-level map
  const ITEM_ICONS = ITEM_ICONS_SM;

  return (
    <div className={styles.wsHome}>
      {/* Welcome */}
      <div className={styles.welcomeWrap}>
        <h1 className={styles.welcomeH1}>Welcome back, Administrator! 👋</h1>
        <p className={styles.welcomeP}>Here's what's happening with your business today.</p>
      </div>

      {/* Quick Stats */}
      <section className={styles.wsSec}>
        <div className={styles.wsSecHead}>
          <span className={styles.wsSecTitle}>📊 Quick Stats</span>
        </div>
        <KpiStrip onNav={onNav} />
      </section>

      {/* Continue Working */}
      <section className={styles.wsSec}>
        <div className={styles.wsSecHead}>
          <span className={styles.wsSecTitle}>🕐 Continue Working</span>
          <button className={styles.wsSecLink} onClick={() => setShowAllRecent(v => !v)}>
            {showAllRecent ? '↑ Show Less' : `View All Recent →`}
          </button>
        </div>
        <div className={styles.cwGrid}>
          {visibleRecent.map((id, i) => {
            const { cat } = getInfo(id);
            // For category-page IDs (cat_orders, cat_marketing, etc.) resolve WORKSPACE directly
            const catPageId = id.startsWith('cat_') ? id.slice(4) : null;
            const wsCat = catPageId ? WORKSPACE.find(c => c.id === catPageId) : null;
            const resolvedCat = cat || wsCat;
            const svgInfo = CW_SVG[id];
            const wsIcon = resolvedCat ? WS_ICONS[resolvedCat.id] : null;
            const fallbackIcon = wsIcon || (resolvedCat ? CAT_SVG[resolvedCat.id] : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>);
            const iconEl = svgInfo?.icon || fallbackIcon;
            const iconColor = svgInfo?.color || resolvedCat?.color || '#64748b';
            const iconBg = svgInfo?.bg || resolvedCat?.bg || '#f8fafc';
            const label = LABEL_MAP[id] || resolvedCat?.items?.find((x: any) => x.id === id)?.label || id;
            const catLabel = resolvedCat?.label || LABEL_MAP[id] || 'Module';
            const desc = DESC_MAP[id] || '';
            return (
              <div key={i} className={styles.cwCard}
                onClick={() => onNav(id)}
                onKeyDown={e => e.key === 'Enter' && onNav(id)}
                role="button" tabIndex={0} aria-label={`Go to ${label}`}
                title={desc}>
                <div className={styles.cwIconWrap}>
                  <div className={styles.cwIcon} style={{ background: iconBg, color: iconColor }}>{iconEl}</div>
                </div>
                <div className={styles.cwInfo}>
                  <div className={styles.cwLabel}>{label}</div>
                  <div className={styles.cwCat}>{catLabel}</div>
                  {desc && <div className={styles.cwDesc}>{desc}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* Favourites + Manage Favourites Modal */}
      {showFavManager && (
        <div style={{ position:'fixed', inset:0, zIndex:900, background:'rgba(15,23,42,.5)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setShowFavManager(false)}>
          <div style={{ background:'var(--surf)', borderRadius:'var(--rd-lg)', padding:'1.5rem', width:'min(680px,92vw)', maxHeight:'80vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
              <h2 style={{ fontSize:'1.1rem', fontWeight:700, margin:0 }}>⭐ Manage Favourites</h2>
              <button onClick={() => setShowFavManager(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.25rem', color:'var(--text2)' }}>✕</button>
            </div>
            <p style={{ fontSize:'0.82rem', color:'var(--text2)', marginBottom:'1rem' }}>Click the ⭐ to add or remove modules from your Quick Favourites.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'0.625rem' }}>
              {ALL_ITEMS.map(item => {
                const isFav = (favs.length > 0 ? favs : FAV_DEFAULTS).includes(item.id);
                const svgInfo = CW_SVG[item.id];
                const cat = getCat(item.id);
                const iconColor = svgInfo?.color || cat?.color || '#64748b';
                const iconBg   = svgInfo?.bg    || cat?.bg    || '#f8fafc';
                const iconEl   = svgInfo?.icon  || (cat ? CAT_SVG[cat.id] : null);
                return (
                  <div key={item.id}
                    style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem 0.75rem', borderRadius:'var(--rd-sm)', border:`1px solid ${isFav ? iconColor+'44' : 'var(--bdr)'}`, background: isFav ? iconBg : 'var(--bg)', cursor:'pointer', transition:'all .15s' }}
                    onClick={() => { setFavs(toggleFav(item.id)); }}>
                    <div style={{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', background:iconBg, color:iconColor, flexShrink:0 }}>{iconEl}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text3)' }}>{item.category}</div>
                    </div>
                    <span style={{ fontSize:'1rem', color: isFav ? '#f59e0b' : 'var(--text3)' }}>{isFav ? '⭐' : '☆'}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:'1.25rem', display:'flex', justifyContent:'flex-end', gap:'0.75rem' }}>
              <button onClick={() => setShowFavManager(false)} style={{ padding:'0.5rem 1.25rem', borderRadius:'var(--rd-sm)', background:'var(--bg)', border:'1px solid var(--bdr)', cursor:'pointer', fontWeight:600, fontSize:'0.875rem' }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Favourites section */}
      <section className={styles.wsSec}>
        <div className={styles.wsSecHead}>
          <span className={styles.wsSecTitle}>⭐ Quick Favourites</span>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            {hiddenFavCount > 0 && (
              <button className={styles.wsSecLink} onClick={() => setShowAllFavs(v => !v)}>
                {showAllFavs ? '↑ Show Less' : `View All (${displayFavs.length}) →`}
              </button>
            )}
            <button className={styles.wsSecLink} onClick={() => setShowFavManager(true)}>⚙ Manage →</button>
          </div>
        </div>
        <div className={styles.favGrid}>
          {visibleFavs.map((id, i) => {
            const { cat } = getInfo(id);
            const catPageId2 = id.startsWith('cat_') ? id.slice(4) : null;
            const wsCat2 = catPageId2 ? WORKSPACE.find(c => c.id === catPageId2) : null;
            const resolvedCat2 = cat || wsCat2;
            const svgInfo = CW_SVG[id];
            const wsIcon = resolvedCat2 ? WS_ICONS[resolvedCat2.id] : null;
            const fallbackIcon = wsIcon || (resolvedCat2 ? CAT_SVG[resolvedCat2.id] : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>);
            const iconEl = svgInfo?.icon || fallbackIcon;
            const iconColor = svgInfo?.color || resolvedCat2?.color || '#64748b';
            const iconBg = svgInfo?.bg || resolvedCat2?.bg || '#f8fafc';
            const label = LABEL_MAP[id] || resolvedCat2?.items?.find((x: any) => x.id === id)?.label || id;
            const desc = DESC_MAP[id] || '';
            return (
              <div key={i} className={styles.favCard}
                onClick={() => onNav(id)}
                onKeyDown={e => e.key === 'Enter' && onNav(id)}
                role="button" tabIndex={0} aria-label={`Go to ${label}`}
                title={desc}>
                <div className={styles.favIcon} style={{ background: iconBg, color: iconColor }}>{iconEl}</div>
                <div className={styles.favBody}>
                  <div className={styles.favLabel}>{label}</div>
                  <div className={styles.favCat}>{resolvedCat2?.label || LABEL_MAP[id] || 'Module'}</div>
                  {desc && <div className={styles.favDesc}>{desc}</div>}
                </div>
                <button className={styles.favStar} onClick={e => doFav(e, id)} title="Remove from favourites">
                  <Star size={18} fill="currentColor" strokeWidth={0} />
                </button>
              </div>
            );
          })}
        </div>
      </section>



      <section className={styles.wsSec}>
        <div className={styles.wsSecHead}>
          <span className={styles.wsSecTitle}>🗂️ Explore Workspace</span>
        </div>
        <div className={styles.exploreGrid}>
          {WORKSPACE.map(cat => {
            const isExpanded = !!expandedCards[cat.id];
            const SHOW = 5;
            const visibleItems = isExpanded ? cat.items : cat.items.slice(0, SHOW);
            const remaining = cat.items.length - SHOW;
            return (
              <div key={cat.id} className={`${styles.exploreCard} ${isExpanded ? styles.exploreCardExpanded : ''}`}>
                <div className={styles.exploreHead}>
                  <div className={styles.exploreCircle} style={{ background: cat.color, color: '#fff' }}>
                    {WS_ICONS[cat.id] || cat.icon}
                  </div>
                  <span
                    className={styles.exploreTitle}
                    onClick={() => onNav(`cat_${cat.id}`)}
                    onKeyDown={e => e.key === 'Enter' && onNav(`cat_${cat.id}`)}
                    role="button" tabIndex={0}
                    title={`View all ${cat.label} modules`}
                  >{cat.label}</span>
                </div>
                <div className={styles.exploreList}>
                  {visibleItems.map((item, ii) => (
                    <div key={`${cat.id}-${ii}`} className={styles.exploreItem}
                      onClick={() => onNav(item.id)}
                      onKeyDown={e => e.key === 'Enter' && onNav(item.id)}
                      role="button" tabIndex={0}
                      style={{ '--c': cat.color } as any}>
                      <span className={styles.exploreItemIcon} style={{ color: cat.color }}>
                        {ITEM_ICONS[item.id] || <ArrowRight size={16} strokeWidth={2} />}
                      </span>
                      <span className={styles.exploreItemLabel}>{item.label}</span>
                    </div>
                  ))}
                </div>
                {remaining > 0 && !isExpanded && (
                  <div className={styles.exploreMore}
                    onClick={() => toggleExpand(cat.id)}
                    role="button" tabIndex={0}
                    title={`Show ${remaining} more items`}>
                    + {remaining} more items
                  </div>
                )}
                {isExpanded && (
                  <div className={styles.exploreMore}
                    onClick={() => toggleExpand(cat.id)}
                    role="button" tabIndex={0}
                    title="Show less">
                    ↑ Show less
                  </div>
                )}
                <button className={styles.exploreViewAll} style={{ color: cat.color }}
                  onClick={() => onNav(`cat_${cat.id}`)}
                  title={`View all ${cat.label} modules`}>
                  View All →
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Download Apps Banner ───────────────────────────────────────────── */}
      <div className={styles.dlBanner}>
        <div className={styles.dlBannerEmoji}>📲</div>
        <div className={styles.dlBannerText}>
          <div className={styles.dlBannerTitle}>OneChoiceKitchen Mobile Apps</div>
          <div className={styles.dlBannerSub}>
            Manage download links for Customer, Partner, Rider &amp; Admin apps — and publish to Play Store / App Store.
          </div>
        </div>
        <div className={styles.dlBannerBtns}>
          <button
            onClick={() => onNav('app_downloads')}
            style={{ background: 'rgba(255,255,255,.95)', color: '#2563EB', border: 'none', borderRadius: '.625rem', padding: '.6rem 1.25rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            📥 View Apps
          </button>
          <button
            onClick={() => onNav('app_links_settings')}
            style={{ background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', borderRadius: '.625rem', padding: '.6rem 1.25rem', fontWeight: 700, fontSize: '.875rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            ⚙️ Manage Links
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MODULE PAGE  (breadcrumb + content)
// ═══════════════════════════════════════════════════════════════════

// Maps special tab IDs → human-readable breadcrumb labels
const SPECIAL_LABELS: Record<string, string> = {
  privacy_policy:   'Privacy Policy',
  terms_of_service: 'Terms of Service',
  support_center:   'Support Center',
  api_documentation:'API Documentation',
  app_downloads:    'Download Apps',
  app_links_settings:'Manage Store Links',
  my_profile:       'My Profile',
  preferences:      'Preferences',
};

function ModulePage({
  tabId, onHome, onNav, children,
}: {
  tabId: string;
  onHome: () => void;
  onNav?: (id: string) => void;
  children: React.ReactNode;
}) {
  const isCatPage = tabId.startsWith('cat_');
  const catIdRaw  = isCatPage ? tabId.slice(4) : null;
  const catDirect = catIdRaw ? WORKSPACE.find(c => c.id === catIdRaw) : null;
  const parentCat = !isCatPage ? getCat(tabId)  : null;
  const item      = !isCatPage ? getItem(tabId) : null;
  const specialLabel = SPECIAL_LABELS[tabId] ?? null;

  // Small (14px) WS_ICONS for breadcrumb
  const WS_ICONS_SM: Record<string, React.ReactElement> = {
    'restaurant-ops': <Building2      size={14} strokeWidth={2}/>,
    'dining':         <UtensilsCrossed size={14} strokeWidth={2}/>,
    'orders':         <Receipt         size={14} strokeWidth={2}/>,
    'customers':      <Users           size={14} strokeWidth={2}/>,
    'marketing':      <BadgePercent    size={14} strokeWidth={2}/>,
    'cms':            <Globe           size={14} strokeWidth={2}/>,
    'finance':        <Wallet          size={14} strokeWidth={2}/>,
    'hrms':           <BriefcaseBusiness size={14} strokeWidth={2}/>,
    'admin-ops':      <ShieldCheck     size={14} strokeWidth={2}/>,
    'platform':       <Settings2       size={14} strokeWidth={2}/>,
    'system':         <Monitor         size={14} strokeWidth={2}/>,
    'helpdesk':       <LifeBuoy        size={14} strokeWidth={2}/>,
    'dashboards':     <BarChart3       size={14} strokeWidth={2}/>,
    'communication':  <MessageSquare   size={14} strokeWidth={2}/>,
  };

  return (
    <div className={styles.modPage}>
      <div className={styles.breadcrumb}>
        {/* Home */}
        <button className={styles.bcItem} onClick={onHome}>
          <LayoutGrid size={13} />
          Workspace
        </button>

        {/* Category overview page */}
        {isCatPage && catDirect && (
          <>
            <span className={styles.bcSep}>›</span>
            <span className={`${styles.bcItem} ${styles.bcActive}`} style={{ color: catDirect.color }}>
              {WS_ICONS_SM[catDirect.id]}
              {catDirect.label}
            </span>
          </>
        )}

        {/* Normal module page: clickable category + active item */}
        {!isCatPage && parentCat && (
          <>
            <span className={styles.bcSep}>›</span>
            <button
              className={styles.bcItem}
              style={{ color: parentCat.color }}
              onClick={() => onNav?.(`cat_${parentCat.id}`)}
              title={`View all ${parentCat.label} modules`}
            >
              {WS_ICONS_SM[parentCat.id]}
              {parentCat.label}
            </button>
          </>
        )}
        {!isCatPage && item && (
          <>
            <span className={styles.bcSep}>›</span>
            <span className={`${styles.bcItem} ${styles.bcActive}`}>
              {ITEM_ICONS_SM[item.id]}
              {item.label}
            </span>
          </>
        )}

        {/* Special / footer page */}
        {!isCatPage && !parentCat && specialLabel && (
          <>
            <span className={styles.bcSep}>›</span>
            <span className={`${styles.bcItem} ${styles.bcActive}`}>{specialLabel}</span>
          </>
        )}
      </div>
      <div className={styles.modContent}>{children}</div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
//  RENDER MODULE  (all 70+ pages wired)
// ═══════════════════════════════════════════════════════════════════
function renderModule(tab: string, nav: (id: string) => void) {
  switch (tab) {
    // Restaurant Ops
    case 'branches':    return <BranchesAdmin />;
    case 'menus':       return <MenusAdmin />;
    case 'tiffin':      return <TiffinAdmin />;
    case 'inventory':   return <InventoryAdmin />;
    // Dining
    case 'tables':        return <TablesAdmin />;
    case 'reservations':  return <ReservationsAdmin />;
    case 'waitlist':      return <WaitlistAdmin />;
    // Orders
    case 'orders':            return <OrdersAdmin />;
    case 'refunds':           return <RefundsAdmin />;
    case 'corporate':         return <CorporateAdmin />;
    case 'delivery_settings': return <DeliverySettingsAdmin />;
    // Customers
    case 'users':     return <UsersAdmin />;
    case 'reviews':   return <ReviewsAdmin />;
    case 'referrals': return <ReferralsAdmin />;
    case 'support':   return <SupportAdmin />;
    // Marketing
    case 'offers':        return <OffersAdmin />;
    case 'rewards':       return <RewardsAdmin />;
    case 'surge_pricing': return <SurgePricingAdmin />;
    // CMS
    case 'blogs':    return <BlogsAdmin />;
    case 'pages':    return <PagesAdmin />;
    case 'sliders':  return <SlidersAdmin />;
    case 'comments': return <CommentsAdmin />;
    case 'seo':      return <SeoManagement />;
    // Finance
    case 'payouts':          return <PayoutsAdmin />;
    case 'payment_config':   return <PaymentConfiguration />;
    case 'subscription_plans':return <SubscriptionPlansAdmin />;
    // HRMS
    case 'hrms':        return <HRMSAdmin />;
    case 'hrms_dash':   return <HRMSDashboard />;
    case 'leaves':      return <LeavesAdmin />;
    case 'payroll':     return <PayrollAdmin />;
    case 'attendance':  return <AttendanceAdmin />;
    case 'assets':      return <AssetsAdmin />;
    case 'shifts':      return <ShiftsAdmin />;
    case 'offboarding': return <OffboardingAdmin />;
    case 'hr_compliance': return <HRComplianceAdmin />;
    case 'hr_helpdesk': return <HRHelpdeskAdmin />;
    // Administration
    case 'tasks':      return <TasksAdmin />;
    case 'compliance': return <ComplianceAdmin />;
    case 'audit_logs': return <AuditLogsAdmin />;
    case 'roles':      return <RolesPermissionsAdmin />;
    case 'templates':  return <NotificationTemplatesAdmin />;
    // Settings
    case 'settings':          return <SettingsAdmin />;
    case 'email_config':      return <EmailConfiguration />;
    case 'sms_config':        return <SmsConfiguration />;
    case 'whatsapp_config':   return <WhatsappConfigAdmin />;
    case 'maps_config':       return <MapsConfigAdmin />;
    case 'sla_config':        return <SlaConfigAdmin />;
    case 'service_providers': return <ServiceProvidersConfiguration />;
    case 'brand_site':        return <BrandSiteAdmin />;
    // Dashboards
    case 'dashboard':         return <DashboardAdmin />;
    case 'overall_dashboard': return <OverallDashboardAdmin />;
    case 'finance_dashboard': return <FinanceDashboardAdmin />;
    case 'marketing_dashboard':return <MarketingDashboardAdmin />;
    case 'system_dashboard':  return <SystemDashboardAdmin />;
    case 'config_dashboard':  return <ConfigDashboardAdmin />;
    // Other
    case 'my_profile':  return <MyProfileAdmin />;
    case 'preferences': return <PreferencesAdmin />;
    case 'directory':   return <DirectoryAdmin />;
    case 'venues':      return <VenuesAdmin />;
    // Chat & AI
    case 'internal_chat': return <InternalChatAdmin />;
    case 'ai_chat':       return <AiChatManagementAdmin />;
    // New dashboards
    case 'branch_dashboard':    return <BranchDashboardAdmin />;
    case 'menu_dashboard':      return <MenuDashboardAdmin />;
    case 'mess_dashboard':      return <MessDashboardAdmin />;
    // Partner RBAC
    case 'partner_permissions': return <PartnerPermissionsAdmin />;
    // New routes
    case 'coupons':          return <CouponsAdmin />;
    case 'notification_logs':return <NotificationLogs />;
    // App Downloads (Admin Portal only — shows all 4 apps incl. Admin App)
    case 'app_downloads':       return <DownloadPage />;
    case 'app_links_settings':  return <AppLinksSettings />;
    // ── Category Overview Pages (Explore Workspace → View All / Title click) ──
    case 'cat_restaurant-ops':  return <CategoryPage catId="restaurant-ops"  onNav={nav} />;
    case 'cat_dining':          return <CategoryPage catId="dining"           onNav={nav} />;
    case 'cat_orders':          return <CategoryPage catId="orders"           onNav={nav} />;
    case 'cat_customers':       return <CategoryPage catId="customers"        onNav={nav} />;
    case 'cat_marketing':       return <CategoryPage catId="marketing"        onNav={nav} />;
    case 'cat_cms':             return <CategoryPage catId="cms"              onNav={nav} />;
    case 'cat_finance':         return <CategoryPage catId="finance"          onNav={nav} />;
    case 'cat_hrms':            return <CategoryPage catId="hrms"             onNav={nav} />;
    case 'cat_admin-ops':       return <CategoryPage catId="admin-ops"        onNav={nav} />;
    case 'cat_platform':        return <CategoryPage catId="platform"         onNav={nav} />;
    case 'cat_system':          return <CategoryPage catId="system"           onNav={nav} />;
    case 'cat_helpdesk':        return <CategoryPage catId="helpdesk"         onNav={nav} />;
    case 'cat_dashboards':      return <CategoryPage catId="dashboards"       onNav={nav} />;
    case 'cat_communication':   return <CategoryPage catId="communication"    onNav={nav} />;
    case 'cat_downloads':      return <CategoryPage catId="downloads"      onNav={nav} />;
    case 'cat_mobile-apps':     return <CategoryPage catId="mobile-apps"      onNav={nav} />;
    // ── Footer Pages ──────────────────────────────────────────────────────
    case 'privacy_policy':    return <PrivacyPolicyPage />;
    case 'terms_of_service':  return <TermsOfServicePage />;
    case 'support_center':    return <SupportCenterPage />;
    case 'api_documentation': return <ApiDocumentationPage />;
    default:
      return (
        <div className={styles.comingSoon}>
          <div className={styles.csDone}>
            <span className={styles.csIcon}>🚧</span>
            <h2 className={styles.csH2}>Coming Soon</h2>
            <p className={styles.csP}>The <strong>{tab}</strong> module is under development.</p>
            <button className={styles.csBtn} onClick={() => nav('home')}>← Back to Workspace</button>
          </div>
        </div>
      );
  }
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════
function MainApp() {
  const getTab = () => { if (typeof window !== 'undefined') { const p = new URLSearchParams(window.location.search); return p.get('tab') || 'home'; } return 'home'; };

  const [tab, setTab] = useState(getTab);
  const [role] = useState(localStorage.getItem('admin_role') || 'ADMIN');
  const [dark, setDark] = useState(() => localStorage.getItem('ock_dark') === 'true');
  const [palette, setPalette] = useState(false);
  const [notif, setNotif] = useState(false);
  const [quick, setQuick] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mobileSheet, setMobileSheet] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  // URL sync
  useEffect(() => { if (typeof window !== 'undefined') { const p = new URLSearchParams(window.location.search); if (p.get('tab') !== tab) window.history.pushState(null, '', `?tab=${tab}`); } }, [tab]);
  useEffect(() => { const h = () => setTab(new URLSearchParams(window.location.search).get('tab') || 'home'); window.addEventListener('popstate', h); return () => window.removeEventListener('popstate', h); }, []);

  // Dark mode
  useEffect(() => { document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light'); localStorage.setItem('ock_dark', String(dark)); }, [dark]);

  // Ctrl+K
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setPalette(p => !p); } if (e.key === 'Escape') { setPalette(false); setNotif(false); setQuick(false); setUserMenu(false); } };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);

  // Outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotif(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setQuick(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  const nav = useCallback((id: string, action?: string) => {
    setTab(id); setMobileSheet(false); setPalette(false);
    setNotif(false); setQuick(false); setUserMenu(false);
    // Track recently visited for Continue Working section
    pushRecent(id);
    // Notify WorkspaceHome (same-origin storage event only fires in OTHER tabs; use custom event)
    window.dispatchEvent(new CustomEvent('ock_recent_changed'));
    if (typeof window !== 'undefined') {
      const url = action ? `?tab=${id}&action=${action}` : `?tab=${id}`;
      window.history.pushState(null, '', url);
    }
  }, []);

  const logout = () => { ['admin_token','admin_role','admin_restaurant_id','admin_permissions'].forEach(k => localStorage.removeItem(k)); window.location.reload(); };

  const NOTIFS = [
    { icon:'🛍️', color:'#2563EB', text:'New order #ORD-2451 received',         time:'2 min ago',  unread:true },
    { icon:'🏪', color:'#16A34A', text:'Downtown Branch opened',                time:'15 min ago', unread:true },
    { icon:'⚠️', color:'#EA580C', text:'Low stock alert: 3 items',              time:'1 hr ago',   unread:true },
    { icon:'👤', color:'#7C3AED', text:'New customer: Ramesh Kumar',            time:'2 hr ago',   unread:false },
    { icon:'💳', color:'#059669', text:'Payout of ₹45,000 processed',          time:'3 hr ago',   unread:false },
    { icon:'⭐', color:'#D97706', text:'New 5-star review received',            time:'5 hr ago',   unread:false },
    { icon:'🎫', color:'#DC2626', text:'Support ticket #1234 escalated',        time:'6 hr ago',   unread:false },
    { icon:'📊', color:'#0891B2', text:'Monthly revenue report ready',          time:'Yesterday',  unread:false },
  ];
  const unread = NOTIFS.filter(n => n.unread).length;

  const QUICK_ACTIONS = [
    { id:'orders',     label:'New Order',    icon:'🛍️', action: 'new' },
    { id:'users',      label:'New Customer', icon:'👤', action: 'new' },
    { id:'branches',   label:'New Branch',   icon:'🏪', action: 'new' },
    { id:'menus',      label:'New Menu',     icon:'📋', action: 'new' },
    { id:'hrms',       label:'New Employee', icon:'👔', action: 'new' },
    { id:'offers',     label:'New Offer',    icon:'🎁', action: 'new' },
    { id:'blogs',      label:'New Blog',     icon:'📝', action: 'new' },
    { id:'tasks',      label:'New Task',     icon:'✅', action: 'new' },
  ];

  return (
    <div className={`${styles.shell} ${dark ? styles.darkMode : ''}`}>
      {/* ── Command Palette ── */}
      {palette && <CommandPalette onNav={nav} onClose={() => setPalette(false)} />}

      {/* ══════════════════════════════════════════════
          HEADER  (sticky, full-width) — exact design match
      ══════════════════════════════════════════════ */}
      <header className={styles.header}>
        {/* LEFT: Logo image ONLY — no text (matches reference design) */}
        <div className={styles.hLogo} onClick={() => nav('home')} onKeyDown={e => e.key === 'Enter' && nav('home')} role="button" tabIndex={0} aria-label="Go to workspace home">
          <img src="/branding/transparent-logo.png" alt="One Choice Kitchen" className={styles.hLogoImg}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>

        {/* CENTER: Search trigger */}
        <div className={styles.hSearchWrap}>
          <div className={styles.hSearch} onClick={() => setPalette(true)} role="button" tabIndex={0} aria-label="Search (Ctrl+K)">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={styles.hSearchIco}>
              <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.hSearchPh}>Search for modules, restaurants, orders, customers, employees…</span>
            <kbd className={styles.hSearchKbd}>Ctrl + K</kbd>
          </div>
        </div>

        {/* RIGHT: Bell • Quick Create • User */}
        <div className={styles.hRight}>
          {/* Bell icon with red badge */}
          <div ref={notifRef} className={`${styles.hBtn} ${styles.hNotifBtn}`} onClick={() => { setNotif(v => !v); setQuick(false); setUserMenu(false); }} aria-label="Notifications">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
            {notif && (
              <div className={styles.notifPanel} onClick={e => e.stopPropagation()}>
                <div className={styles.notifHead}>
                  <span className={styles.notifTitle}>Notifications</span>
                  <span className={styles.notifMark}>Mark all read</span>
                </div>
                <div className={styles.notifBody}>
                  {NOTIFS.map((n, i) => (
                    <div key={i} className={`${styles.notifRow} ${n.unread ? styles.notifUnread : ''}`}>
                      <div className={styles.notifRowIco} style={{ background: n.color + '1A', color: n.color }}>{n.icon}</div>
                      <div className={styles.notifRowTxt}>
                        <div className={styles.notifRowMsg}>{n.text}</div>
                        <div className={styles.notifRowTime}>{n.time}</div>
                      </div>
                      {n.unread && <div className={styles.notifDot} style={{ background: n.color }}/>}
                    </div>
                  ))}
                </div>
                <div className={styles.notifFoot}>
                  <button className={styles.notifViewAll} onClick={() => nav('audit_logs')}>View All Notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Create — blue circle + label */}
          <div ref={quickRef} className={styles.quickWrap}>
            <button className={styles.quickBtn} onClick={() => { setQuick(v => !v); setNotif(false); setUserMenu(false); }}>
              <span className={styles.quickBtnCircle}>
                <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/></svg>
              </span>
              <span className={styles.quickBtnLabel}>Quick Create</span>
            </button>
            {quick && (
              <div className={styles.quickPanel} onClick={e => e.stopPropagation()}>
                <div className={styles.quickPanelTitle}>Quick Create</div>
                {QUICK_ACTIONS.map(qa => (
                  <div key={qa.id} className={styles.quickItem} onClick={() => { nav(qa.id, qa.action); setQuick(false); }}>
                    <span className={styles.quickItemIco}>{qa.icon}</span><span>{qa.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User — dark avatar circle + Administrator / SUPER ADMIN text + chevron */}
          <div ref={userRef} className={styles.hUser} onClick={() => { setUserMenu(v => !v); setNotif(false); setQuick(false); }}>
            <div className={styles.hAvatar}>AD</div>
            <div className={styles.hUserInfo}>
              <span className={styles.hUserName}>Administrator</span>
              <span className={styles.hUserRole}>SUPER ADMIN</span>
            </div>
            <svg className={`${styles.hChev} ${userMenu ? styles.hChevOpen : ''}`} width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
            {userMenu && (
              <div className={styles.userPanel} onClick={e => e.stopPropagation()}>
                <div className={styles.userPanelTop}>
                  <div className={styles.userPanelAv}>A</div>
                  <div>
                    <div className={styles.userPanelName}>Administrator</div>
                    <div className={styles.userPanelRole}>Super Admin</div>
                  </div>
                </div>
                <div className={styles.uDivider}/>
                {[
                  { icon: <User           size={16} strokeWidth={2}/>, label:'My Profile',           tab:'my_profile' },
                  { icon: <SlidersHorizontal size={16} strokeWidth={2}/>, label:'Preferences',        tab:'preferences' },
                  { icon: <History        size={16} strokeWidth={2}/>, label:'Activity Log',         tab:'audit_logs' },
                  { icon: <Bell           size={16} strokeWidth={2}/>, label:'Notification Settings', tab:'templates' },
                  { icon: <Store          size={16} strokeWidth={2}/>, label:'Switch Restaurant',    tab:'branches' },
                ].map(m => (
                  <div key={m.label} className={styles.uItem} onClick={() => { nav(m.tab); setUserMenu(false); }}>
                    <span className={styles.uItemIco}>{m.icon}</span><span>{m.label}</span>
                  </div>
                ))}
                <div className={styles.uDivider}/>
                <div className={styles.uItem}><span className={styles.uItemIco}><Keyboard size={16} strokeWidth={2}/></span><span>Keyboard Shortcuts</span></div>
                <div className={styles.uItemToggle}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.5rem' }}><span className={styles.uItemIco}><Moon size={16} strokeWidth={2}/></span><span>Dark Mode</span></div>
                  <div className={`${styles.toggle} ${dark ? styles.toggleOn : ''}`} onClick={e => { e.stopPropagation(); setDark(d => !d); }}>
                    <div className={styles.toggleThumb}/>
                  </div>
                </div>
                <div className={styles.uDivider}/>
                <div className={`${styles.uItem} ${styles.uLogout}`} onClick={logout}>
                  <span className={styles.uItemIco}><LogOut size={16} strokeWidth={2}/></span><span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════ */}
      <main className={styles.main}>
        {tab === 'home' ? (
          <WorkspaceHome onNav={nav} />
        ) : (
          <Suspense fallback={<SkeletonPage />}>
            <ModulePage tabId={tab} onHome={() => nav('home')} onNav={nav}>
              {renderModule(tab, nav)}
            </ModulePage>
          </Suspense>
        )}
        {/* FOOTER - moved outside main for proper bottom placement */}
      </main>

      <footer className={styles.footer}>
          <div className={styles.footerL}>
            <span>© 2026 One Choice Kitchen. All rights reserved.</span>
            <span className={styles.fSep}>|</span>
            <span>Version 3.2.1</span>
            <span className={styles.fSep}>|</span>
            <span className={styles.fStatus}><span className={styles.fDot}/> All Systems Operational</span>
          </div>
          <div className={styles.footerR}>
            {([
              { label: 'Privacy Policy',  id: 'privacy_policy'    },
              { label: 'Terms of Service', id: 'terms_of_service'  },
              { label: 'Support',          id: 'support_center'    },
              { label: 'API Docs',         id: 'api_documentation' },
            ] as const).map(l => (
              <button key={l.id} onClick={() => nav(l.id)} className={styles.fLink}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                {l.label}
              </button>
            ))}
            <div className={styles.socials}>
              <a href="#" className={styles.socialBtn} style={{ background:'#1877F2' }} title="Facebook" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className={styles.socialBtn} style={{ background:'linear-gradient(135deg,#f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }} title="Instagram" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className={styles.socialBtn} style={{ background:'#0A66C2' }} title="LinkedIn" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className={styles.socialBtn} style={{ background:'#FF0000' }} title="YouTube" aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>
        </footer>


      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM NAV
      ══════════════════════════════════════════════ */}
      <nav className={styles.mobileNav} aria-label="Mobile navigation">
        <div className={`${styles.mNavItem} ${tab === 'home' ? styles.mNavActive : ''}`} onClick={() => nav('home')}>
          <span>🏠</span><span>Home</span>
        </div>
        <div className={styles.mNavItem} onClick={() => setPalette(true)}>
          <span>🔍</span><span>Search</span>
        </div>
        <div className={`${styles.mNavItem} ${notif ? styles.mNavActive : ''}`} onClick={() => setNotif(v => !v)}>
          <span style={{ position:'relative', display:'inline-block' }}>
            🔔{unread > 0 && <span style={{ position:'absolute', top:-4, right:-4, background:'#2563EB', color:'#fff', fontSize:9, borderRadius:'50%', width:14, height:14, display:'flex', alignItems:'center', justifyContent:'center' }}>{unread}</span>}
          </span>
          <span>Notifs</span>
        </div>
        <div className={`${styles.mNavItem} ${tab === 'orders' ? styles.mNavActive : ''}`} onClick={() => nav('orders')}>
          <span>🛍️</span><span>Orders</span>
        </div>
        <div className={`${styles.mNavItem} ${mobileSheet ? styles.mNavActive : ''}`} onClick={() => setMobileSheet(v => !v)}>
          <span>☰</span><span>Menu</span>
        </div>
      </nav>

      {/* Mobile bottom sheet */}
      {mobileSheet && (
        <div className={styles.sheetOverlay} onClick={() => setMobileSheet(false)}>
          <div className={styles.sheetDrawer} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHandle}/>
            <div className={styles.sheetBody}>
              {WORKSPACE.map(cat => (
                <div key={cat.id} className={styles.sheetCat}>
                  <div className={styles.sheetCatTitle} style={{ color: cat.color }}>
                    <span className={styles.sheetCatIcon}>{WS_ICONS[cat.id] || cat.icon}</span>
                    {cat.label}
                  </div>
                  {cat.items.map((item, ii) => (
                    <div key={ii} className={styles.sheetItem} onClick={() => { nav(item.id); setMobileSheet(false); }}>
                      <span className={styles.sheetItemIcon} style={{ color: cat.color }}>
                        {ITEM_ICONS_SM[item.id] || <span style={{fontSize:'0.7rem'}}>›</span>}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => { if (localStorage.getItem('admin_token')) setLoggedIn(true); }, []);
  return (
    <ModalProvider>
      {!loggedIn
        ? <LoginScreen onLogin={() => setLoggedIn(true)} />
        : <><GlobalMetadataInjector portalName="Admin Panel" /><MainApp /></>}
    </ModalProvider>
  );
}
