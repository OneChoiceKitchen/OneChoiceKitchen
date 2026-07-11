'use client';
import { useState, useEffect } from 'react';
import styles from "../page.module.css";
import Link from "next/link";
import PageHero from "../components/PageHero";
import ImageWithFallback from "../components/ImageWithFallback";

interface BlogArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  publishDate: string;
  content: string;
  views: number;
  likes: number;
  featuredImage: string;
  slug: string;
}


export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        let url = '/api/blogs';
        const params = new URLSearchParams();
        if (activeCategory !== 'All') params.append('category', activeCategory);
        if (searchQuery) params.append('search', searchQuery);
        params.append('page', page.toString());
        params.append('limit', '9');
        
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // API returns paginated structure { data: [], total, page, totalPages }
          if (data && data.data) {
            setBlogs(data.data);
            if (data.totalPages) setTotalPages(data.totalPages);
          } else if (Array.isArray(data)) {
            setBlogs(data);
          }
        } else {
          console.error('Failed to fetch blogs');
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
      }
    };
    
    // Add a small debounce for search
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs();
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory, page]);

  const categories = ['All', 'Recipes', 'Nutrition', 'Lifestyle'];

  // Map backend keys to frontend if needed
  const mappedBlogs = blogs.map(blog => ({
    ...blog,
    publishDate: blog.publishDate || (blog as any).publish_date,
    featuredImage: blog.featuredImage || (blog as any).featured_image
  }));

  const filteredBlogs = mappedBlogs; // API already filters

  return (
    <div className={styles.main} style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      <PageHero 
        badgeText="Insights & Inspiration"
        title={<>One Choice Kitchen <span className={styles.highlight}>Stories</span></>}
        subtitle="Discover professional chef tips, delicious healthy meal preparation, and updates from the heart of our kitchen."
      />

      <div style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        {/* Search & Category Filter Controls */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  background: activeCategory === cat ? 'var(--accent-gradient)' : '#ffffff',
                  color: activeCategory === cat ? 'white' : '#64748b',
                  border: '1px solid rgba(0, 56, 147, 0.08)',
                  padding: '0.5rem 1.25rem',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 8px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <input 
            type="text" 
            placeholder="🔍 Search articles..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: '1px solid rgba(0, 56, 147, 0.1)',
              outline: 'none',
              width: '280px',
              fontSize: '0.9rem'
            }}
          />
        </div>

        {/* Blog Posts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map(blog => (
              <div 
                key={blog.id} 
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 56, 147, 0.08)',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: 'rgba(0, 56, 147, 0.02) 0px 4px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'rgba(0, 56, 147, 0.06) 0px 12px 24px';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'rgba(0, 56, 147, 0.02) 0px 4px 12px';
                }}
              >
                {/* Image Box */}
                <div style={{
                  height: '200px',
                  background: 'rgba(0, 56, 147, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '5rem',
                  borderBottom: '1px solid rgba(0, 56, 147, 0.05)'
                }}>
                  {blog.featuredImage ? (
                    <ImageWithFallback 
                      src={blog.featuredImage.includes('unsplash') ? `/images/Tiffin_Items/offer-${(blog.title.length % 4) + 1}.jpg` : blog.featuredImage} 
                      alt={blog.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      fallbackIconSize="60px" 
                    />
                  ) : (
                    <ImageWithFallback src="" alt="Placeholder" style={{ width: '100%', height: '100%' }} fallbackIconSize="60px" />
                  )}
                </div>

                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{
                      background: 'rgba(0, 56, 147, 0.08)',
                      color: '#2563EB',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {blog.category}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(blog.publishDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem', lineHeight: '1.25' }}>
                    {blog.title}
                  </h3>

                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', flex: 1, marginBottom: '2rem' }}>
                    {(blog as any).excerpt || blog.content.replace(/<[^>]+>/g, '').substring(0, 140)}...
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      By {blog.author}
                    </span>
                    
                    <Link href={`/blogs/${blog.slug}`} style={{ textDecoration: 'none', color: '#e60000', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      Read Article →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              No culinary stories found matching those tags or category.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '4rem' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', 
                background: page === 1 ? '#f1f5f9' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: page === 1 ? '#94a3b8' : '#0f172a', fontWeight: 'bold'
              }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', 
                background: page === totalPages ? '#f1f5f9' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                color: page === totalPages ? '#94a3b8' : '#0f172a', fontWeight: 'bold'
              }}
            >
              Next
            </button>
          </div>
        )}

      </div>
          {/* GLOBAL FOOTER */}
</div>
  );
}




