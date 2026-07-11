import React, { useEffect, useState } from 'react';

const DEFAULT_SLIDER_ITEMS = [
  { id: 'p1', title: 'Boost Your Sales', description: 'Join our premium kitchen program to get 30% more visibility.', buttonText: 'Learn More', link: '#', bgColor: 'linear-gradient(135deg, #f59e0b, #b45309)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800' },
  { id: 'p2', title: 'New Feature: Analytics', description: 'Track your live orders and revenue from the new analytics tab.', buttonText: 'View Dashboard', link: '#', bgColor: 'linear-gradient(135deg, #10b981, #047857)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800' },
  { id: 'p3', title: 'Packaging Guidelines', description: 'Ensure food safety and quality with our updated packaging guidelines.', buttonText: 'Read Guide', link: '#', bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?w=800' },
  { id: 'p4', title: 'Inventory Management', description: 'Keep your stock updated to avoid order cancellations.', buttonText: 'Update Stock', link: '#', bgColor: 'linear-gradient(135deg, #DC2626, #991b1b)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8ed7c663e0?w=800' },
  { id: 'p5', title: 'Partner Support', description: 'Need help? Our partner support team is available 24/7.', buttonText: 'Contact Support', link: '#', bgColor: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' },
  { id: 'p6', title: 'Refer a Kitchen', description: 'Refer a new partner kitchen and earn a bonus.', buttonText: 'Refer Now', link: '#', bgColor: 'linear-gradient(135deg, #ec4899, #be185d)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' },
  { id: 'p7', title: 'Quality Standards', description: 'Maintain high quality to get better ratings and more orders.', buttonText: 'View Standards', link: '#', bgColor: 'linear-gradient(135deg, #14b8a6, #0f766e)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800' },
  { id: 'p8', title: 'Marketing Tips', description: 'Learn how to attract more customers to your virtual restaurant.', buttonText: 'Read Tips', link: '#', bgColor: 'linear-gradient(135deg, #eab308, #a16207)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800' }
];

export default function PortalCards({ portalName = 'partner', onCardClick }: { portalName?: string, onCardClick?: (item: any) => void }) {
  const [sliderItems, setSliderItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch(`/api/sliders/portal/${portalName}`);
        if (res.ok) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (data && data.length > 0) {
              setSliderItems(data);
              return;
            }
          }
        }
        setSliderItems(DEFAULT_SLIDER_ITEMS);
      } catch (err) {
        // Silently handle to prevent console errors
        setSliderItems(DEFAULT_SLIDER_ITEMS);
      }
    };

    fetchSliders();
  }, [portalName]);

  if (sliderItems.length === 0) return null;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginTop: '1.5rem'
      }}>
        {sliderItems.map((item) => {
          return (
            <div 
              key={item.id} 
              onClick={(e) => {
                e.preventDefault();
                if (onCardClick) onCardClick(item);
              }} 
              style={{ cursor: 'pointer', textDecoration: 'none' }}
            >
              <div style={{
                position: 'relative',
                borderRadius: '16px',
                padding: '2rem',
                minHeight: '220px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                overflow: 'hidden',
                color: item.fontColor || '#ffffff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                background: item.bgColor || '#3b82f6'
              }}>
                {item.imageUrl && (
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      opacity: 0.4,
                      zIndex: 0
                    }}
                  />
                )}

                <div style={{ position: 'relative', zIndex: 1, marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: 0 }}>{item.title}</h3>
                  <p style={{ fontSize: '0.95rem', opacity: 0.9, margin: 0, lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>
                
                <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
                  <span style={{ 
                    display: 'inline-block',
                    background: item.btnColor || 'rgba(0, 0, 0, 0.3)',
                    color: item.fontColor || '#fff',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {item.buttonText} &rarr;
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
