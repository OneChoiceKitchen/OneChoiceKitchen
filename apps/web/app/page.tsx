'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent } from '@org/ui-design-system';
import styles from "./page.module.css";
import Link from "next/link";
import {
  Utensils, ArrowRight, Star, Flame, Clock,
  CalendarCheck, Bike, ShieldCheck, Leaf, ChefHat,
  PhoneCall, MapPin, Package, PartyPopper
} from 'lucide-react';
import TopSlider from './components/TopSlider';
import ServicesShowcase from './components/ServicesShowcase';
import HomeOffers from './components/HomeOffers';

// ── Quick stats shown below the hero ──────────────────────────────────
const STATS = [
  { value: '10K+', label: 'Happy Customers', icon: <Star size={20} fill="#fbbf24" color="#fbbf24" /> },
  { value: '30 min', label: 'Avg Delivery Time', icon: <Clock size={20} color="#3b82f6" /> },
  { value: '99%', label: 'Hygiene Rating', icon: <ShieldCheck size={20} color="#10b981" /> },
  { value: '200+', label: 'Menu Items', icon: <ChefHat size={20} color="#DC2626" /> },
];

// ── Service cards for the "Our Services" section ───────────────────────
const SERVICES = [
  {
    icon: <Bike size={36} strokeWidth={1.5} />,
    title: 'Food Delivery',
    description: 'Hot, freshly prepared meals delivered to your doorstep in under 30 minutes.',
    color: '#DC2626',
    bg: '#fef2f2',
    href: '/menu',
    cta: 'Order Now',
  },
  {
    icon: <CalendarCheck size={36} strokeWidth={1.5} />,
    title: 'Daily Tiffin',
    description: 'Subscribe to our weekly meal plans — Veg & Non-Veg, home-style, zero preservatives.',
    color: '#10b981',
    bg: '#ecfdf5',
    href: '/tiffin',
    cta: 'View Plans',
  },
  {
    icon: <ChefHat size={36} strokeWidth={1.5} />,
    title: 'Dine-In Booking',
    description: 'Reserve a table at our branch and enjoy a premium dine-in experience.',
    color: '#3b82f6',
    bg: '#eff6ff',
    href: '/reservations',
    cta: 'Book a Table',
  },
  {
    icon: <PartyPopper size={36} strokeWidth={1.5} />,
    title: 'Catering',
    description: 'Planning an event? We handle large-scale catering with custom menus.',
    color: '#f59e0b',
    bg: '#fffbeb',
    href: '/catering',
    cta: 'Get a Quote',
  },
];

// ── Weekly tiffin preview ─────────────────────────────────────────────
const WEEKLY_PREVIEW = [
  { day: 'Mon', meal: 'Dal Makhani, Roti, Rice & Salad' },
  { day: 'Tue', meal: 'Rajma Masala, Jeera Aloo & Paratha' },
  { day: 'Wed', meal: 'Chole Masala, Veg Pulao & Roti' },
  { day: 'Thu', meal: 'Paneer Bhurji, Dal Tadka, Rice & Roti' },
  { day: 'Fri', meal: 'Palak Paneer, Black Chana & Paratha' },
  { day: 'Sat', meal: 'Kadhai Paneer, Veg Pulao & Roti' },
  { day: 'Sun', meal: 'Special Shahi Paneer, Butter Roti & Kheer' },
];

// ── Trust markers ─────────────────────────────────────────────────────
const TRUST = [
  { icon: <ShieldCheck size={22} />, text: 'FSSAI Certified Kitchen' },
  { icon: <Leaf size={22} />, text: 'No Artificial Preservatives' },
  { icon: <Package size={22} />, text: 'Eco-Friendly Packaging' },
  { icon: <PhoneCall size={22} />, text: '24×7 Customer Support' },
];

export default function Home() {
  const router = useRouter();
  const [todayDay] = useState(() => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]);
  const [branches, setBranches] = useState<any[]>([]);

  // Fetch branches for the "Find Us" section
  useEffect(() => {
    fetch('/api/branches/public')
      .then(r => r.ok ? r.json() : [])
      .then(data => Array.isArray(data) ? setBranches(data.slice(0, 4)) : setBranches([]))
      .catch(() => setBranches([]));
  }, []);

  return (
    <div className={styles.main}>

      {/* ── Top Promotional Slider ────────────────────────────────── */}
      <TopSlider />

      {/* ── Hero Section ─────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
        padding: '5rem 1.5rem 6rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(239,68,68,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '999px', padding: '0.4rem 1.25rem', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
            <Flame size={14} fill="#f87171" color="#f87171" /> Premium Homestyle Food Delivery
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, margin: '0 0 1.5rem 0' }}>
            Delicious Meals,{' '}
            <span style={{ background: 'linear-gradient(135deg, #f87171, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Delivered Fresh Daily.
            </span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Craving restaurant-quality food or a reliable daily tiffin service? We&apos;ve got you covered with hygienic, flavorful, and affordable meals.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="lg" variant="danger" onClick={() => router.push('/menu')} style={{ boxShadow: '0 8px 20px -4px rgba(239,68,68,0.5)' }}>
              <Utensils size={20} style={{ marginRight: '0.5rem' }} /> Order Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/tiffin')} style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.1)' }}>
              <CalendarCheck size={20} style={{ marginRight: '0.5rem' }} /> Explore Tiffins
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '2rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px' }}>
              <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Services ─────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#DC2626', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
              <Star size={16} fill="#DC2626" color="#DC2626" /> What We Offer
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 1rem 0' }}>
              Everything You Need, <span style={{ color: '#DC2626' }}>One Place.</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '560px', margin: '0 auto' }}>
              From quick delivery to daily meal subscriptions and dine-in reservations — we do it all.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {SERVICES.map((svc, i) => (
              <Card key={i} className="serviceCard">
                <CardContent>
                  <div style={{ padding: '2rem', cursor: 'pointer', transition: 'all 0.3s' }} onClick={() => router.push(svc.href)}>
                  <div style={{ width: '64px', height: '64px', background: svc.bg, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: svc.color, marginBottom: '1.5rem' }}>
                    {svc.icon}
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>{svc.title}</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>{svc.description}</p>
                  <span style={{ color: svc.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    {svc.cta} <ArrowRight size={16} />
                  </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Promotional Offers ───────────────────────────────────── */}
      <HomeOffers />

      {/* ── Tiffin Weekly Preview ────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#0f172a' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' }}>
                <CalendarCheck size={16} /> Daily Tiffin Plans
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.75rem)', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
                This Week&apos;s <span style={{ color: '#34d399' }}>Menu Preview</span>
              </h2>
              <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>
                Fresh home-cooked meals delivered every day. Subscribe once, eat well all week — Veg &amp; Non-Veg plans available.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {['No Preservatives', 'Daily Fresh', 'Veg & Non-Veg'].map(tag => (
                  <span key={tag} style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399', padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
              <Button size="lg" onClick={() => router.push('/tiffin')} style={{ background: '#34d399', color: '#0f172a' }}>
                Subscribe Now <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {WEEKLY_PREVIEW.map(d => (
                <div key={d.day} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  background: d.day === todayDay ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
                  border: d.day === todayDay ? '1px solid rgba(52,211,153,0.4)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '0.85rem 1.25rem',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ minWidth: '36px', fontWeight: 800, color: d.day === todayDay ? '#34d399' : '#475569', fontSize: '0.85rem' }}>{d.day}</span>
                  <span style={{ color: d.day === todayDay ? 'white' : '#94a3b8', fontSize: '0.9rem', fontWeight: d.day === todayDay ? 600 : 400 }}>{d.meal}</span>
                  {d.day === todayDay && <span style={{ marginLeft: 'auto', background: '#34d399', color: '#0f172a', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>TODAY</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────── */}
      <ServicesShowcase />

      {/* ── Trust Markers ────────────────────────────────────────── */}
      <section style={{ background: '#f8fafc', padding: '3rem 1.5rem', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {TRUST.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.25rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ color: '#DC2626' }}>{t.icon}</div>
              <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Find Us / Branches ───────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>
              <MapPin size={16} /> Our Locations
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 900, color: '#0f172a', margin: 0 }}>Find Your Nearest Branch</h2>
          </div>

          {branches.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {branches.map((b: any, i) => (
                <div key={b.id || i} style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '10px' }}>
                      <MapPin size={20} color="#3b82f6" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{b.name}</h3>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem', lineHeight: 1.5 }}>{b.address}</p>
                  <Link href={`/menu?branchId=${b.id}`} style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    View Menu <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              No branch locations found in your area right now.
            </div>
          )}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #DC2626 0%, #dc2626 50%, #b91c1c 100%)',
        padding: '5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '1rem' }}>
            Ready to Eat Something Delicious?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            Explore our full menu or subscribe to a daily tiffin plan — fresh meals, every single day.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="lg" onClick={() => router.push('/menu')} style={{ background: 'white', color: '#DC2626', boxShadow: '0 8px 20px rgba(0,0,0,0.2)' }}>
              <Utensils size={20} style={{ marginRight: '8px' }} /> Explore Menu
            </Button>
            <Button size="lg" onClick={() => router.push('/tiffin')} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.4)' }}>
              <CalendarCheck size={20} style={{ marginRight: '8px' }} /> Subscribe Tiffin
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
