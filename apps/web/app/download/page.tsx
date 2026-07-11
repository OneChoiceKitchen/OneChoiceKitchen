import React from 'react';
import styles from './page.module.css';

export const metadata = {
  title: 'Download OneChoiceKitchen App | Order Food, Tiffin & More',
  description:
    'Download the OneChoiceKitchen app on Android or iOS. Order food, subscribe to tiffin plans, earn rewards, track delivery in real-time, and more.',
};

const FEATURES = [
  {
    icon: '🛵',
    title: 'Real-Time Delivery Tracking',
    desc: 'Track your rider on a live map from restaurant to your doorstep.',
  },
  {
    icon: '🍱',
    title: 'Tiffin & Meal Subscriptions',
    desc: 'Subscribe to daily home-cooked tiffin plans. Pause, resume, or switch meals anytime.',
  },
  {
    icon: '🎁',
    title: 'Loyalty Rewards & Offers',
    desc: 'Earn OCK Points on every order. Redeem for discounts, free meals, and exclusive deals.',
  },
  {
    icon: '📍',
    title: 'Multiple Delivery Addresses',
    desc: 'Save home, office, and more. Switch addresses in one tap.',
  },
  {
    icon: '💳',
    title: 'Secure Payments',
    desc: 'Pay via UPI, cards, wallets, or Cash on Delivery. 100% secure via Razorpay.',
  },
  {
    icon: '⭐',
    title: 'Reviews & Ratings',
    desc: 'Rate dishes, write reviews, and help the community discover the best food.',
  },
  {
    icon: '📅',
    title: 'Table Reservations',
    desc: 'Book a table at your favourite restaurant without calling.',
  },
  {
    icon: '🏢',
    title: 'Corporate Meal Plans',
    desc: 'Manage company lunch orders, bulk billing, and corporate accounts.',
  },
];

const SCREENSHOTS = [
  { label: 'Home & Explore', emoji: '🏠' },
  { label: 'Menu & Ordering', emoji: '🍽️' },
  { label: 'Live Tracking', emoji: '📍' },
  { label: 'Tiffin Plans', emoji: '🍱' },
  { label: 'Rewards', emoji: '🎁' },
  { label: 'Order History', emoji: '📋' },
];

const FAQS = [
  {
    q: 'Is OneChoiceKitchen available in my city?',
    a: 'We are currently operating in major Indian cities and expanding rapidly. Enter your address in the app to check availability in your area.',
  },
  {
    q: 'How do I subscribe to a tiffin plan?',
    a: 'Go to "Tiffin Plans" in the app, choose your preferred menu and duration (weekly, monthly), select your delivery time slot, and pay online. Meals are delivered fresh every day.',
  },
  {
    q: 'Can I cancel or modify my order after placing it?',
    a: 'Orders can be cancelled within 2 minutes of placement for a full refund. After the restaurant starts preparing, modifications are not possible.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, digital wallets, and Cash on Delivery (COD).',
  },
  {
    q: 'How do OCK Loyalty Points work?',
    a: 'Earn 1 OCK Point for every ₹10 spent. Redeem points on your next order (100 points = ₹10 discount). Points expire after 12 months.',
  },
  {
    q: 'Is the app free to download?',
    a: 'Yes, the app is completely free to download from Google Play Store and Apple App Store.',
  },
];

const REQUIREMENTS = [
  { platform: 'Android', icon: '🤖', version: 'Android 8.0 (Oreo) or later', storage: '50 MB free space', ram: '2 GB RAM recommended' },
  { platform: 'iOS', icon: '🍎', version: 'iOS 14.0 or later', storage: '60 MB free space', ram: 'iPhone 7 or newer' },
];

export default function DownloadPage() {
  return (
    <main className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>📱 Available on Android &amp; iOS</div>
          <h1 className={styles.heroTitle}>
            Order Food, Subscribe to Tiffin &amp;<br />
            <span className={styles.heroAccent}>Eat Better Every Day</span>
          </h1>
          <p className={styles.heroSubtitle}>
            OneChoiceKitchen brings restaurants, cloud kitchens, and home tiffin services to your
            fingertips. Real-time tracking, loyalty rewards, and seamless payments — all in one app.
          </p>

          <div className={styles.storeBadges}>
            <a
              href="https://play.google.com/store/apps/details?id=com.onechoicekitchen"
              className={styles.storeBadge}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on Google Play"
            >
              <svg viewBox="0 0 24 24" className={styles.storeIcon} fill="currentColor">
                <path d="M3.18 23.76c.3.17.65.19.97.05l12.44-7.19-2.9-2.9-10.51 10zM.44 1.64C.17 1.97.01 2.43.01 3.02v17.96c0 .59.16 1.05.43 1.38l.08.07 10.06-10.06v-.24L.52 1.57l-.08.07zM21.28 10.62l-2.88-1.66-3.24 3.24 3.24 3.24 2.9-1.68c.83-.48.83-1.66-.02-2.14zM4.15.24L16.6 7.43l-2.9 2.9L3.18.24c.3-.14.65-.12.97.0z" />
              </svg>
              <div className={styles.storeText}>
                <span className={styles.storeLabel}>GET IT ON</span>
                <span className={styles.storeName}>Google Play</span>
              </div>
            </a>

            <a
              href="https://apps.apple.com/in/app/onechoicekitchen"
              className={styles.storeBadge}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download on the App Store"
            >
              <svg viewBox="0 0 24 24" className={styles.storeIcon} fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className={styles.storeText}>
                <span className={styles.storeLabel}>DOWNLOAD ON THE</span>
                <span className={styles.storeName}>App Store</span>
              </div>
            </a>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>50K+</span><span className={styles.statLabel}>Happy Customers</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>200+</span><span className={styles.statLabel}>Restaurants</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><span className={styles.statNum}>4.8 ⭐</span><span className={styles.statLabel}>App Rating</span></div>
          </div>
        </div>

        <div className={styles.heroQr}>
          <div className={styles.qrBox}>
            <div className={styles.qrCode}>
              {/* QR code placeholder — replace with actual QR image */}
              <div className={styles.qrPlaceholder}>
                <span style={{ fontSize: '4rem' }}>📱</span>
                <p className={styles.qrText}>Scan to Download</p>
              </div>
            </div>
            <p className={styles.qrHint}>Point your camera at the QR code to download</p>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Everything You Need, In One App</h2>
          <p className={styles.sectionSubtitle}>
            From ordering your favourite biryani to subscribing to daily tiffin — OneChoiceKitchen
            handles it all.
          </p>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Screenshots ──────────────────────────────────────────────────── */}
      <section className={styles.sectionDark}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleLight}>See the App in Action</h2>
          <div className={styles.screenshotsGrid}>
            {SCREENSHOTS.map((s) => (
              <div key={s.label} className={styles.screenshotCard}>
                <div className={styles.screenshotMockup}>
                  <div className={styles.screenshotEmoji}>{s.emoji}</div>
                </div>
                <p className={styles.screenshotLabel}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── System Requirements ───────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>System Requirements</h2>
          <div className={styles.requirementsGrid}>
            {REQUIREMENTS.map((r) => (
              <div key={r.platform} className={styles.requirementCard}>
                <div className={styles.reqPlatform}>{r.icon} {r.platform}</div>
                <ul className={styles.reqList}>
                  <li>{r.version}</li>
                  <li>{r.storage}</li>
                  <li>{r.ram}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Installation Guide ────────────────────────────────────────────── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>How to Install</h2>
          <div className={styles.installGrid}>
            <div className={styles.installSteps}>
              <h3 className={styles.installPlatform}>🤖 Android</h3>
              <ol className={styles.stepsList}>
                <li>Open <strong>Google Play Store</strong> on your Android device</li>
                <li>Search for <strong>&quot;OneChoiceKitchen&quot;</strong></li>
                <li>Tap <strong>Install</strong> and wait for download</li>
                <li>Open the app, sign up or log in</li>
                <li>Allow location access for delivery tracking</li>
              </ol>
            </div>
            <div className={styles.installSteps}>
              <h3 className={styles.installPlatform}>🍎 iPhone / iPad</h3>
              <ol className={styles.stepsList}>
                <li>Open <strong>App Store</strong> on your iPhone or iPad</li>
                <li>Search for <strong>&quot;OneChoiceKitchen&quot;</strong></li>
                <li>Tap <strong>Get</strong> (use Face ID or Apple ID to confirm)</li>
                <li>Open the app, sign up or log in</li>
                <li>Allow notifications for order updates</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {FAQS.map((faq) => (
              <details key={faq.q} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>{faq.q}</summary>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Version Info ─────────────────────────────────────────────────── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitle}>Version Information</h2>
          <div className={styles.versionGrid}>
            <div className={styles.versionCard}>
              <div className={styles.versionPlatform}>🤖 Android</div>
              <div className={styles.versionNumber}>v2.5.0</div>
              <div className={styles.versionDate}>Released: July 2026</div>
              <ul className={styles.versionNotes}>
                <li>Real-time order tracking with live map</li>
                <li>Tiffin subscription pause/resume</li>
                <li>New loyalty points dashboard</li>
                <li>Performance improvements</li>
              </ul>
            </div>
            <div className={styles.versionCard}>
              <div className={styles.versionPlatform}>🍎 iOS</div>
              <div className={styles.versionNumber}>v2.5.0</div>
              <div className={styles.versionDate}>Released: July 2026</div>
              <ul className={styles.versionNotes}>
                <li>Real-time order tracking with live map</li>
                <li>Tiffin subscription pause/resume</li>
                <li>New loyalty points dashboard</li>
                <li>iOS 17 optimizations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Support ──────────────────────────────────────────────────────── */}
      <section className={styles.supportSection}>
        <div className={styles.sectionInner}>
          <h2 className={styles.sectionTitleLight}>Need Help?</h2>
          <p className={styles.supportSubtitle}>
            Our support team is available 24/7 to help you.
          </p>
          <div className={styles.supportGrid}>
            <div className={styles.supportCard}>
              <div className={styles.supportIcon}>📧</div>
              <div className={styles.supportTitle}>Email Support</div>
              <div className={styles.supportDetail}>support@onechoicekitchen.com</div>
            </div>
            <div className={styles.supportCard}>
              <div className={styles.supportIcon}>💬</div>
              <div className={styles.supportTitle}>In-App Chat</div>
              <div className={styles.supportDetail}>Available in the app 24/7</div>
            </div>
            <div className={styles.supportCard}>
              <div className={styles.supportIcon}>📞</div>
              <div className={styles.supportTitle}>Phone Support</div>
              <div className={styles.supportDetail}>+91 1800-XXX-XXXX (Toll Free)</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
