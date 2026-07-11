"use client";
import { useEffect } from 'react';
import seoConfig from './seo.json';

export interface GlobalMetadataInjectorProps {
  portalName: string;
}

export function GlobalMetadataInjector({ portalName }: GlobalMetadataInjectorProps) {
  useEffect(() => {
    try {
      const doc = typeof document !== 'undefined' ? (document as any) : null;
      if (!doc) return;

      const data = seoConfig;

      if (data && data.siteName) {
        doc.title = `${portalName} | ${data.siteName}`;
      } else {
        doc.title = `${portalName} | One Choice Kitchen`;
      }

      if (data && data.faviconUrl) {
        let link = doc.querySelector("link[rel~='icon']");
        if (!link) {
          link = doc.createElement('link');
          link.rel = 'icon';
          doc.head.appendChild(link);
        }
        link.href = data.faviconUrl;
      }
      
      // Inject standard SEO metadata
      const setMeta = (name: string, content: string) => {
        if (!content) return;
        let meta = doc.querySelector(`meta[name='${name}']`);
        if (!meta) {
          meta = doc.createElement('meta');
          meta.name = name;
          doc.head.appendChild(meta);
        }
        meta.content = content;
      };

      setMeta('description', data.description);
      setMeta('keywords', data.keywords);
      
      // Open Graph Tags
      if (data.ogTitle) setMeta('og:title', data.ogTitle);
      if (data.ogDescription) setMeta('og:description', data.ogDescription);
      setMeta('og:type', 'website');
      
      // Twitter Card Tags
      if (data.twitterTitle) setMeta('twitter:title', data.twitterTitle);
      if (data.twitterDescription) setMeta('twitter:description', data.twitterDescription);
      setMeta('twitter:card', 'summary_large_image');
      
      // Canonical
      if (data.canonicalUrl) {
        let canonical = doc.querySelector("link[rel='canonical']");
        if (!canonical) {
          canonical = doc.createElement('link');
          canonical.rel = 'canonical';
          doc.head.appendChild(canonical);
        }
        canonical.href = data.canonicalUrl;
      }

    } catch (err) {
      const doc = typeof document !== 'undefined' ? (document as any) : null;
      if (doc) {
        doc.title = `${portalName} | One Choice Kitchen`;
      }
    }
  }, [portalName, seoConfig]); // adding seoConfig here ensures HMR triggers effect

  return null;
}
