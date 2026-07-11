'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TopSlider({ overrideScope }: { overrideScope?: string }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliders, setSliders] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch('/api/sliders');
        if (res.ok) {
          const data = await res.json();
          // Determine the page scope based on current route or override
          let currentPage = overrideScope || 'home';
          if (!overrideScope && pathname) {
            if (pathname.includes('/menu')) currentPage = 'menu';
            else if (pathname.includes('/tiffin')) currentPage = 'tiffin';
            else if (pathname.includes('/reservations') || pathname.includes('/dinein')) currentPage = 'dining';
            else if (pathname === '/') currentPage = 'home';
          }

          // Filter sliders for web portal, active status, and matching scope
          const webSliders = data
            .filter((s: any) => s.portal === 'web' && s.isActive !== false)
            .filter((s: any) => !s.pageScope || s.pageScope === 'all' || s.pageScope === currentPage)
            .sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));

          setSliders(webSliders);
        }
      } catch (err) {
        console.error('Failed to load sliders', err);
      }
    };
    fetchSliders();
  }, [pathname, overrideScope]);

  useEffect(() => {
    if (sliders.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [sliders]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliders.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);

  if (sliders.length === 0) {
    return null; // Return nothing if there are no sliders
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden' }}>
      {sliders.map((slide, index) => (
        <div
          key={slide.id || index}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${slide.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: slide.fontColor || 'white',
            backgroundColor: slide.bgColor || '#1e3a8a',
            padding: '2rem'
          }}
        >
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{slide.title}</h2>
            <p style={{ fontSize: '1.25rem', margin: '0 0 1.5rem 0', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{slide.description || slide.subtitle}</p>
            {slide.buttonText && (
               <a href={slide.link || '#'} style={{
                 background: slide.btnColor || 'rgba(255,255,255,0.2)',
                 padding: '0.75rem 1.5rem',
                 borderRadius: '999px',
                 textDecoration: 'none',
                 color: slide.fontColor || 'white',
                 fontWeight: 'bold',
                 backdropFilter: 'blur(4px)'
               }}>
                 {slide.buttonText}
               </a>
            )}
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      {sliders.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <ArrowLeft size={24} />
          </button>
          <button 
            onClick={nextSlide}
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <ArrowRight size={24} />
          </button>
        </>
      )}
      
      {/* Indicators */}
      {sliders.length > 1 && (
        <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
          {sliders.map((_, idx) => (
            <div 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              style={{ 
                width: idx === currentSlide ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                background: idx === currentSlide ? 'white' : 'rgba(255,255,255,0.5)', 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
