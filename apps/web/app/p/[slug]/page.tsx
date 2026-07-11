import React from 'react';
import { notFound } from 'next/navigation';
import PageHero from '../../components/PageHero';
import styles from '../../page.module.css';

async function getPage(slug: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/static-pages/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);

  if (!page || !page.isActive) {
    notFound();
  }

  return (
    <div className={styles.main} style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
      <PageHero 
        badgeText={page.section}
        title={<span className={styles.highlight}>{page.title}</span>}
        subtitle=""
      />
      
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
        <div 
          style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', lineHeight: '1.7', fontSize: '1.1rem' }}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </div>
  );
}
