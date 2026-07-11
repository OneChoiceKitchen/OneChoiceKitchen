import React, { useState } from 'react';

const terms = [
  { id: 'acceptance', icon: '✅', title: '1. Acceptance of Terms',
    content: `By accessing or using OneChoiceKitchen's platform, mobile applications, or APIs, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our services. These terms apply to all users, including administrators, restaurant partners, riders, and customers.` },
  { id: 'accounts', icon: '👤', title: '2. User Accounts',
    content: `2.1 Account Registration: You must provide accurate, complete, and current information when creating an account.\n2.2 Account Security: You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.\n2.3 Prohibited Sharing: Account credentials must not be shared with unauthorized third parties.\n2.4 Account Suspension: We reserve the right to suspend or terminate accounts that violate these terms.\n2.5 Notification: You must notify us immediately of any unauthorized use of your account.` },
  { id: 'services', icon: '🍽️', title: '3. Platform Services',
    content: `OneChoiceKitchen provides:\n• Food ordering and delivery management platform\n• Restaurant management tools (POS, inventory, menu management)\n• Rider dispatch and tracking system\n• Customer-facing ordering interfaces\n• Analytics and reporting dashboards\n• Payment processing facilitation\n\nServices are provided "as is" and may be modified, discontinued, or updated without prior notice.` },
  { id: 'orders', icon: '🛍️', title: '4. Orders and Payments',
    content: `4.1 Order Placement: Orders placed through the platform constitute binding agreements between customers and restaurant partners.\n4.2 Payment Processing: All payments are processed by Razorpay (our payment gateway partner) and are subject to their terms.\n4.3 Cancellations: Orders may be cancelled per our Cancellation Policy.\n4.4 Refunds: Refunds are processed as per our Refund Policy, typically within 5-7 business days.\n4.5 Pricing: Prices are set by restaurant partners and may change without notice.\n4.6 Taxes: All applicable GST/taxes are included in displayed prices.` },
  { id: 'partners', icon: '🤝', title: '5. Restaurant Partner Obligations',
    content: `Restaurant partners agree to:\n• Maintain FSSAI certification and all required licenses\n• Ensure food quality and safety standards are met\n• Fulfill orders within the committed preparation time\n• Maintain accurate menu information including allergens\n• Process refunds for valid customer complaints\n• Comply with all applicable food safety regulations\n• Not engage in fraudulent activities or misrepresentation` },
  { id: 'ip', icon: '©️', title: '6. Intellectual Property',
    content: `6.1 Platform IP: The OneChoiceKitchen platform, including all software, designs, logos, and content, is owned by OneChoiceKitchen Pvt. Ltd. and protected by copyright, trademark, and other laws.\n6.2 License: We grant you a limited, non-exclusive, non-transferable license to use our platform for its intended purpose.\n6.3 Restrictions: You may not copy, modify, distribute, sell, or lease any part of our platform without written permission.\n6.4 User Content: By submitting reviews or content, you grant us a worldwide license to use, display, and distribute it.` },
  { id: 'liability', icon: '⚖️', title: '7. Limitation of Liability',
    content: `To the maximum extent permitted by law:\n• OneChoiceKitchen is not liable for indirect, incidental, or consequential damages\n• Our total liability shall not exceed the amount paid by you in the last 12 months\n• We are not responsible for third-party service failures\n• We are not liable for losses due to unauthorized account access beyond our control\n• Force majeure events (natural disasters, network outages) exclude our liability` },
  { id: 'termination', icon: '🚪', title: '8. Termination',
    content: `8.1 By You: You may close your account at any time through account settings.\n8.2 By Us: We may terminate or suspend your account with or without notice for violations of these terms.\n8.3 Effect: Upon termination, your right to use the platform ceases. Data deletion follows our Privacy Policy retention schedule.\n8.4 Survival: Provisions relating to IP, liability, and dispute resolution survive termination.` },
  { id: 'disputes', icon: '🏛️', title: '9. Dispute Resolution',
    content: `9.1 Good Faith: Both parties agree to attempt resolution through good-faith negotiation for 30 days.\n9.2 Arbitration: Unresolved disputes shall be settled by arbitration under the Arbitration and Conciliation Act, 1996.\n9.3 Jurisdiction: These terms are governed by the laws of India. Courts in [City] have exclusive jurisdiction.\n9.4 Class Action Waiver: You waive your right to participate in class action lawsuits.` },
  { id: 'changes', icon: '📢', title: '10. Changes to Terms',
    content: `We reserve the right to update these terms at any time. Changes are effective upon posting. We will notify users of material changes via email or in-app notification. Continued use of the platform after changes constitutes acceptance of the new terms.` },
];

export function TermsOfServicePage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">📜 Terms of Service</h1>
          <p className="page-subtitle">
            Last updated: July 1, 2026 · Version 3.0 · Please read carefully before using our platform
          </p>
        </div>
        <div className="page-actions">
          <a
            href="mailto:legal@onechoicekitchen.com"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Contact Legal Team
          </a>
        </div>
      </div>

      {/* Notice Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #fefce8, #fff7ed)',
        border: '1px solid #fde68a', borderRadius: 12,
        padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>⚠️</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92400e', marginBottom: '0.25rem' }}>
            Binding Legal Agreement
          </p>
          <p style={{ fontSize: '0.82rem', color: '#713f12', lineHeight: 1.6, margin: 0 }}>
            These Terms of Service constitute a legally binding agreement between you and OneChoiceKitchen Pvt. Ltd.
            By using our platform, you confirm that you have read, understood, and agree to these terms.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {terms.map(sec => (
          <div key={sec.id} style={{
            background: 'var(--surf)', border: '1px solid var(--bdr)',
            borderRadius: 10, overflow: 'hidden',
          }}>
            <button
              onClick={() => setActive(active === sec.id ? null : sec.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '1rem 1.25rem', background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{sec.icon}</span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
                {sec.title}
              </span>
              <span style={{ color: 'var(--text3)', fontSize: '0.8rem', transform: active === sec.id ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </button>
            {active === sec.id && (
              <div style={{ padding: '0 1.25rem 1.25rem 3.25rem' }}>
                <div style={{ width: '100%', height: 1, background: 'var(--bdr)', marginBottom: '0.875rem' }} />
                <p style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                  {sec.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '2rem', padding: '1rem 1.25rem',
        background: 'var(--surf)', borderRadius: 10, border: '1px solid var(--bdr)',
        fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.7,
      }}>
        For legal inquiries: <a href="mailto:legal@onechoicekitchen.com" style={{ color: 'var(--blue)' }}>legal@onechoicekitchen.com</a>
        {' '}· OneChoiceKitchen Pvt. Ltd., Registered in India · CIN: [Company Identification Number]
      </div>
    </div>
  );
}

export default TermsOfServicePage;
