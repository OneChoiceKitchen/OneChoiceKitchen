'use client';
import React from 'react';
import styles from './BrandFooter.module.css';

export interface BrandFooterProps {
  className?: string;
  portalType?: 'web' | 'partner' | 'rider';
  onFooterLinkClick?: (slug: string) => void;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ className = '', portalType = 'web', onFooterLinkClick }) => {
  const [sections, setSections] = React.useState<Record<string, any[]>>({});
  const [socialLinks, setSocialLinks] = React.useState({
    facebookUrl: '#',
    twitterUrl: '#',
    instagramUrl: '#',
    youtubeUrl: '#',
  });

  React.useEffect(() => {
    // Fetch static pages
    fetch(`/api/static-pages?portal=${portalType}`)
      .then(res => res.json())
      .then(pages => {
        const activePages = Array.isArray(pages) ? pages.filter((p: any) => p.isActive) : [];
        const grouped = activePages.reduce((acc: any, page: any) => {
          if (!acc[page.section]) acc[page.section] = [];
          acc[page.section].push(page);
          return acc;
        }, {});
        setSections(grouped);
      })
      .catch(console.error);

    // Fetch branch for social links
    fetch(`/api/branches`)
      .then(res => res.json())
      .then(branches => {
        if (branches && branches.length > 0) {
          const branch = branches[0];
          setSocialLinks({
            facebookUrl: branch.facebookUrl || '#',
            twitterUrl: branch.twitterUrl || '#',
            instagramUrl: branch.instagramUrl || '#',
            youtubeUrl: branch.youtubeUrl || '#',
          });
        }
      })
      .catch(console.error);
  }, [portalType]);

  const handleLinkClick = (e: React.MouseEvent, slug: string) => {
    if (onFooterLinkClick) {
      e.preventDefault();
      onFooterLinkClick(slug);
    }
  };

  return (
    <footer className={`${styles.footer} ${className}`}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <div className={styles.brandContainer}>
              <style dangerouslySetInnerHTML={{__html: `
                @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap');
              `}} />
              <img src="/branding/logo-icon.png" alt="One Choice Kitchen Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '32px', lineHeight: 1, margin: 0, fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  <span style={{ color: '#2563EB' }}>ONE</span> <span style={{ color: '#ED1C24' }}>CHOICE</span> <span style={{ color: '#2563EB' }}>KITCHEN</span>
                </span>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#2563EB', marginTop: '2px' }}>
                  ALL YOUR CRAVINGS. ONE KITCHEN
                </div>
              </div>
            </div>
            <p className={styles.tagline} style={{ maxWidth: '350px', margin: 0 }}>
              {portalType === 'rider' 
                ? 'Join our elite delivery fleet. Earn competitively on your own schedule while bringing joy to thousands of hungry customers.'
                : portalType === 'partner'
                ? 'Partner with One Choice Kitchen to scale your culinary business. Get access to thousands of daily active users.'
                : 'Order delicious premium food or subscribe to our daily homestyle tiffin service. Healthy, hygienic, and delivered fresh to your door.'
              }
            </p>
          </div>
          
          {Object.entries(sections).map(([sectionName, links]) => (
            <div className={styles.column} key={sectionName}>
              <h4>{sectionName}</h4>
              <ul className={styles.links}>
                {links.map(link => (
                  <li className={styles.linkItem} key={link.id}>
                    <a href={`/p/${link.slug}`} onClick={(e) => handleLinkClick(e, link.slug)}>
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className={styles.bottom}>
          <div className={styles.copyright}>&copy; 2026 One Choice Kitchen. All rights reserved.</div>
          <div className={styles.socialLinks}>
            {socialLinks.twitterUrl !== '#' && (
              <a href={socialLinks.twitterUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
            )}
            {socialLinks.instagramUrl !== '#' && (
              <a href={socialLinks.instagramUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
            {socialLinks.facebookUrl !== '#' && (
              <a href={socialLinks.facebookUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            )}
            {socialLinks.youtubeUrl !== '#' && (
              <a href={socialLinks.youtubeUrl} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
