'use client';
import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Calendar, Briefcase, Gift, ArrowRight } from 'lucide-react';

export default function PortalCards() {
  const portals = [
    {
      title: "Order Online",
      description: "Browse our extensive menu and get fresh food delivered to your door in 30 minutes.",
      icon: <ShoppingBag size={48} strokeWidth={1.5} />,
      href: "/menu",
      color: "#DC2626",
      bgLight: "#fef2f2",
      bgGradient: "linear-gradient(135deg, #DC2626 0%, #dc2626 100%)"
    },
    {
      title: "Daily Tiffins",
      description: "Subscribe to our healthy, home-style daily meal plans for lunch and dinner.",
      icon: <Calendar size={48} strokeWidth={1.5} />,
      href: "/tiffin",
      color: "#3b82f6",
      bgLight: "#eff6ff",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
    },
    {
      title: "Corporate Catering",
      description: "Elevate your office events with our premium corporate catering packages.",
      icon: <Briefcase size={48} strokeWidth={1.5} />,
      href: "/catering",
      color: "#10b981",
      bgLight: "#ecfdf5",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      title: "Loyalty Rewards",
      description: "Earn points on every order and unlock exclusive discounts and freebies.",
      icon: <Gift size={48} strokeWidth={1.5} />,
      href: "/loyalty",
      color: "#f59e0b",
      bgLight: "#fffbeb",
      bgGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    },
    {
      title: "Dine-in Reservations",
      description: "Book a table ahead of time and pre-order your food for a seamless dining experience.",
      icon: <Calendar size={48} strokeWidth={1.5} />,
      href: "/reservations",
      color: "#8b5cf6",
      bgLight: "#f5f3ff",
      bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
    }
  ];

  return (
    <section style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
            Explore Our Services
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            From quick cravings to daily meals and team events, we have everything you need.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '2rem' 
        }}>
          {portals.map((portal, idx) => (
            <Link key={idx} href={portal.href} style={{ textDecoration: 'none', display: 'block' }}>
              <div 
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2.5rem 2rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                  border: '1px solid #f1f5f9',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
                  const iconEl = e.currentTarget.querySelector('.portal-icon');
                  if (iconEl) (iconEl as HTMLElement).style.transform = 'scale(1.1) rotate(5deg)';
                  const arrowEl = e.currentTarget.querySelector('.portal-arrow');
                  if (arrowEl) (arrowEl as HTMLElement).style.transform = 'translateX(5px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
                  const iconEl = e.currentTarget.querySelector('.portal-icon');
                  if (iconEl) (iconEl as HTMLElement).style.transform = 'scale(1) rotate(0)';
                  const arrowEl = e.currentTarget.querySelector('.portal-arrow');
                  if (arrowEl) (arrowEl as HTMLElement).style.transform = 'translateX(0)';
                }}
              >
                
                {/* Decorative background circle */}
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  right: '-30px',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  background: portal.bgLight,
                  opacity: 0.5,
                  zIndex: 0
                }} />

                <div 
                  className="portal-icon"
                  style={{
                    background: portal.bgGradient,
                    width: '80px',
                    height: '80px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginBottom: '1.5rem',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {portal.icon}
                </div>

                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#0f172a', 
                  marginBottom: '0.75rem',
                  position: 'relative',
                  zIndex: 1
                }}>
                  {portal.title}
                </h3>
                
                <p style={{ 
                  color: '#64748b', 
                  lineHeight: '1.6', 
                  marginBottom: '2rem',
                  flex: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  {portal.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: portal.color,
                  fontWeight: '600',
                  marginTop: 'auto',
                  position: 'relative',
                  zIndex: 1
                }}>
                  Explore Service
                  <ArrowRight className="portal-arrow" size={18} style={{ transition: 'transform 0.3s ease' }} />
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}