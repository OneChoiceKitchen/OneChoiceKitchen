import { useState, useEffect } from 'react';
import { useToast } from '@org/ui-design-system';
import styles from './SeoManagement.module.css';

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
  'Content-Type': 'application/json'
});

const DUMMY_SETTINGS = {
  siteName: 'OneChoiceKitchen',
  tagline: 'Healthy Tiffin Delivery',
  logoUrl: 'https://example.com/logo.png',
  faviconUrl: 'https://example.com/favicon.ico',
  transparentFaviconUrl: 'https://example.com/favicon-transparent.png',
  contactEmail: 'contact@onechoicekitchen.com',
  contactPhone: '+91-9876543210',
  facebookUrl: 'https://facebook.com/onechoicekitchen',
  twitterUrl: 'https://twitter.com/onechoice',
  instagramUrl: 'https://instagram.com/onechoicekitchen',
  linkedinUrl: 'https://linkedin.com/company/onechoicekitchen',
};

const DUMMY_SEO_DATA = {
  pageName: 'home',
  title: 'OneChoiceKitchen | Healthy Home Cooked Tiffins',
  description: 'Order healthy, hygienic, and home-cooked tiffins directly to your door.',
  keywords: 'tiffin, food delivery, healthy food, lunch, dinner',
  ogTitle: 'OneChoiceKitchen - Delicious Tiffins',
  ogDescription: 'Order healthy, hygienic, and home-cooked tiffins directly to your door.',
  twitterTitle: 'OneChoiceKitchen',
  twitterDescription: 'Healthy food delivery.',
  canonicalUrl: 'https://onechoicekitchen.com',
  robots: 'index, follow',
  schemaMarkup: '{ "@context": "https://schema.org", "@type": "Organization" }',
  gaId: 'G-1234567890',
  gtmId: 'GTM-ABCDEFG',
  googleSiteVerification: 'abcd1234efgh5678',
  bingSiteVerification: '',
  customHeaderScripts: '<!-- Add custom scripts here -->',
};

export default function SeoManagement() {
  const [globalSettings, setGlobalSettings] = useState<any>({});
  const [seoData, setSeoData] = useState<any>({});
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seo/settings', { headers: authHeaders() });
      const result = await res.text().then(t => t ? JSON.parse(t) : null).catch(() => null);

      if (result) {
        setGlobalSettings(result);
        setSeoData(result);
      } else {
        setGlobalSettings(DUMMY_SETTINGS);
        setSeoData(DUMMY_SEO_DATA);
      }
    } catch (error) {
      setGlobalSettings(DUMMY_SETTINGS);
      setSeoData(DUMMY_SEO_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const combinedPayload = { ...globalSettings, ...seoData };
      const res = await fetch('/api/seo/settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(combinedPayload, null, 2)
      });
      
      if (!res.ok) throw new Error();
      
      setSuccessMsg('SEO & Branding settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading SEO Data...</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>SEO & Branding</h1>
          <p className={styles.pageSubtitle}>Manage global meta tags, Open Graph cards, and site branding.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className={styles.saveBtn}
        >
          <span>💾</span>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {successMsg && (
        <div className={styles.successAlert}>
          {successMsg}
        </div>
      )}

      <div className={styles.gridContainer}>
        {/* GLOBAL BRANDING */}
        <div className={styles.card}>
          <h2 className={styles.cardHeader}>
            <span>🌍</span> Global Branding
          </h2>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Site Name</label>
              <input 
                type="text" 
                value={globalSettings.siteName || ''}
                onChange={(e) => setGlobalSettings({...globalSettings, siteName: e.target.value})}
                className={styles.formInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Site Tagline</label>
              <input 
                type="text" 
                value={globalSettings.tagline || ''}
                onChange={(e) => setGlobalSettings({...globalSettings, tagline: e.target.value})}
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Logo URL</label>
                <input type="text" value={globalSettings.logoUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, logoUrl: e.target.value})} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Favicon URL</label>
                <input type="text" value={globalSettings.faviconUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, faviconUrl: e.target.value})} className={styles.formInput} />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Transparent Favicon URL</label>
              <input type="text" value={globalSettings.transparentFaviconUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, transparentFaviconUrl: e.target.value})} className={styles.formInput} />
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact Email</label>
                <input type="email" value={globalSettings.contactEmail || ''} onChange={(e) => setGlobalSettings({...globalSettings, contactEmail: e.target.value})} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Contact Phone</label>
                <input type="text" value={globalSettings.contactPhone || ''} onChange={(e) => setGlobalSettings({...globalSettings, contactPhone: e.target.value})} className={styles.formInput} />
              </div>
            </div>

            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Facebook URL</label>
                <input type="text" value={globalSettings.facebookUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, facebookUrl: e.target.value})} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Twitter URL</label>
                <input type="text" value={globalSettings.twitterUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, twitterUrl: e.target.value})} className={styles.formInput} />
              </div>
            </div>
            
            <div className={styles.formRow2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Instagram URL</label>
                <input type="text" value={globalSettings.instagramUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, instagramUrl: e.target.value})} className={styles.formInput} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>LinkedIn URL</label>
                <input type="text" value={globalSettings.linkedinUrl || ''} onChange={(e) => setGlobalSettings({...globalSettings, linkedinUrl: e.target.value})} className={styles.formInput} />
              </div>
            </div>
          </div>
        </div>

        {/* SEO COLUMNS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* HOME PAGE SEO */}
          <div className={styles.card}>
            <h2 className={styles.cardHeader}>
              <span>&#127757;</span> Home Page Meta Data
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>SEO Title</label>
                <input 
                  type="text" 
                  value={seoData.title || ''}
                  onChange={(e) => setSeoData({...seoData, title: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Meta Description</label>
                <textarea 
                  rows={3}
                  value={seoData.description || ''}
                  onChange={(e) => setSeoData({...seoData, description: e.target.value})}
                  className={styles.formTextarea}
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Meta Keywords</label>
                <input 
                  type="text" 
                  value={seoData.keywords || ''}
                  onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
                  placeholder="Comma separated keywords"
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Canonical URL</label>
                  <input type="text" value={seoData.canonicalUrl || ''} onChange={(e) => setSeoData({...seoData, canonicalUrl: e.target.value})} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Robots Meta Tag</label>
                  <input type="text" value={seoData.robots || ''} onChange={(e) => setSeoData({...seoData, robots: e.target.value})} placeholder="index, follow" className={styles.formInput} />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Schema Markup (JSON)</label>
                <textarea rows={4} value={seoData.schemaMarkup || ''} onChange={(e) => setSeoData({...seoData, schemaMarkup: e.target.value})} placeholder='{ "@context": "https://schema.org" }' className={`${styles.formTextarea} ${styles.mono}`}></textarea>
              </div>
            </div>
          </div>

          {/* OPEN GRAPH SMO */}
          <div className={styles.card}>
            <h2 className={styles.cardHeader}>
              <span>&#128279;</span> Open Graph (Facebook/LinkedIn)
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>OG Title</label>
                <input 
                  type="text" 
                  value={seoData.ogTitle || ''}
                  onChange={(e) => setSeoData({...seoData, ogTitle: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>OG Description</label>
                <textarea 
                  rows={2}
                  value={seoData.ogDescription || ''}
                  onChange={(e) => setSeoData({...seoData, ogDescription: e.target.value})}
                  className={styles.formTextarea}
                ></textarea>
              </div>
            </div>
          </div>

          {/* TWITTER CARDS */}
          <div className={styles.card}>
            <h2 className={styles.cardHeader}>
              <span>&#128038;</span> Twitter Cards
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Twitter Title</label>
                <input 
                  type="text" 
                  value={seoData.twitterTitle || ''}
                  onChange={(e) => setSeoData({...seoData, twitterTitle: e.target.value})}
                  className={styles.formInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Twitter Description</label>
                <textarea 
                  rows={2}
                  value={seoData.twitterDescription || ''}
                  onChange={(e) => setSeoData({...seoData, twitterDescription: e.target.value})}
                  className={styles.formTextarea}
                ></textarea>
              </div>
            </div>
          </div>

          {/* TRACKING & VERIFICATION */}
          <div className={styles.card}>
            <h2 className={styles.cardHeader}>
              <span>📈</span> Tracking & Site Verification
            </h2>
            
            <div className={styles.formGrid}>
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Google Analytics 4 ID (GA4)</label>
                  <input type="text" value={seoData.gaId || ''} onChange={(e) => setSeoData({...seoData, gaId: e.target.value})} placeholder="G-XXXXXXXXXX" className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Google Tag Manager ID</label>
                  <input type="text" value={seoData.gtmId || ''} onChange={(e) => setSeoData({...seoData, gtmId: e.target.value})} placeholder="GTM-XXXXXX" className={styles.formInput} />
                </div>
              </div>
              
              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Google Site Verification Code</label>
                  <input type="text" value={seoData.googleSiteVerification || ''} onChange={(e) => setSeoData({...seoData, googleSiteVerification: e.target.value})} className={styles.formInput} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bing Site Verification Code</label>
                  <input type="text" value={seoData.bingSiteVerification || ''} onChange={(e) => setSeoData({...seoData, bingSiteVerification: e.target.value})} className={styles.formInput} />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Custom Header Scripts (e.g. Meta Pixel)</label>
                <textarea rows={4} value={seoData.customHeaderScripts || ''} onChange={(e) => setSeoData({...seoData, customHeaderScripts: e.target.value})} placeholder="<script>...</script>" className={`${styles.formTextarea} ${styles.mono}`}></textarea>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
