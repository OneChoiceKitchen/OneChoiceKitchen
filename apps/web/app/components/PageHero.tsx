import React from 'react';
import styles from '../page.module.css';
import { Star } from 'lucide-react';

interface PageHeroProps {
  badgeText: string;
  badgeIcon?: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  children?: React.ReactNode;
  background?: 'gradient' | 'solid';
}

export default function PageHero({
  badgeText,
  badgeIcon = <Star size={16} fill="currentColor" />,
  title,
  subtitle,
  children,
  background = 'gradient'
}: PageHeroProps) {
  return (
    <section className={styles.hero} style={background === 'solid' ? { background: '#f8fafc' } : undefined}>
      {background === 'gradient' && <div className={styles.heroBackground}></div>}
      
      <div className={styles.badge}>
        {badgeIcon} {badgeText}
      </div>

      <h1 className={styles.title}>
        {title}
      </h1>

      <p className={styles.subtitle}>
        {subtitle}
      </p>

      {children && (
        <div className={styles.ctas}>
          {children}
        </div>
      )}
    </section>
  );
}
