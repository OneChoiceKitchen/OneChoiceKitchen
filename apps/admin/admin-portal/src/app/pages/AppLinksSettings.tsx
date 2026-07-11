import React, { useState, useEffect } from 'react';

// ── Shared key & defaults ──────────────────────────────────────────────────
export const APP_LINKS_KEY = 'ock_app_store_links';

export const DEFAULT_LINKS = {
  customer_play:  'https://play.google.com/store/apps/details?id=com.onechoicekitchen',
  customer_store: 'https://apps.apple.com/in/app/onechoicekitchen',
  partner_play:   'https://play.google.com/store/apps/details?id=com.onechoicekitchen.partner',
  partner_store:  'https://apps.apple.com/in/app/onechoicekitchen-partner',
  rider_play:     'https://play.google.com/store/apps/details?id=com.onechoicekitchen.rider',
  rider_store:    'https://apps.apple.com/in/app/onechoicekitchen-rider',
  admin_play:     'https://play.google.com/store/apps/details?id=com.onechoicekitchen.admin',
  admin_store:    'https://apps.apple.com/in/app/onechoicekitchen-admin',
};

export type AppLinks = typeof DEFAULT_LINKS;

export function loadAppLinks(): AppLinks {
  try {
    const raw = localStorage.getItem(APP_LINKS_KEY);
    if (raw) return { ...DEFAULT_LINKS, ...JSON.parse(raw) };
  } catch { /**/ }
  return { ...DEFAULT_LINKS };
}

// ── App metadata ─────────────────────────────────────────────────────────────
const APP_META = [
  {
    id: 'customer',
    name: 'Customer App',
    icon: '🛒',
    color: '#2563EB',
    bg: '#EFF6FF',
    borderColor: '#BFDBFE',
    audience: 'Customers',
    playKey: 'customer_play'  as keyof AppLinks,
    storeKey: 'customer_store' as keyof AppLinks,
    // Super-admin verification info
    sourceFolder:  'apps/web/',
    nxProject:     'web',
    buildOutput:   'dist/apps/web/',
    localDevUrl:   'http://localhost:4208',
    mobileFolder:  'apps/customer-mobile/',
    mobileNxProj:  'customer-mobile',
    mobileDevUrl:  'http://localhost:4210',
    packageId:     'com.onechoicekitchen',
  },
  {
    id: 'partner',
    name: 'Partner App',
    icon: '🍽️',
    color: '#16A34A',
    bg: '#F0FDF4',
    borderColor: '#BBF7D0',
    audience: 'Restaurant Partners',
    playKey: 'partner_play'  as keyof AppLinks,
    storeKey: 'partner_store' as keyof AppLinks,
    sourceFolder:  'apps/partner/partner-portal/',
    nxProject:     'partner',
    buildOutput:   'dist/apps/partner/partner-portal/',
    localDevUrl:   'http://localhost:4206',
    mobileFolder:  'apps/partner-mobile/ (planned)',
    mobileNxProj:  'partner-mobile (planned)',
    mobileDevUrl:  'http://localhost:4211',
    packageId:     'com.onechoicekitchen.partner',
  },
  {
    id: 'rider',
    name: 'Rider App',
    icon: '🛵',
    color: '#EA580C',
    bg: '#FFF7ED',
    borderColor: '#FED7AA',
    audience: 'Delivery Riders',
    playKey: 'rider_play'  as keyof AppLinks,
    storeKey: 'rider_store' as keyof AppLinks,
    sourceFolder:  'apps/rider/rider-portal/',
    nxProject:     'rider',
    buildOutput:   'dist/apps/rider/rider-portal/',
    localDevUrl:   'http://localhost:4207',
    mobileFolder:  'apps/rider-mobile/ (planned)',
    mobileNxProj:  'rider-mobile (planned)',
    mobileDevUrl:  'http://localhost:4212',
    packageId:     'com.onechoicekitchen.rider',
  },
  {
    id: 'admin',
    name: 'Admin App',
    icon: '🛡️',
    color: '#DC2626',
    bg: '#FEF2F2',
    borderColor: '#FECACA',
    audience: '🔒 Authorized Admins Only',
    playKey: 'admin_play'  as keyof AppLinks,
    storeKey: 'admin_store' as keyof AppLinks,
    sourceFolder:  'apps/admin/admin-portal/',
    nxProject:     'admin',
    buildOutput:   'dist/apps/admin/admin-portal/',
    localDevUrl:   'http://localhost:4205',
    mobileFolder:  'apps/customer-mobile/ (internal build)',
    mobileNxProj:  'customer-mobile',
    mobileDevUrl:  'http://localhost:4210',
    packageId:     'com.onechoicekitchen.admin',
    restricted: true,
  },
];

// ── Validate a URL ────────────────────────────────────────────────────────────
function isValidUrl(v: string) { return !v || /^https?:\/\/.+/.test(v.trim()); }

// ─────────────────────────────────────────────────────────────────────────────
export function AppLinksSettings() {
  const [links, setLinks] = useState<AppLinks>(loadAppLinks);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  useEffect(() => { setSaved(false); }, [links]);

  function handleSave() {
    const invalid = APP_META.find(app =>
      !isValidUrl(links[app.playKey]) || !isValidUrl(links[app.storeKey])
    );
    if (invalid) {
      setError(`Invalid URL for ${invalid.name}. Must start with https://`);
      return;
    }
    setError('');
    try {
      localStorage.setItem(APP_LINKS_KEY, JSON.stringify(links));
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch { setError('Failed to save. Storage may be full.'); }
  }

  function handleReset() {
    if (!confirm('Reset all store links to placeholder defaults?')) return;
    localStorage.removeItem(APP_LINKS_KEY);
    setLinks({ ...DEFAULT_LINKS });
  }

  function update(key: keyof AppLinks, val: string) {
    setLinks(prev => ({ ...prev, [key]: val }));
  }

  function isCustom(key: keyof AppLinks) {
    return links[key] && links[key] !== DEFAULT_LINKS[key];
  }

  return (
    <div className="page-container">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">📲 App Store Links</h1>
          <p className="page-subtitle">
            Configure Google Play &amp; Apple App Store URLs for all 4 apps.
            Links propagate instantly to all portal download pages.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            🔄 Reset Defaults
          </button>
          <button className="btn btn-primary" onClick={handleSave} style={{ marginLeft: '.625rem' }}>
            💾 Save All Links
          </button>
        </div>
      </div>

      {/* ── Status banners ───────────────────────────────────────────────── */}
      {saved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          background: '#f0fdf4', border: '1px solid #86efac',
          borderRadius: '.5rem', padding: '.875rem 1.25rem', marginBottom: '1.25rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: '#166534', fontSize: '.9rem' }}>Links saved successfully!</div>
            <div style={{ color: '#15803d', fontSize: '.8rem' }}>All download pages will show the updated URLs immediately.</div>
          </div>
        </div>
      )}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.75rem',
          background: '#fef2f2', border: '1px solid #fca5a5',
          borderRadius: '.5rem', padding: '.875rem 1.25rem', marginBottom: '1.25rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>⚠️</span>
          <div style={{ fontWeight: 600, color: '#dc2626', fontSize: '.875rem' }}>{error}</div>
        </div>
      )}

      {/* ── How it works notice ──────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '.875rem', alignItems: 'flex-start',
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '.5rem',
        padding: '1rem 1.25rem', marginBottom: '1.75rem',
      }}>
        <span style={{ fontSize: '1.1rem', marginTop: '.1rem', flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: '.825rem', color: '#1e40af', lineHeight: 1.65 }}>
          <strong>How links work:</strong> Leave fields as placeholder until your app is published on the stores.
          Once you receive your store listing URLs from Google Play Console or Apple App Connect, paste them here.
          Changes take effect immediately — no rebuild or redeploy needed.
          The <strong>App Paths</strong> section below shows the source code location for super-admin verification.
        </div>
      </div>

      {/* ── App cards ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {APP_META.map(app => (
          <div key={app.id} style={{
            background: '#fff',
            border: '1.5px solid #e2e8f0',
            borderLeft: `4px solid ${app.color}`,
            borderRadius: '.75rem',
            overflow: 'hidden',
          }}>

            {/* Card header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.5rem',
              background: app.bg,
              borderBottom: `1px solid ${app.borderColor}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '.625rem',
                background: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem',
                boxShadow: `0 0 0 2px ${app.borderColor}`,
                flexShrink: 0,
              }}>{app.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{app.name}</div>
                <div style={{ fontSize: '.775rem', color: app.color, fontWeight: 600 }}>
                  For {app.audience}
                </div>
              </div>
              {app.restricted && (
                <span style={{
                  background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5',
                  borderRadius: '1rem', padding: '.25rem .75rem', fontSize: '.7rem', fontWeight: 700,
                }}>🔒 ADMIN ONLY</span>
              )}
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <span style={{
                  background: isCustom(app.playKey) ? '#dcfce7' : '#f1f5f9',
                  color: isCustom(app.playKey) ? '#166534' : '#94a3b8',
                  borderRadius: '1rem', padding: '.2rem .625rem', fontSize: '.7rem', fontWeight: 600,
                }}>
                  {isCustom(app.playKey) ? '✓ Play URL set' : '⏳ Play placeholder'}
                </span>
                <span style={{
                  background: isCustom(app.storeKey) ? '#dcfce7' : '#f1f5f9',
                  color: isCustom(app.storeKey) ? '#166534' : '#94a3b8',
                  borderRadius: '1rem', padding: '.2rem .625rem', fontSize: '.7rem', fontWeight: 600,
                }}>
                  {isCustom(app.storeKey) ? '✓ iOS URL set' : '⏳ iOS placeholder'}
                </span>
              </div>
            </div>

            {/* Store URL inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.25rem 1.5rem' }}>
              {/* Google Play */}
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  fontSize: '.75rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem',
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a1a2e"><path d="M3.18 23.76c.3.17.65.19.97.05l12.44-7.19-2.9-2.9-10.51 10zM.44 1.64C.17 1.97.01 2.43.01 3.02v17.96c0 .59.16 1.05.43 1.38l.08.07 10.06-10.06v-.24L.52 1.57l-.08.07zM21.28 10.62l-2.88-1.66-3.24 3.24 3.24 3.24 2.9-1.68c.83-.48.83-1.66-.02-2.14zM4.15.24L16.6 7.43l-2.9 2.9L3.18.24c.3-.14.65-.12.97.0z" /></svg>
                  Google Play URL
                </label>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    type="url"
                    value={links[app.playKey]}
                    onChange={e => update(app.playKey, e.target.value)}
                    placeholder="https://play.google.com/store/apps/details?id=..."
                    style={{
                      flex: 1, padding: '.55rem .75rem',
                      border: `1.5px solid ${!isValidUrl(links[app.playKey]) ? '#dc2626' : '#e2e8f0'}`,
                      borderRadius: '.5rem', fontSize: '.825rem', fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = app.color)}
                    onBlur={e => (e.target.style.borderColor = isValidUrl(links[app.playKey]) ? '#e2e8f0' : '#dc2626')}
                  />
                  {isCustom(app.playKey) && (
                    <a href={links[app.playKey]} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', padding: '.55rem .75rem',
                        background: app.color, color: '#fff', borderRadius: '.5rem',
                        fontSize: '.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>Test ↗</a>
                  )}
                </div>
              </div>

              {/* App Store */}
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '.4rem',
                  fontSize: '.75rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem',
                }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="#1a1a2e"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>
                  Apple App Store URL
                </label>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    type="url"
                    value={links[app.storeKey]}
                    onChange={e => update(app.storeKey, e.target.value)}
                    placeholder="https://apps.apple.com/in/app/..."
                    style={{
                      flex: 1, padding: '.55rem .75rem',
                      border: `1.5px solid ${!isValidUrl(links[app.storeKey]) ? '#dc2626' : '#e2e8f0'}`,
                      borderRadius: '.5rem', fontSize: '.825rem', fontFamily: 'inherit',
                      outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = app.color)}
                    onBlur={e => (e.target.style.borderColor = isValidUrl(links[app.storeKey]) ? '#e2e8f0' : '#dc2626')}
                  />
                  {isCustom(app.storeKey) && (
                    <a href={links[app.storeKey]} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'center', padding: '.55rem .75rem',
                        background: app.color, color: '#fff', borderRadius: '.5rem',
                        fontSize: '.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                      }}>Test ↗</a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Super-admin: App File Paths ───────────────────────────── */}
            <div style={{ borderTop: `1px solid ${app.borderColor}`, background: '#fafafa' }}>
              <button
                onClick={() => setExpandedPath(expandedPath === app.id ? null : app.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '.75rem 1.5rem', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, color: '#475569',
                  textAlign: 'left',
                }}
              >
                <span>📂 App Paths &amp; Build Info (Super Admin Verification)</span>
                <span style={{ color: app.color, fontSize: '.9rem' }}>
                  {expandedPath === app.id ? '▲ Hide' : '▼ Show'}
                </span>
              </button>

              {expandedPath === app.id && (
                <div style={{ padding: '0 1.5rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { label: 'Web Source', value: app.sourceFolder, icon: '📁' },
                    { label: 'Nx Project', value: app.nxProject, icon: '🔧' },
                    { label: 'Build Output', value: app.buildOutput, icon: '📦' },
                    { label: 'Local Dev URL', value: app.localDevUrl, icon: '🌐', isUrl: true },
                    { label: 'Mobile Source', value: app.mobileFolder, icon: '📱' },
                    { label: 'Mobile Nx Project', value: app.mobileNxProj, icon: '🔧' },
                    { label: 'Mobile Dev URL', value: app.mobileDevUrl, icon: '📡', isUrl: true },
                    { label: 'App Package ID', value: app.packageId, icon: '🏷️' },
                  ].map(row => (
                    <div key={row.label} style={{
                      background: '#fff', border: '1px solid #e2e8f0',
                      borderRadius: '.5rem', padding: '.625rem .875rem',
                    }}>
                      <div style={{ fontSize: '.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.2rem' }}>
                        {row.icon} {row.label}
                      </div>
                      {row.isUrl ? (
                        <a href={row.value} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '.8rem', color: app.color, fontWeight: 600, textDecoration: 'none', fontFamily: 'monospace' }}>
                          {row.value} ↗
                        </a>
                      ) : (
                        <code style={{ fontSize: '.8rem', color: '#0f172a', fontFamily: 'monospace' }}>{row.value}</code>
                      )}
                    </div>
                  ))}
                  <div style={{
                    gridColumn: '1 / -1',
                    background: app.bg, border: `1px solid ${app.borderColor}`,
                    borderRadius: '.5rem', padding: '.625rem .875rem',
                    fontSize: '.775rem', color: app.color,
                  }}>
                    <strong>Quick test commands:</strong><br />
                    <code style={{ display: 'block', marginTop: '.25rem', fontFamily: 'monospace' }}>
                      pnpm nx serve {app.nxProject}
                    </code>
                    <code style={{ display: 'block', marginTop: '.1rem', fontFamily: 'monospace' }}>
                      pnpm nx build {app.nxProject} --prod
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Save footer ──────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
        <button className="btn btn-secondary" onClick={handleReset}>🔄 Reset All</button>
        <button className="btn btn-primary" onClick={handleSave}>💾 Save All Links</button>
      </div>
    </div>
  );
}

export default AppLinksSettings;
