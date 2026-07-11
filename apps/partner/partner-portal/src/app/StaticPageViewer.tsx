import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function StaticPageViewer({ slug, onBack }: { slug: string, onBack: () => void }) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/static-pages/${slug}`)
      .then(res => res.json())
      .then(data => {
        setPage(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading page...</div>;
  }

  if (!page || page.error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Page Not Found</h2>
        <button onClick={onBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px', minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ background: '#0f172a', color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{page.title}</h2>
      </div>
      <div style={{ padding: '1.5rem', background: 'white', margin: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </div>
  );
}
