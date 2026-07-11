import { useState, useEffect } from 'react';
import styles from './DownloadPage.module.css';

// ── Shared localStorage key (same as admin portal) ─────────────────────────
const APP_LINKS_KEY = 'ock_app_store_links';
const DEFAULT_LINKS = {
  customer_play:  'https://play.google.com/store/apps/details?id=com.onechoicekitchen',
  customer_store: 'https://apps.apple.com/in/app/onechoicekitchen',
  partner_play:   'https://play.google.com/store/apps/details?id=com.onechoicekitchen.partner',
  partner_store:  'https://apps.apple.com/in/app/onechoicekitchen-partner',
  rider_play:     'https://play.google.com/store/apps/details?id=com.onechoicekitchen.rider',
  rider_store:    'https://apps.apple.com/in/app/onechoicekitchen-rider',
};
function loadLinks() {
  try { const r = localStorage.getItem(APP_LINKS_KEY); if (r) return { ...DEFAULT_LINKS, ...JSON.parse(r) }; } catch { /**/ }
  return { ...DEFAULT_LINKS };
}

// ── The 3 apps available for download on Partner Portal (NO Admin App) ──────
function buildApps() {
  const links = loadLinks();
  return [
    {
      id: 'customer',
      name: 'Customer App',
      icon: '🛒',
      color: '#2563EB',
      bg: '#EFF6FF',
      description: 'Order food, track delivery, earn rewards — for your customers.',
      googlePlay: links.customer_play,
      appStore: links.customer_store,
      version: 'v2.5.0',
      platform: 'Android & iOS',
      forWho: 'For Customers',
      features: [
        'Browse menus from 200+ restaurants',
        'Subscribe to daily tiffin plans',
        'Real-time delivery tracking',
        'Loyalty rewards & OCK Points',
        'Secure UPI / Card / COD payments',
        'Table reservations',
      ],
    },
    {
      id: 'partner',
      name: 'Partner App',
      icon: '🍽️',
      color: '#16A34A',
      bg: '#F0FDF4',
      description: 'Manage orders, menu, inventory, and earnings from your mobile device.',
      googlePlay: links.partner_play,
      appStore: links.partner_store,
      version: 'v2.3.0',
      platform: 'Android & iOS',
      forWho: 'For Restaurant Partners',
      features: [
        'Accept and manage orders in real-time',
        'Update menu items and prices',
        'Track inventory and stock alerts',
        'View earnings and payout status',
        'Manage multiple branches',
        'Staff and shift management',
      ],
    },
    {
      id: 'rider',
      name: 'Rider App',
      icon: '🛵',
      color: '#EA580C',
      bg: '#FFF7ED',
      description: 'Accept deliveries, navigate to customers, and track earnings.',
      googlePlay: links.rider_play,
      appStore: links.rider_store,
      version: 'v2.2.0',
      platform: 'Android & iOS',
      forWho: 'For Delivery Riders',
      features: [
        'Accept delivery assignments',
        'Turn-by-turn GPS navigation',
        'Real-time earnings tracker',
        'Order status updates for customers',
        'Route optimization',
        'Performance dashboard',
      ],
    },
  ];
}

const FAQS = [
  {
    q: 'Which app should I use to manage my restaurant?',
    a: 'Install the Partner App. It gives you full control over your restaurant menu, incoming orders, inventory, staff, and earnings directly from your phone.',
  },
  {
    q: 'Can my delivery staff use a separate app?',
    a: 'Yes! Your delivery riders should install the Rider App. It provides GPS navigation, delivery assignment management, and earnings tracking.',
  },
  {
    q: 'Should I recommend the Customer App to my customers?',
    a: 'Absolutely! Share the Customer App download link with your customers so they can order directly from your restaurant, earn loyalty points, and subscribe to tiffin plans.',
  },
  {
    q: 'Is there a desktop version of the Partner App?',
    a: 'Yes, the Partner Portal (this website) is the full-featured desktop version. The Partner App is the mobile companion for on-the-go management.',
  },
];

export function DownloadPage() {
  const [apps, setApps] = useState(buildApps);
  useEffect(() => {
    const handler = () => setApps(buildApps());
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className={styles.page}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroBadge}><span role="img" aria-label="mobile phone">📱</span> Download Our Apps</div>
        <h1 className={styles.heroTitle}>OneChoiceKitchen Mobile Apps</h1>
        <p className={styles.heroSubtitle}>
          Everything runs smoother with the right app. Download the app for your role — or share
          the customer app link with your diners.
        </p>

      </div>

      {/* ── App Cards ──────────────────────────────────────────────────── */}
      <div className={styles.appsGrid}>
        {apps.map((app) => (
          <div key={app.id} className={styles.appCard} style={{ borderTopColor: app.color }}>
            <div className={styles.cardTop}>
              <div className={styles.cardIcon} style={{ background: app.bg, color: app.color }}>
                {app.icon}
              </div>
              <div>
                <div className={styles.cardForWho} style={{ color: app.color }}>{app.forWho}</div>
                <h2 className={styles.cardName}>{app.name}</h2>
                <div className={styles.cardVersion}>Version {app.version} · {app.platform}</div>
              </div>
            </div>

            <p className={styles.cardDesc}>{app.description}</p>

            <ul className={styles.featureList}>
              {app.features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span style={{ color: app.color }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <div className={styles.cardActions}>
              <a
                href={app.googlePlay}
                className={styles.storeBtn}
                style={{ borderColor: app.color, color: app.color }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>▶</span> Google Play
              </a>
              <a
                href={app.appStore}
                className={styles.storeBtn}
                style={{ borderColor: app.color, color: app.color }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span></span> App Store
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Links ─────────────────────────────────────────────── */}
      <div className={styles.quickSection}>
        <h2 className={styles.quickTitle}>Quick Download Links</h2>
        <div className={styles.quickTable}>
          {apps.map((app) => (
            <div key={app.id} className={styles.quickRow}>
              <div className={styles.quickApp}>
                <span className={styles.quickIcon}>{app.icon}</span>
                <div>
                  <div className={styles.quickName}>{app.name}</div>
                  <div className={styles.quickVersion}>{app.version}</div>
                </div>
              </div>
              <div className={styles.quickLinks}>
                <a href={app.googlePlay} className={styles.quickLink} target="_blank" rel="noopener noreferrer">Google Play →</a>
                <a href={app.appStore} className={styles.quickLink} target="_blank" rel="noopener noreferrer">App Store →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
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
