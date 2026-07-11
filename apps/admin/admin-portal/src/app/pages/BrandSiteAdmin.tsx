import { useState } from 'react';
import styles from '../app.module.css';

/* ─── Types ─────────────────────────────────────────────────────── */
interface SocialLink { platform: string; url: string; icon: string; }
interface BrandSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  appleTouchIconUrl: string;
}
interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
  robotsTxt: string;
  sitemapUrl: string;
  googleVerification: string;
  bingVerification: string;
}
interface SmoSettings {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
  twitterSite: string;
  twitterCreator: string;
  fbAppId: string;
}

const DEFAULT_BRAND: BrandSettings = {
  siteName: 'OneChoiceKitchen',
  tagline: 'All Your Cravings. One Kitchen.',
  logoUrl: '/assets/logo.png',
  darkLogoUrl: '/assets/logo-dark.png',
  faviconUrl: '/assets/favicon.ico',
  appleTouchIconUrl: '/assets/apple-touch-icon.png',
};
const DEFAULT_SEO: SeoSettings = {
  metaTitle: 'OneChoiceKitchen — Food Delivery Platform',
  metaDescription: 'Order food from hundreds of restaurants. Fast delivery, great prices.',
  metaKeywords: 'food delivery, restaurants, order online, India food',
  canonicalUrl: 'https://onechoicekitchen.com',
  robotsTxt: 'User-agent: *\nAllow: /',
  sitemapUrl: 'https://onechoicekitchen.com/sitemap.xml',
  googleVerification: '',
  bingVerification: '',
};
const DEFAULT_SMO: SmoSettings = {
  ogTitle: 'OneChoiceKitchen — Order Delicious Food Online',
  ogDescription: 'Discover restaurants near you and get food delivered in 30 minutes.',
  ogImage: 'https://onechoicekitchen.com/assets/og-image.jpg',
  twitterCard: 'summary_large_image',
  twitterSite: '@onechoicekitchen',
  twitterCreator: '@onechoicekitchen',
  fbAppId: '',
};
const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: 'Facebook',  url: 'https://facebook.com/onechoicekitchen',  icon: '📘' },
  { platform: 'Instagram', url: 'https://instagram.com/onechoicekitchen', icon: '📷' },
  { platform: 'Twitter',   url: 'https://twitter.com/onechoicekitchen',   icon: '🐦' },
  { platform: 'YouTube',   url: 'https://youtube.com/@onechoicekitchen',  icon: '📺' },
  { platform: 'LinkedIn',  url: 'https://linkedin.com/company/onechoicekitchen', icon: '💼' },
];

type Tab = 'brand' | 'seo' | 'smo' | 'social';

/* ─── Reusable field ─────────────────────────────────────────────── */
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)', marginBottom: '0.375rem' }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '0.3rem' }}>{hint}</p>}
    </div>
  );
}
function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '0.55rem 0.75rem',
        border: '1px solid var(--bdr)', borderRadius: 'var(--rd-sm)',
        background: 'var(--surf)', color: 'var(--text)', fontSize: '0.9rem',
        outline: 'none', transition: 'border-color .15s',
        boxSizing: 'border-box',
      }}
      onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
      onBlur={e => (e.target.style.borderColor = 'var(--bdr)')}
    />
  );
}
function Textarea({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      rows={rows} placeholder={placeholder}
      style={{
        width: '100%', padding: '0.55rem 0.75rem',
        border: '1px solid var(--bdr)', borderRadius: 'var(--rd-sm)',
        background: 'var(--surf)', color: 'var(--text)', fontSize: '0.9rem',
        outline: 'none', resize: 'vertical', fontFamily: 'inherit',
        transition: 'border-color .15s', boxSizing: 'border-box',
      }}
      onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
      onBlur={e => (e.target.style.borderColor = 'var(--bdr)')}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export default function BrandSiteAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('brand');
  const [brand, setBrand] = useState<BrandSettings>(DEFAULT_BRAND);
  const [seo, setSeo] = useState<SeoSettings>(DEFAULT_SEO);
  const [smo, setSmo] = useState<SmoSettings>(DEFAULT_SMO);
  const [socials, setSocials] = useState<SocialLink[]>(DEFAULT_SOCIALS);
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'brand',  label: 'Brand Identity', icon: '🎨' },
    { id: 'seo',    label: 'SEO Settings',   icon: '🔍' },
    { id: 'smo',    label: 'Social / SMO',   icon: '📣' },
    { id: 'social', label: 'Social Links',   icon: '🔗' },
  ];

  const updateSocial = (idx: number, field: keyof SocialLink, val: string) => {
    setSocials(s => s.map((l, i) => i === idx ? { ...l, [field]: val } : l));
  };
  const addSocial = () => setSocials(s => [...s, { platform: '', url: '', icon: '🌐' }]);
  const removeSocial = (idx: number) => setSocials(s => s.filter((_, i) => i !== idx));

  return (
    <div className={styles.modPage}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <span className={styles.bcSeg}>🏠 Home</span>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcSeg}>Platform Settings</span>
        <span className={styles.bcSep}>›</span>
        <span className={`${styles.bcSeg} ${styles.bcActive}`}>🎨 Brand &amp; Site Settings</span>
      </nav>

      <div className={styles.pageContainer}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageTitleBlock}>
            <h1 className={styles.pageTitle}>🎨 Brand &amp; Site Settings</h1>
            <p className={styles.pageSubtitle}>Manage your site logo, favicon, SEO, Open Graph / SMO, and footer social media links from one place.</p>
          </div>
          <div className={styles.pageActions}>
            {saved && (
              <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 'var(--rd-sm)', padding: '0.4rem 0.875rem', fontSize: '0.85rem', fontWeight: 600 }}>
                ✅ Settings Saved
              </span>
            )}
            <button className={styles.btnPrimary} onClick={save}>💾 Save Changes</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid var(--bdr)', marginBottom: '1.5rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                padding: '0.65rem 1.25rem', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                fontSize: '0.875rem', borderBottom: activeTab === t.id ? '2px solid var(--blue)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--blue)' : 'var(--text2)',
                marginBottom: '-2px', transition: 'color .15s',
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Brand Identity Tab ── */}
        {activeTab === 'brand' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>🏷️ Site Identity</h3>
              <Field label="Site Name" hint="Used in page titles and emails">
                <Input value={brand.siteName} onChange={v => setBrand(b => ({ ...b, siteName: v }))} placeholder="OneChoiceKitchen" />
              </Field>
              <Field label="Tagline" hint="Shown below logo on marketing pages">
                <Input value={brand.tagline} onChange={v => setBrand(b => ({ ...b, tagline: v }))} placeholder="All Your Cravings. One Kitchen." />
              </Field>
              <Field label="Canonical Site URL">
                <Input value={seo.canonicalUrl} onChange={v => setSeo(s => ({ ...s, canonicalUrl: v }))} placeholder="https://onechoicekitchen.com" type="url" />
              </Field>
            </div>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>🖼️ Logos &amp; Icons</h3>
              <Field label="Primary Logo URL (Light Mode)" hint="PNG/SVG, min 200×60px recommended">
                <Input value={brand.logoUrl} onChange={v => setBrand(b => ({ ...b, logoUrl: v }))} placeholder="/assets/logo.png" />
              </Field>
              <Field label="Dark Mode Logo URL">
                <Input value={brand.darkLogoUrl} onChange={v => setBrand(b => ({ ...b, darkLogoUrl: v }))} placeholder="/assets/logo-dark.png" />
              </Field>
              <Field label="Favicon URL (.ico or .png 32×32)" hint="Shown in browser tab">
                <Input value={brand.faviconUrl} onChange={v => setBrand(b => ({ ...b, faviconUrl: v }))} placeholder="/assets/favicon.ico" />
              </Field>
              <Field label="Apple Touch Icon URL (180×180px)" hint="iOS home screen icon">
                <Input value={brand.appleTouchIconUrl} onChange={v => setBrand(b => ({ ...b, appleTouchIconUrl: v }))} placeholder="/assets/apple-touch-icon.png" />
              </Field>
            </div>
          </div>
        )}

        {/* ── SEO Tab ── */}
        {activeTab === 'seo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>🔍 Meta Tags</h3>
              <Field label="Meta Title" hint={`${seo.metaTitle.length}/60 chars — keep under 60`}>
                <Input value={seo.metaTitle} onChange={v => setSeo(s => ({ ...s, metaTitle: v }))} placeholder="OneChoiceKitchen — Food Delivery" />
              </Field>
              <Field label="Meta Description" hint={`${seo.metaDescription.length}/160 chars — keep under 160`}>
                <Textarea value={seo.metaDescription} onChange={v => setSeo(s => ({ ...s, metaDescription: v }))} rows={3} />
              </Field>
              <Field label="Meta Keywords" hint="Comma-separated — less critical in modern SEO">
                <Input value={seo.metaKeywords} onChange={v => setSeo(s => ({ ...s, metaKeywords: v }))} />
              </Field>
              <Field label="Sitemap URL">
                <Input value={seo.sitemapUrl} onChange={v => setSeo(s => ({ ...s, sitemapUrl: v }))} type="url" />
              </Field>
            </div>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>🤖 Crawlers &amp; Verification</h3>
              <Field label="robots.txt Content" hint="Controls search engine crawling">
                <Textarea value={seo.robotsTxt} onChange={v => setSeo(s => ({ ...s, robotsTxt: v }))} rows={5} />
              </Field>
              <Field label="Google Search Console Verification Code">
                <Input value={seo.googleVerification} onChange={v => setSeo(s => ({ ...s, googleVerification: v }))} placeholder="google-site-verification=abc123..." />
              </Field>
              <Field label="Bing Webmaster Verification Code">
                <Input value={seo.bingVerification} onChange={v => setSeo(s => ({ ...s, bingVerification: v }))} placeholder="BingSiteAuth abc123..." />
              </Field>
            </div>
          </div>
        )}

        {/* ── SMO Tab ── */}
        {activeTab === 'smo' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>📣 Open Graph (Facebook / LinkedIn)</h3>
              <Field label="OG Title">
                <Input value={smo.ogTitle} onChange={v => setSmo(s => ({ ...s, ogTitle: v }))} />
              </Field>
              <Field label="OG Description" hint="Shown when your link is shared on social media">
                <Textarea value={smo.ogDescription} onChange={v => setSmo(s => ({ ...s, ogDescription: v }))} rows={3} />
              </Field>
              <Field label="OG Image URL" hint="Min 1200×630px for best display">
                <Input value={smo.ogImage} onChange={v => setSmo(s => ({ ...s, ogImage: v }))} type="url" />
              </Field>
              <Field label="Facebook App ID" hint="Optional — enables FB insights">
                <Input value={smo.fbAppId} onChange={v => setSmo(s => ({ ...s, fbAppId: v }))} placeholder="123456789" />
              </Field>
            </div>
            <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700 }}>🐦 Twitter Card</h3>
              <Field label="Twitter Card Type">
                <select value={smo.twitterCard} onChange={e => setSmo(s => ({ ...s, twitterCard: e.target.value as any }))}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-sm)', background: 'var(--surf)', color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="summary">Summary (Small Image)</option>
                </select>
              </Field>
              <Field label="Twitter @Site Handle">
                <Input value={smo.twitterSite} onChange={v => setSmo(s => ({ ...s, twitterSite: v }))} placeholder="@onechoicekitchen" />
              </Field>
              <Field label="Twitter @Creator Handle">
                <Input value={smo.twitterCreator} onChange={v => setSmo(s => ({ ...s, twitterCreator: v }))} placeholder="@onechoicekitchen" />
              </Field>
              {/* Preview */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-md)', padding: '0.875rem', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '0.375rem', fontWeight: 600 }}>PREVIEW</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{smo.ogTitle || 'Your Title Here'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)', marginTop: '0.25rem', lineHeight: 1.4 }}>{smo.ogDescription?.slice(0, 100) || 'Your description...'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '0.25rem' }}>{seo.canonicalUrl || 'onechoicekitchen.com'}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Social Links Tab ── */}
        {activeTab === 'social' && (
          <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 'var(--rd-lg)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>🔗 Footer Social Media Links</h3>
              <button className={styles.btnPrimary} onClick={addSocial} style={{ fontSize: '0.875rem', padding: '0.45rem 1rem' }}>+ Add Platform</button>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>
              These links appear in the website footer and other social link sections across your platform.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {socials.map((link, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5rem 1fr 1fr auto', gap: '0.75rem', alignItems: 'center', background: 'var(--bg)', borderRadius: 'var(--rd-sm)', padding: '0.75rem 1rem' }}>
                  <div style={{ fontSize: '1.5rem', textAlign: 'center' }}>{link.icon}</div>
                  <Input value={link.platform} onChange={v => updateSocial(i, 'platform', v)} placeholder="Platform name (e.g. Instagram)" />
                  <Input value={link.url} onChange={v => updateSocial(i, 'url', v)} placeholder="https://..." type="url" />
                  <button onClick={() => removeSocial(i)}
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 'var(--rd-sm)', padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    🗑️ Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
