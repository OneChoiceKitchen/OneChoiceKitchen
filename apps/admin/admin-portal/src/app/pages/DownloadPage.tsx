import React, { useState, useEffect } from 'react';
import styles from './DownloadPage.module.css';
import { loadAppLinks } from './AppLinksSettings';

// ── Dynamic app list — store links read from admin settings ────────────────
function buildApps() {
  const links = loadAppLinks();
  return [
    {
      id: 'customer',
      name: 'Customer App',
      subtitle: 'OneChoiceKitchen for Customers',
      icon: '🛒',
      color: '#2563EB',
      bg: '#EFF6FF',
      description: 'Order food, subscribe to tiffin plans, earn rewards, track delivery in real-time.',
      googlePlay: links.customer_play,
      appStore: links.customer_store,
      version: 'v2.5.0',
      features: [
        'Browse menus from 200+ restaurants',
        'Subscribe to daily tiffin plans',
        'Real-time delivery tracking on map',
        'Loyalty rewards & OCK Points',
        'Secure payments (UPI, Cards, COD)',
        'Table reservations & waitlist',
      ],
      audience: 'For Customers',
      platform: 'Android & iOS',
    },
    {
      id: 'partner',
      name: 'Partner App',
      subtitle: 'OneChoiceKitchen for Restaurant Partners',
      icon: '🍽️',
      color: '#16A34A',
      bg: '#F0FDF4',
      description: 'Manage your restaurant, menus, orders, inventory, and analytics from anywhere.',
      googlePlay: links.partner_play,
      appStore: links.partner_store,
      version: 'v2.3.0',
      features: [
        'Manage incoming orders in real-time',
        'Update menu items and pricing',
        'Track inventory and stock alerts',
        'View earnings and payout status',
        'Manage multiple branches',
        'Staff and shift management',
      ],
      audience: 'For Restaurant Partners',
      platform: 'Android & iOS',
    },
    {
      id: 'rider',
      name: 'Rider App',
      subtitle: 'OneChoiceKitchen for Delivery Riders',
      icon: '🛵',
      color: '#EA580C',
      bg: '#FFF7ED',
      description: 'Accept deliveries, navigate with GPS, track earnings, and manage your schedule.',
      googlePlay: links.rider_play,
      appStore: links.rider_store,
      version: 'v2.2.0',
      features: [
        'Accept and manage delivery assignments',
        'Turn-by-turn GPS navigation',
        'Real-time earnings tracker',
        'Order status updates for customers',
        'Route optimization for multiple orders',
        'Performance and rating dashboard',
      ],
      audience: 'For Delivery Riders',
      platform: 'Android & iOS',
    },
    {
      id: 'admin',
      name: 'Admin App',
      subtitle: 'OneChoiceKitchen Admin — Internal Only',
      icon: '🛡️',
      color: '#DC2626',
      bg: '#FEF2F2',
      description:
        'Internal admin dashboard app. Full operational control — orders, users, analytics, settings, HRMS, and more.',
      googlePlay: links.admin_play,
      appStore: links.admin_store,
      version: 'v2.5.0',
      features: [
        'Full admin dashboard on mobile',
        'Order management and monitoring',
        'User and partner management',
        'Financial reports and analytics',
        'HRMS — attendance, leaves, payroll',
        'System configuration and settings',
      ],
      audience: '🔒 Authorized Admins Only',
      platform: 'Android & iOS',
      restricted: true,
    },
  ];
}


const FAQS = [
  {
    q: 'Which app should restaurant partners install?',
    a: 'Restaurant partners should install the Partner App. It gives them full control over menus, orders, inventory, and earnings from their mobile device.',
  },
  {
    q: 'Is the Admin App available publicly on stores?',
    a: 'The Admin App is listed on stores but access is restricted. You need valid admin credentials to use it. It is not for customers or restaurant partners.',
  },
  {
    q: 'What is the difference between Partner App and Admin App?',
    a: 'The Partner App is for restaurant owners/managers to manage their specific restaurant. The Admin App is for internal OCK administrators and gives access to the entire platform across all restaurants.',
  },
  {
    q: 'How do I get admin credentials for the Admin App?',
    a: 'Admin credentials are issued by the OneChoiceKitchen platform team. Contact your system administrator or IT team to get your admin access.',
  },
];

export function DownloadPage({ onManageLinks }: { onManageLinks?: () => void } = {}) {
  const [apps, setApps] = useState(buildApps);
  const [activeApp, setActiveApp] = useState<string>('customer');

  // Reload links whenever admin saves new URLs (storage event)
  useEffect(() => {
    const handler = () => setApps(buildApps());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const selected = apps.find((a) => a.id === activeApp) || apps[0];

  return (
    <div className={styles.page}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerBadge}>
          <span>🛡️</span> Admin Portal — App Downloads
        </div>
        <h1 className={styles.title}>Download OneChoiceKitchen Apps</h1>
        <p className={styles.subtitle}>
          All apps in one place — Customer, Partner, Rider, and Admin. Select an app to view details
          and download links.
        </p>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className={styles.notice}>
            🔒 The Admin App is restricted to authorized administrators only.
          </div>
          {onManageLinks && (
            <button
              onClick={onManageLinks}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                background: '#0f172a', color: '#fff', border: 'none',
                borderRadius: '.5rem', padding: '.35rem 1rem', fontSize: '.8rem',
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              ⚙️ Manage Store Links
            </button>
          )}
        </div>
      </div>

      {/* ── App Tabs ──────────────────────────────────────────────────────── */}
      <div className={styles.appTabs}>
        {apps.map((app) => (

          <button
            key={app.id}
            className={`${styles.appTab} ${activeApp === app.id ? styles.appTabActive : ''}`}
            style={activeApp === app.id ? { borderColor: app.color, color: app.color, background: app.bg } : {}}
            onClick={() => setActiveApp(app.id)}
          >
            <span className={styles.tabIcon}>{app.icon}</span>
            <span className={styles.tabName}>{app.name}</span>
            {app.restricted && <span className={styles.tabBadge} style={{ background: app.color }}>Admin Only</span>}
          </button>
        ))}
      </div>

      {/* ── Selected App Detail ───────────────────────────────────────────── */}
      <div className={styles.detail} style={{ borderTopColor: selected.color }}>
        <div className={styles.detailHeader}>
          <div className={styles.detailIcon} style={{ background: selected.bg, color: selected.color }}>
            {selected.icon}
          </div>
          <div className={styles.detailInfo}>
            <div className={styles.detailAudience} style={{ color: selected.color }}>
              {selected.audience}
            </div>
            <h2 className={styles.detailName}>{selected.name}</h2>
            <p className={styles.detailSubtitle}>{selected.subtitle}</p>
            <p className={styles.detailDesc}>{selected.description}</p>
            <div className={styles.metaRow}>
              <span className={styles.metaChip}>📱 {selected.platform}</span>
              <span className={styles.metaChip}>🏷️ {selected.version}</span>
              {selected.restricted && (
                <span className={styles.metaChip} style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                  🔒 Restricted Access
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailBody}>
          {/* Features */}
          <div className={styles.detailSection}>
            <h3 className={styles.detailSectionTitle}>Key Features</h3>
            <ul className={styles.featureList}>
              {selected.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span style={{ color: selected.color }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Download Buttons */}
          <div className={styles.downloadSection}>
            <h3 className={styles.detailSectionTitle}>Download Links</h3>
            {selected.restricted && (
              <div className={styles.restrictedNotice}>
                ⚠️ This app requires authorized admin credentials. Do not share this link publicly.
              </div>
            )}
            <div className={styles.downloadButtons}>
              <a
                href={selected.googlePlay}
                className={styles.dlBtn}
                style={{ background: '#1a1a2e' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className={styles.dlBtnIcon} fill="currentColor">
                  <path d="M3.18 23.76c.3.17.65.19.97.05l12.44-7.19-2.9-2.9-10.51 10zM.44 1.64C.17 1.97.01 2.43.01 3.02v17.96c0 .59.16 1.05.43 1.38l.08.07 10.06-10.06v-.24L.52 1.57l-.08.07zM21.28 10.62l-2.88-1.66-3.24 3.24 3.24 3.24 2.9-1.68c.83-.48.83-1.66-.02-2.14zM4.15.24L16.6 7.43l-2.9 2.9L3.18.24c.3-.14.65-.12.97.0z" />
                </svg>
                <div>
                  <div style={{ fontSize: '.7rem', opacity: .7 }}>GET IT ON</div>
                  <div style={{ fontWeight: 700 }}>Google Play</div>
                </div>
              </a>
              <a
                href={selected.appStore}
                className={styles.dlBtn}
                style={{ background: '#1a1a2e' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" className={styles.dlBtnIcon} fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div style={{ fontSize: '.7rem', opacity: .7 }}>DOWNLOAD ON THE</div>
                  <div style={{ fontWeight: 700 }}>App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── All Apps Quick Grid ───────────────────────────────────────────── */}
      <div className={styles.allAppsSection}>
        <h2 className={styles.allAppsTitle}>All Apps — Quick Download</h2>
        <div className={styles.allAppsGrid}>
          {apps.map((app) => (
            <div key={app.id} className={styles.quickCard} style={{ borderTopColor: app.color }}>
              <div className={styles.quickIcon} style={{ background: app.bg }}>{app.icon}</div>
              <div className={styles.quickName}>{app.name}</div>
              <div className={styles.quickVersion}>{app.version}</div>
              {app.restricted && (
                <div className={styles.quickRestricted}>🔒 Admin Only</div>
              )}
              <div className={styles.quickLinks}>
                <a href={app.googlePlay} className={styles.quickLink} target="_blank" rel="noopener noreferrer">▶ Google Play</a>
                <a href={app.appStore} className={styles.quickLink} target="_blank" rel="noopener noreferrer"> App Store</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
        <div className={styles.faqList}>
          {FAQS.map((faq) => (
            <details key={faq.q} className={styles.faqItem}>
              <summary className={styles.faqQ}>{faq.q}</summary>
              <p className={styles.faqA}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DownloadPage;
