import React from 'react';
import { WORKSPACE } from '../app';

interface CategoryPageProps {
  catId: string;
  onNav: (id: string) => void;
}

// Module emoji icons per item
const MODULE_ICONS: Record<string, string> = {
  branches: '🏪', menus: '📋', tiffin: '🍱', inventory: '📦',
  tables: '🪑', reservations: '📅', waitlist: '⏳',
  orders: '🛍️', refunds: '↩️', corporate: '🏢', delivery_settings: '🚚',
  users: '👥', reviews: '⭐', referrals: '🎁', support: '🎫',
  offers: '🏷️', rewards: '🏆', coupons: '🎟️', blogs: '📝',
  pages: '🌐', sliders: '🖼️', comments: '💬', seo: '🔍',
  payouts: '💸', payment_config: '💳', subscription_plans: '📊', surge_pricing: '📈',
  hrms: '👔', attendance: '🕐', leaves: '🌿', payroll: '💰',
  tasks: '✅', compliance: '📜', audit_logs: '🗒️', roles: '🔐', partner_permissions: '🤝',
  settings: '⚙️', email_config: '📧', sms_config: '📱', whatsapp_config: '💬',
  config_dashboard: '🛡️', sla_config: '📐', maps_config: '🗺️', service_providers: '🔌',
  hr_helpdesk: '🎧', templates: '📢', notification_logs: '🔔',
  overall_dashboard: '📊', dashboard: '📈', finance_dashboard: '💹',
  marketing_dashboard: '🎯', branch_dashboard: '🏪', menu_dashboard: '📋',
  mess_dashboard: '🍱', hrms_dash: '👔', system_dashboard: '🖥️',
  internal_chat: '💬', ai_chat: '🤖',
  app_downloads: '📲', app_links_settings: '🔗',
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  branches: 'Create and manage restaurant branches, set operating hours, configure delivery zones, and update location details for each outlet.',
  menus: 'Build and organize your menu with categories, items, pricing, modifiers, and availability schedules. Includes menu builder tools.',
  tiffin: 'Manage subscription-based tiffin meal plans, delivery schedules, customer subscriptions, and tiffin-specific inventory.',
  inventory: 'Track raw material stock levels, set reorder alerts, manage suppliers, and prevent stockouts with real-time inventory insights.',
  tables: 'Configure your dining floor layout, manage table capacity, assign sections, and view real-time table occupancy status.',
  reservations: 'Handle pre-booked dining reservations, manage time slots, send confirmation notifications, and track reservation history.',
  waitlist: 'Manage walk-in guest queues digitally. Add guests, estimate wait times, and notify customers when their table is ready.',
  orders: 'View and manage all incoming orders across delivery, dine-in, and takeaway channels. Track status, assign riders, and handle exceptions.',
  refunds: 'Process customer refund requests, track refund status, manage return policies, and reconcile refunded amounts with payment providers.',
  corporate: 'Manage bulk corporate meal orders, subscription plans for companies, invoicing, and corporate account management.',
  delivery_settings: 'Configure delivery zones, calculate delivery fees based on distance, manage delivery time slots and surge pricing rules.',
  users: 'View all registered customer profiles, purchase history, loyalty points balance, and manage account status or restrictions.',
  reviews: 'Moderate customer ratings and reviews across all branches. Respond to feedback, flag inappropriate content, and track trends.',
  referrals: 'Manage the customer referral program, track referral codes, monitor conversion rates, and adjust referral bonus amounts.',
  support: 'Handle incoming customer support tickets, assign to agents, track resolution times, and manage escalation workflows.',
  offers: 'Create discount offers, flash sales, percentage-off deals, and combo promotions. Set validity periods and target customer segments.',
  rewards: 'Manage the OCK loyalty rewards store where customers redeem points for gifts, discounts, or exclusive benefits.',
  coupons: 'Generate and manage promotional coupon codes with usage limits, validity windows, and customer segment targeting.',
  blogs: 'Write and publish blog content to drive SEO traffic. Manage categories, authors, tags, and publication schedules.',
  pages: 'Create and manage static content pages like About Us, FAQs, Contact, and legal pages with rich text editing.',
  sliders: 'Manage homepage banners and promotional sliders across customer-facing portals. Upload images and set click-through links.',
  comments: 'Moderate user comments on blogs and public pages. Approve, reject, or reply to comments and manage spam filters.',
  seo: 'Configure SEO metadata (title, description, robots), manage sitemaps, and track search performance for all public pages.',
  payouts: 'Process and track vendor and restaurant partner payouts, view payout history, and configure payout schedules.',
  payment_config: 'Configure payment gateways (Razorpay, Stripe), set up webhook endpoints, manage API keys, and test payment flows.',
  subscription_plans: 'Create and manage customer subscription plans, pricing tiers, benefits, and auto-renewal settings.',
  surge_pricing: 'Configure dynamic pricing rules based on demand, time of day, or location to optimize revenue during peak hours.',
  hrms: 'Manage your entire workforce — add employees, view profiles, track performance, and maintain staff records.',
  attendance: 'Track employee attendance, manage clock-in/clock-out records, generate timesheets, and monitor punctuality.',
  leaves: 'Handle employee leave applications, set leave quotas, approve or reject requests, and track leave balances.',
  payroll: 'Process monthly payroll, configure salary structures, generate payslips, and manage statutory deductions.',
  tasks: 'Create and assign tasks to team members, set deadlines, track progress, and get notified on completion.',
  compliance: 'Manage regulatory compliance documents, track license renewals, FSSAI certificates, and health inspection records.',
  audit_logs: 'View a complete trail of all admin actions — who did what, when, from which IP. Essential for security audits.',
  roles: 'Define custom roles with granular permissions. Control exactly which modules and actions each admin role can access.',
  partner_permissions: 'Control which modules and features restaurant partners can access in the Partner Portal.',
  settings: 'Configure core platform settings: timezone, currency, language, order modes, and business-wide preferences.',
  email_config: 'Configure SMTP settings, email templates, sender identity, and test email delivery for transactional notifications.',
  sms_config: 'Set up SMS providers (MSG91, Twilio), configure sender IDs, manage SMS templates, and track delivery reports.',
  whatsapp_config: 'Configure WhatsApp Business API integration for order notifications, OTP delivery, and customer communication.',
  config_dashboard: 'Overview of all system configuration states, integration health, API connection statuses, and third-party service uptime.',
  sla_config: 'Define Service Level Agreements for order fulfillment, support response times, and delivery commitments by zone.',
  maps_config: 'Configure Google Maps API, set geocoding parameters, manage delivery zone boundaries, and rider tracking settings.',
  service_providers: 'Manage third-party service provider integrations — payment, logistics, SMS, email, push notifications, and analytics.',
  hr_helpdesk: 'Internal IT and HR support ticketing system for employees to raise requests, report issues, and get assistance.',
  templates: 'Manage push notification, email, and SMS announcement templates. Send broadcast messages to customers or staff.',
  notification_logs: 'View a full history of all sent notifications — push, SMS, email, and WhatsApp — with delivery status tracking.',
  overall_dashboard: "Bird's-eye view of your entire business — revenue, orders, customers, and key performance indicators at a glance.",
  dashboard: "Core operational dashboard with today's orders, active riders, branch performance, and real-time activity feed.",
  finance_dashboard: 'Detailed financial analytics — revenue trends, gross margin, payout summaries, refund rates, and P&L overview.',
  marketing_dashboard: 'Campaign performance, offer conversion rates, coupon usage analytics, referral funnel, and customer acquisition metrics.',
  branch_dashboard: 'Per-branch performance comparison — orders, revenue, ratings, staff count, and operational efficiency metrics.',
  menu_dashboard: 'Menu item performance analytics — best sellers, slow movers, category breakdowns, and pricing optimization insights.',
  mess_dashboard: 'Tiffin subscription analytics — active subscribers, delivery completion rates, retention, and revenue trends.',
  hrms_dash: 'HR analytics dashboard — headcount, attrition, attendance rates, leave utilization, and payroll summary.',
  system_dashboard: 'Infrastructure and system health monitoring — API response times, error rates, queue lengths, and server metrics.',
  internal_chat: 'Real-time team messaging for staff and managers. Create channels, direct messages, and share files securely.',
  ai_chat: 'Configure AI chatbot for customer support — set up providers, train on your menu/policies, and monitor conversations.',
  app_downloads: 'View and manage download links for all four mobile apps — Customer, Partner, Rider, and Admin apps.',
  app_links_settings: 'Update Play Store and App Store URLs for all mobile apps. Control which links appear in each customer-facing portal.',
};

export function CategoryPage({ catId, onNav }: CategoryPageProps) {
  const cat = WORKSPACE.find(c => c.id === catId);

  if (!cat) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <span style={{ fontSize: '3rem' }}>😕</span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>Category Not Found</h2>
        <button
          onClick={() => onNav('home')}
          style={{ padding: '0.6rem 1.25rem', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}
        >
          Back to Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '100%' }}>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title-block">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: cat.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', flexShrink: 0,
              boxShadow: `0 4px 16px ${cat.color}40`,
            }}>
              {cat.icon}
            </div>
            <div>
              <h1 className="page-title">{cat.label}</h1>
              <p className="page-subtitle">{cat.description}</p>
            </div>
          </div>
        </div>
        <div className="page-actions">
          <button
            onClick={() => onNav('home')}
            className="btn"
            style={{ background: 'var(--bg)', color: 'var(--text2)', border: '1px solid var(--bdr)' }}
          >
            ← Workspace Home
          </button>
        </div>
      </div>

      {/* ── Stats Bar ───────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        background: 'var(--surf)', border: '1px solid var(--bdr)',
        borderRadius: '10px', padding: '0.875rem 1.25rem',
        marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 500 }}>
            <strong style={{ color: 'var(--text)' }}>{cat.items.length}</strong> modules in this category
          </span>
        </div>
        <div style={{ width: 1, height: 18, background: 'var(--bdr)', flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
          Click any card to open the module
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            padding: '0.25rem 0.75rem', borderRadius: 999,
            background: cat.bg || '#f0f9ff', color: cat.color,
            fontSize: '0.75rem', fontWeight: 700,
          }}>
            {cat.label}
          </span>
        </div>
      </div>

      {/* ── Module Cards Grid ───────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {cat.items.map((item) => {
          const icon = MODULE_ICONS[item.id] || '📋';
          const description = MODULE_DESCRIPTIONS[item.id] || item.desc;

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              onKeyDown={e => e.key === 'Enter' && onNav(item.id)}
              style={{
                background: 'var(--surf)',
                border: '1px solid var(--bdr)',
                borderRadius: '12px',
                padding: '1.25rem',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                width: '100%',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.boxShadow = `0 8px 24px ${cat.color}20, 0 2px 8px rgba(0,0,0,.06)`;
                el.style.borderColor = cat.color + '60';
                el.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.boxShadow = 'none';
                el.style.borderColor = 'var(--bdr)';
                el.style.transform = 'translateY(0)';
              }}
              aria-label={`Open ${item.label}`}
            >
              {/* Card Top */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: cat.bg || '#f0f9ff',
                  color: cat.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: cat.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    {item.desc}
                  </div>
                </div>
                <span style={{ color: cat.color, fontSize: '1rem', flexShrink: 0, marginTop: '0.1rem', fontWeight: 700 }}>→</span>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.6, margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              } as React.CSSProperties}>
                {description}
              </p>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                fontSize: '0.73rem', fontWeight: 700, color: cat.color,
                marginTop: 'auto', paddingTop: '0.6rem',
                borderTop: '1px solid var(--bdr)',
              }}>
                Open {item.label} →
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Other Categories ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--surf)', border: '1px solid var(--bdr)',
        borderRadius: '12px', padding: '1.25rem 1.5rem',
      }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Browse Other Categories
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {WORKSPACE.filter(c => c.id !== catId).map(c => (
            <button
              key={c.id}
              onClick={() => onNav(`cat_${c.id}`)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.375rem 0.75rem', borderRadius: 999,
                background: c.bg || '#f0f9ff', color: c.color,
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
