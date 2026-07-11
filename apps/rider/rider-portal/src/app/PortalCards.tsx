import React, { useEffect, useState } from 'react';

const DEFAULT_SLIDER_ITEMS = [
  { id: 'r1', title: 'Earn More with Surge Pricing', description: 'Deliver during peak hours to earn up to 1.5x on every order.', buttonText: 'Check Timings', link: '#', bgColor: 'linear-gradient(135deg, #8b5cf6, #5b21b6)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800' },
  { id: 'r2', title: 'Safety Guidelines', description: 'Please ensure you wear a mask and sanitize hands regularly.', buttonText: 'Read Rules', link: '#', bgColor: 'linear-gradient(135deg, #ec4899, #be185d)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=800' },
  { id: 'r3', title: 'Vehicle Maintenance', description: 'Keep your vehicle in top condition for safe and fast deliveries.', buttonText: 'Tips', link: '#', bgColor: 'linear-gradient(135deg, #f59e0b, #b45309)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800' },
  { id: 'r4', title: 'Rider Support', description: 'Facing issues on the road? Contact our dedicated rider support.', buttonText: 'Call Support', link: '#', bgColor: 'linear-gradient(135deg, #10b981, #047857)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800' },
  { id: 'r5', title: 'Weekly Bonuses', description: 'Complete 50 deliveries this week to unlock a special bonus.', buttonText: 'View Target', link: '#', bgColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800' },
  { id: 'r6', title: 'Refer a Friend', description: 'Refer a friend to join our delivery fleet and earn rewards.', buttonText: 'Invite Now', link: '#', bgColor: 'linear-gradient(135deg, #DC2626, #991b1b)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800' },
  { id: 'r7', title: 'Customer Etiquette', description: 'Maintain high ratings by providing excellent service with a smile.', buttonText: 'Learn More', link: '#', bgColor: 'linear-gradient(135deg, #14b8a6, #0f766e)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800' },
  { id: 'r8', title: 'Health & Insurance', description: 'View your health insurance benefits provided by One Choice Kitchen.', buttonText: 'View Benefits', link: '#', bgColor: 'linear-gradient(135deg, #eab308, #a16207)', btnColor: 'rgba(0, 0, 0, 0.3)', imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800' }
];

export default function PortalCards({ portalName = 'rider', onCardClick }: { portalName?: string, onCardClick?: (item: any) => void }) {
  const [sliderItems, setSliderItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch(`/api/sliders/portal/${portalName}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setSliderItems(data);
          } else {
            setSliderItems(DEFAULT_SLIDER_ITEMS);
          }
        } else {
          setSliderItems(DEFAULT_SLIDER_ITEMS);
        }
      } catch (err) {
        console.error('Failed to fetch sliders', err);
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
                background: item.bgColor || '#10b981'
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
