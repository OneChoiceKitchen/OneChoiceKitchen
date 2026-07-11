'use client';
import React, { useState, useEffect } from 'react';
import styles from "../page.module.css";
import Link from "next/link";
import { Gift, Award, ArrowRight, CheckCircle2, History, TrendingUp, HelpCircle } from 'lucide-react';
import { BrandHeader, useConfirm } from '@org/ui-design-system';
import { useGlobalContext } from '../context/GlobalContext';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: string;
  code: string;
}

interface Tier {
  id: string;
  name: string;
  min_points_required: number;
  points_multiplier: number;
  discount_percentage: number;
}

interface PointsHistory {
  id: string;
  action: string;
  points: number;
  date: string;
  type: 'earn' | 'redeem';
}

const DEFAULT_TIERS: Tier[] = [
  { id: 'tier-1', name: 'Bronze', min_points_required: 0, points_multiplier: 1.0, discount_percentage: 0 },
  { id: 'tier-2', name: 'Silver', min_points_required: 500, points_multiplier: 1.2, discount_percentage: 5 },
  { id: 'tier-3', name: 'Gold', min_points_required: 1500, points_multiplier: 1.5, discount_percentage: 10 },
  { id: 'tier-4', name: 'Platinum', min_points_required: 3000, points_multiplier: 2.0, discount_percentage: 15 }
];





export default function LoyaltyPage() {
  const [points, setPoints] = useState<number>(0);
  const [currentTier, setCurrentTier] = useState<string>('Bronze');
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const confirmDialog = useConfirm();
  
  const { loggedIn, setLoginModalOpen } = useGlobalContext();

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      // Fetch user points and history
      fetch(`/api/loyalty/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.points !== undefined) setPoints(data.points);
          if (data.history) setHistory(data.history);
        })
        .catch(err => console.error("Error fetching loyalty data:", err));
    }

    // Fetch Rewards Catalog
    fetch('/api/loyalty/rewards')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRewards(data);
      })
      .catch(err => console.error("Error fetching rewards:", err));
  }, [loggedIn]);

  // Recalculate Tier dynamically based on current points
  useEffect(() => {
    let tierName = 'Bronze';
    for (let i = DEFAULT_TIERS.length - 1; i >= 0; i--) {
      if (points >= DEFAULT_TIERS[i].min_points_required) {
        tierName = DEFAULT_TIERS[i].name;
        break;
      }
    }
    setCurrentTier(tierName);
  }, [points]);



  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!loggedIn) {
      setLoginModalOpen(true);
      return;
    }
    if (points < reward.pointsRequired) {
      showToast('❌ Not enough points for this reward.');
      return;
    }

    const ok = await confirmDialog({
      title: 'Confirm Redemption',
      message: `Are you sure you want to redeem ${reward.name} for ${reward.pointsRequired} points?`
    });
    if (!ok) return;

    const token = localStorage.getItem('customer_token');
    fetch('/api/loyalty/redeem/me', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rewardId: reward.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPoints(data.newBalance);
          
          // Re-fetch history
          fetch(`/api/loyalty/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
            .then(res => res.json())
            .then(userData => {
              if (userData.history) setHistory(userData.history);
            });
            
          showToast(`🎉 Redeemed successfully! Your coupon code is: ${reward.code}`);
        } else {
          showToast(`❌ Error: ${data.message || 'Redemption failed'}`);
        }
      })
      .catch(err => {
        console.error("Redeem error:", err);
        showToast('❌ Something went wrong.');
      });
  };

  const currentTierData = DEFAULT_TIERS.find(t => t.name === currentTier) || DEFAULT_TIERS[0];
  const nextTier = DEFAULT_TIERS.find(t => t.min_points_required > points);
  const progressToNext = nextTier 
    ? ((points - currentTierData.min_points_required) / (nextTier.min_points_required - currentTierData.min_points_required)) * 100
    : 100;

  return (
    <div className={styles.main} style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'var(--font-body)' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: '12px',
          boxShadow: 'rgba(0, 0, 0, 0.15) 0px 10px 30px',
          zIndex: 9999,
          fontWeight: 600,
          borderLeft: '4px solid #e60000',
          transition: 'all 0.3s ease'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Main Dashboard Hero */}
      <div style={{ maxWidth: '1200px', margin: '3rem auto', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
          <div>
            <span style={{ color: '#e60000', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>One Choice Rewards</span>
            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, color: '#2563EB', marginTop: '0.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', lineHeight: '1.1' }}>
              Your Loyalty <span style={{ color: '#e60000' }}>Dashboard</span>
            </h1>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Earn points automatically with every meal and tiffin subscription, level up through VIP tiers, and unlock exclusive high-value treats and coupon codes.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href="#rewards" style={{ textDecoration: 'none' }}>
                <button className={styles.primaryBtn}>Redeem Rewards Now</button>
              </a>
              <a href="#history" style={{ textDecoration: 'none' }}>
                <button className={styles.secondaryBtn}>View Point Logs</button>
              </a>
            </div>
          </div>

          {/* Platinum / Gold Card */}
          <div style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #e60000 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: 'rgba(0, 56, 147, 0.2) 0px 20px 40px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
              <div>
                <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', margin: 0 }}>Membership Status</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  👑 {currentTier} Tier
                </h3>
              </div>
              <span style={{ fontSize: '2.5rem' }}>⭐</span>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '2px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', margin: '0 0 0.5rem' }}>Total Available Balance</p>
                {loggedIn ? (
                  <h2 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '1rem 0', letterSpacing: '-1px' }}>
                    {points} <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#f8fafc' }}>pts</span>
                  </h2>
                ) : (
                  <div style={{ margin: '1rem 0' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
                      🔒 Sign in to view
                    </h2>
                    <button 
                      onClick={() => setLoginModalOpen(true)}
                      style={{ background: 'white', color: '#2563EB', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, marginTop: '0.5rem', cursor: 'pointer' }}
                    >
                      Login Now
                    </button>
                  </div>
                )}
            </div>

            {nextTier ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  <span>{points} / {nextTier.min_points_required} Points</span>
                  <span>{nextTier.min_points_required - points} pts to {nextTier.name} 🚀</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progressToNext}%`, height: '100%', background: '#ffffff', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.75rem 1rem', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                🎉 You are at the absolute maximum VIP Tier! Enjoy 2x multiplier!
              </div>
            )}
          </div>
        </div>

        {/* Tier benefits list grid */}
        <section style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563EB', marginBottom: '2rem', textAlign: 'center' }}>🔥 Membership Level Benefits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {DEFAULT_TIERS.map(tier => {
              const isActive = tier.name === currentTier;
              return (
                <div key={tier.id} style={{
                  background: '#ffffff',
                  border: isActive ? '2.5px solid #2563EB' : '1px solid rgba(0, 56, 147, 0.08)',
                  boxShadow: isActive ? 'rgba(0, 56, 147, 0.1) 0px 10px 30px' : 'none',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  position: 'relative',
                  transform: isActive ? 'scale(1.03)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      top: '-13px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#2563EB',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px'
                    }}>
                      Current
                    </span>
                  )}
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: isActive ? '#2563EB' : '#475569', marginBottom: '0.5rem' }}>{tier.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Requires {tier.min_points_required} points</p>
                  
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Points Multiplier:</span>
                      <strong>{tier.points_multiplier}x</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Base Discount:</span>
                      <strong>{tier.discount_percentage}%</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Rewards Store Catalog */}
        <section id="rewards" style={{ marginBottom: '5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2.5rem' }}>
            <div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563EB' }}>🎁 Rewards Store Catalogue</h2>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Spend your points on standard coupons, vouchers, and premium items.</p>
            </div>
            <div style={{ background: 'rgba(0, 56, 147, 0.05)', border: '1px solid rgba(0, 56, 147, 0.1)', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 'bold' }}>
              Balance: <span style={{ color: '#e60000' }}>{points} pts</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {rewards.map(reward => {
              const canAfford = points >= reward.pointsRequired;
              return (
                <div key={reward.id} style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 56, 147, 0.08)',
                  borderRadius: '20px',
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'rgba(0, 56, 147, 0.02) 0px 4px 12px',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                className={canAfford ? styles.cardHover : ''}
                onMouseEnter={(e: any) => {
                  if (canAfford) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = 'rgba(0, 56, 147, 0.06) 0px 12px 24px';
                  }
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'rgba(0, 56, 147, 0.02) 0px 4px 12px';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '2rem' }}>🎁</span>
                    <div style={{ background: 'rgba(230, 0, 0, 0.05)', color: '#e60000', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem', display: 'inline-block' }}>
                      {reward.pointsRequired || (reward as any).points_required} Points
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>{reward.name}</h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5', flex: 1, marginBottom: '2rem' }}>{reward.description}</p>
                  
                  <button
                    disabled={!canAfford}
                    onClick={() => handleRedeem(reward)}
                    style={{
                      width: '100%',
                      padding: '0.8rem',
                      background: canAfford ? 'var(--accent-gradient)' : '#e2e8f0',
                      color: canAfford ? 'white' : '#94a3b8',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 'bold',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                  >
                    {canAfford ? 'Redeem Item' : `Need ${(reward.pointsRequired || (reward as any).points_required) - points} More Points`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Point ledger transaction history */}
        <section id="history" style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563EB', marginBottom: '1.5rem' }}>📋 Points Transaction Ledger</h2>
          <div style={{ background: '#ffffff', border: '1px solid rgba(0, 56, 147, 0.08)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'rgba(0, 56, 147, 0.02) 0px 4px 12px' }}>
            {loggedIn ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 56, 147, 0.03)', borderBottom: '1px solid rgba(0, 56, 147, 0.08)', color: '#475569' }}>
                    <th style={{ padding: '1.2rem 1.5rem' }}>Date</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}>Action Description</th>
                    <th style={{ padding: '1.2rem 1.5rem' }}>Type</th>
                    <th style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr key={h.id} style={{ borderBottom: i < history.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <td style={{ padding: '1.2rem 1.5rem', color: '#64748b' }}>{h.date}</td>
                      <td style={{ padding: '1.2rem 1.5rem', fontWeight: 600 }}>{h.action}</td>
                      <td style={{ padding: '1.2rem 1.5rem' }}>
                        <span style={{
                          background: h.type === 'earn' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: h.type === 'earn' ? '#10b981' : '#DC2626',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {h.type === 'earn' ? 'Earned' : 'Spent'}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right', fontWeight: 'bold', color: h.type === 'earn' ? '#10b981' : '#DC2626' }}>
                        {h.type === 'earn' ? `+${h.points}` : `-${h.points}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed var(--card-border)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#334155' }}>Sign in to view history</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Your points transaction history will appear here once you log in.</p>
                <button onClick={() => setLoginModalOpen(true)} style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Sign In
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
          {/* GLOBAL FOOTER */}
      {/* Global Footer */}
</div>
  );
}



