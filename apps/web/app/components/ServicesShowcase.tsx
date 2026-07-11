'use client';
import React from 'react';
import styles from './ServicesShowcase.module.css';
import { Rocket, ShieldCheck, HeartPulse, ChefHat, CheckCircle2, Star, Clock, Leaf, Briefcase, Utensils, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ServicesShowcase() {
  const services = [
    {
      icon: <Rocket size={40} strokeWidth={1.5} />,
      title: "Lightning Fast Delivery",
      description: <>Our dedicated rider network ensures your food arrives hot and fresh, usually within <span style={{color: '#DC2626', fontWeight: 700}}>30 minutes.</span></>,
      footerIcon: <Clock size={16} />,
      footerText: "Real-time tracking included",
      color: "#DC2626",
      bgLight: "#fef2f2",
      bgGradient: "linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)"
    },
    {
      icon: <ShieldCheck size={40} strokeWidth={1.5} />,
      title: "Premium Hygiene",
      description: "We follow strict protocols. Our cloud kitchens are sanitized hourly, and staff undergo daily health checks for your safety.",
      footerIcon: <ShieldCheck size={16} />,
      footerText: "Your safety, our priority",
      color: "#10b981",
      bgLight: "#ecfdf5",
      bgGradient: "linear-gradient(180deg, #ecfdf5 0%, #ffffff 100%)"
    },
    {
      icon: <HeartPulse size={40} strokeWidth={1.5} />,
      title: "Fresh & Healthy",
      description: "No preservatives. No artificial colors. We source organic vegetables daily to give you meals that are as healthy as home-cooked food.",
      footerIcon: <Leaf size={16} />,
      footerText: "Clean ingredients, better you",
      color: "#f59e0b",
      bgLight: "#fffbeb",
      bgGradient: "linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)"
    },
    {
      icon: <ChefHat size={40} strokeWidth={1.5} />,
      title: "Corporate & Tiffins",
      description: "Custom meal plans tailored to your dietary needs. Subscribe for daily tiffins or book us for corporate catering.",
      footerIcon: <Briefcase size={16} />,
      footerText: "Built for teams & businesses",
      color: "#3b82f6",
      bgLight: "#eff6ff",
      bgGradient: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)"
    }
  ];

  return (
    <section className={styles.showcaseSection}>
      <div className={styles.container}>
        
        {/* Header Block */}
        <div className={styles.header}>
          <div className={styles.badge}>
            <Star size={14} color="#DC2626" fill="#DC2626" /> Why Choose Us
          </div>
          <h2 className={styles.title}>
            <span className={styles.titleDark}>More Than </span>
            <span className={styles.titleRed}>Just Food Delivery</span>
          </h2>
          
          <div className={styles.divider}>
            <div className={styles.line}></div>
            <ChefHat size={20} className={styles.dividerIcon} />
            <div className={styles.line}></div>
          </div>
          
          <p className={styles.subtitle}>
            We've completely reimagined the cloud kitchen experience to bring you unparalleled quality, speed, and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className={styles.grid}>
          {services.map((svc, idx) => (
            <div key={idx} className={styles.card} style={{ borderBottomColor: svc.color }}>
              <div className={styles.cardContent}>
                <div className={styles.iconArea} style={{ background: svc.bgGradient }}>
                  <div className={styles.iconCircle} style={{ color: svc.color, backgroundColor: svc.bgLight }}>
                    {svc.icon}
                  </div>
                  {/* CSS-based sparkles to mimic the design */}
                  <div className={styles.sparkle1} style={{ color: svc.color }}>✦</div>
                  <div className={styles.sparkle2} style={{ color: svc.color }}>✦</div>
                  <div className={styles.sparkle3} style={{ color: svc.color }}>✦</div>
                </div>
                <h3 className={styles.cardTitle}>{svc.title}</h3>
                <p className={styles.cardDesc}>{svc.description}</p>
              </div>
              <div className={styles.cardFooter} style={{ backgroundColor: svc.bgLight, color: svc.color }}>
                {svc.footerIcon}
                <span className={styles.footerText}>{svc.footerText}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className={styles.ctaWrapper}>
          <div className={styles.ctaBox}>
            <div className={styles.ctaDashedBorder}>
              <div className={styles.ctaLeft}>
                <div className={styles.ctaIconBadge}>
                  <Utensils size={36} color="#DC2626" />
                  {/* Action lines */}
                  <div className={styles.actionLine} style={{ top: '-10px', left: '10px', transform: 'rotate(-45deg)' }}></div>
                  <div className={styles.actionLine} style={{ top: '-15px', right: '30px', transform: 'rotate(15deg)' }}></div>
                  <div className={styles.actionLine} style={{ right: '-15px', top: '20px', transform: 'rotate(70deg)' }}></div>
                </div>
                
                <div className={styles.ctaTextContent}>
                  <h3>
                    Ready to <span style={{ color: '#fbbf24' }}>taste the difference?</span>
                  </h3>
                  <p>Explore our wide range of handcrafted dishes or subscribe to a daily tiffin plan.</p>
                  
                  <div className={styles.checkmarksList}>
                    <div className={styles.checkItem}>
                      <CheckCircle2 size={16} color="#DC2626" fill="#DC2626" stroke="white" />
                      <span>Freshly Prepared</span>
                    </div>
                    <div className={styles.checkDivider}>|</div>
                    <div className={styles.checkItem}>
                      <CheckCircle2 size={16} color="#DC2626" fill="#DC2626" stroke="white" />
                      <span>Hygienic & Safe</span>
                    </div>
                    <div className={styles.checkDivider}>|</div>
                    <div className={styles.checkItem}>
                      <CheckCircle2 size={16} color="#DC2626" fill="#DC2626" stroke="white" />
                      <span>On-Time Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.ctaRight}>
                <Link href="/menu" className={styles.ctaButton}>
                  Explore Menu <ArrowRight size={20} />
                </Link>
                <div className={styles.handwritingText}>
                  Good food is just a click away!
                  <svg className={styles.underlineSwoosh} width="120" height="15" viewBox="0 0 120 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 13C25.5 4.5 75 -2.5 118 7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
