'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';

export const DEFAULT_BLOGS = [
    { id: 1, title: 'Sample Blog', excerpt: 'Sample', imageUrl: '/map_placeholder.png' }
];

export default function GlobalTopContent() {
  const highlights = [
    {
      id: 1,
      tag: "Health & Nutrition",
      title: "How to Build a Balanced Tiffin Box",
      excerpt: "Discover the 5 essential components every daily meal needs for optimal energy.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "Oct 12, 2026"
    },
    {
      id: 2,
      tag: "Chef's Special",
      title: "Behind the Scenes: Our New Winter Menu",
      excerpt: "Take a sneak peek into our kitchen as our chefs prepare the upcoming seasonal dishes.",
      image: "https://images.unsplash.com/photo-1556910103-1c02745a872f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "Oct 08, 2026"
    },
    {
      id: 3,
      tag: "Community",
      title: "Partnering with Local Farmers",
      excerpt: "Learn how sourcing locally helps the environment and brings fresher ingredients to your plate.",
      image: "https://images.unsplash.com/photo-1595856728068-09cc5b6e088a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      date: "Oct 01, 2026"
    }
  ];

  return (
    <section style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              <Sparkles size={20} /> Latest Highlights
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>
              From the Kitchen & Beyond
            </h2>
          </div>
          <Link href="/blogs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8b5cf6', fontWeight: '600', textDecoration: 'none' }}>
            Read All Articles <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          {highlights.map(item => (
            <div 
              key={item.id}
              style={{
                borderRadius: '20px',
                background: 'white',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                {/* Fallback pattern if image fails */}
                <div style={{ position: 'absolute', inset: 0, background: '#e2e8f0', zIndex: 0 }} />
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={item.image} 
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  left: '1rem',
                  background: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  color: '#8b5cf6',
                  zIndex: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {item.tag}
                </div>
              </div>
              
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.6', flex: 1 }}>
                  {item.excerpt}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                  <span>{item.date}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8b5cf6', fontWeight: '600' }}>
                    Read More <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}