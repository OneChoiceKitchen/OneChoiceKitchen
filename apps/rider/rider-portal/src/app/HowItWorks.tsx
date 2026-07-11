import React from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const getCardDetails = (id: string) => {
  switch (id) {
    case 'r1': // Surge Pricing
      return [
        "Earn up to 1.5x during lunch (12 PM - 2 PM) and dinner (7 PM - 10 PM) peaks.",
        "Surge multipliers automatically apply to your base delivery fee.",
        "Check the app dashboard daily for live surge zones in your city."
      ];
    case 'r2': // Safety Guidelines
      return [
        "Always wear your helmet and reflective gear during night deliveries.",
        "Maintain contactless delivery protocols when requested by the customer.",
        "Sanitize your delivery bag at the start of every shift."
      ];
    case 'r3': // Vehicle Maintenance
      return [
        "Regularly check tire pressure and brakes to ensure maximum safety.",
        "One Choice Kitchen partners with local garages for discounted oil changes.",
        "Report any vehicle breakdowns immediately via the SOS button in the app."
      ];
    case 'r4': // Rider Support
      return [
        "Our dedicated Rider Support team is available 24/7 via the in-app chat.",
        "For critical on-road emergencies, call the toll-free hotline: 1800-555-0199.",
        "Visit the local hub between 10 AM and 5 PM for in-person assistance."
      ];
    case 'r5': // Weekly Bonuses
      return [
        "Complete 50 deliveries in a single week (Mon-Sun) to unlock a ₹500 bonus.",
        "Maintain a customer rating of 4.5 or higher to qualify for bonus payouts.",
        "Bonuses are credited automatically to your weekly payout statement."
      ];
    case 'r6': // Refer a Friend
      return [
        "Share your unique referral code from the 'My Profile' section.",
        "Earn ₹1000 for every friend who signs up and completes 20 deliveries.",
        "There is no limit to the number of friends you can refer!"
      ];
    case 'r7': // Customer Etiquette
      return [
        "Always greet the customer politely and verify their name before handing over the food.",
        "Handle food packages with care to prevent spills or damage.",
        "Never ask customers directly for ratings; let your excellent service speak for itself."
      ];
    case 'r8': // Health & Insurance
      return [
        "All active riders are covered by a complimentary ₹5 Lakh accidental insurance policy.",
        "Coverage includes hospital stays and out-patient treatments for on-duty accidents.",
        "You must complete at least 10 deliveries a week to keep your insurance active."
      ];
    default:
      return [
        "Ensure you have the latest version of the Rider App installed.",
        "Follow all local traffic and safety regulations.",
        "Contact support immediately if you face any issues during delivery."
      ];
  }
};

export default function HowItWorks({ activeCard, onBack }: { activeCard: any, onBack: () => void }) {
  if (!activeCard) {
    return (
      <div style={{ paddingBottom: '2rem' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '1rem' }}>How It Works</h2>
        <p style={{ color: '#475569', marginBottom: '2rem' }}>Select a topic from the dashboard to view detailed information.</p>
        <button 
          onClick={onBack}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            padding: '0.75rem 1.5rem', background: '#2563EB', color: 'white', 
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <button 
        onClick={onBack}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem', 
          padding: '0.5rem 1rem', background: '#f1f5f9', color: '#475569', 
          border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', 
          fontWeight: 600, marginBottom: '2rem', transition: 'all 0.2s'
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <div style={{ 
        background: 'white', borderRadius: '16px', overflow: 'hidden', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' 
      }}>
        {activeCard.imageUrl && (
          <div style={{ 
            width: '100%', height: '250px', backgroundImage: `url(${activeCard.imageUrl})`, 
            backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))' }}></div>
            <h1 style={{ position: 'absolute', bottom: '1.5rem', left: '2rem', margin: 0, color: 'white', fontSize: '2.5rem', fontWeight: 800 }}>
              {activeCard.title}
            </h1>
          </div>
        )}
        
        <div style={{ padding: '2rem' }}>
          <p style={{ fontSize: '1.2rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem' }}>
            {activeCard.description}
          </p>

          <h3 style={{ color: '#0f172a', marginBottom: '1.25rem', fontSize: '1.25rem' }}>Important Details:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {getCardDetails(activeCard.id).map((detail, idx) => (
              <li key={idx} style={{ 
                display: 'flex', alignItems: 'flex-start', gap: '1rem', 
                color: '#334155', fontSize: '1.05rem', lineHeight: 1.5,
                background: '#f8fafc', padding: '1rem', borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <CheckCircle color="#2563EB" size={24} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
