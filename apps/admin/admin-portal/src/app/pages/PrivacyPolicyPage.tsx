import React, { useState } from 'react';

const sections = [
  {
    id: 'overview', title: '1. Overview', icon: '🔒',
    content: `OneChoiceKitchen ("we", "us", "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform — including the web portal, mobile applications, and APIs. By using our services, you consent to the practices described in this policy.`,
  },
  {
    id: 'collection', title: '2. Information We Collect', icon: '📋',
    content: `We collect information you provide directly:\n• Account Information: name, email address, phone number, profile photo\n• Business Information: restaurant name, GSTIN, PAN, bank account details\n• Transaction Data: orders placed, payments processed, refund history\n• Communication: support tickets, reviews, feedback messages\n\nWe automatically collect:\n• Usage Data: pages visited, features used, session duration\n• Device Information: IP address, browser type, OS, device identifiers\n• Location Data: delivery addresses, GPS coordinates (with permission)\n• Cookies and Tracking: session identifiers, preferences, analytics`,
  },
  {
    id: 'usage', title: '3. How We Use Your Information', icon: '⚙️',
    content: `We use collected information to:\n• Process and fulfill orders\n• Manage restaurant accounts and partner relationships\n• Send transactional notifications (OTP, order confirmations, delivery updates)\n• Provide customer support and resolve disputes\n• Improve our platform through analytics and A/B testing\n• Comply with legal obligations and prevent fraud\n• Send marketing communications (with your consent)\n• Calculate and process payouts to restaurant partners`,
  },
  {
    id: 'sharing', title: '4. Information Sharing', icon: '🤝',
    content: `We do not sell your personal information. We share data with:\n• Delivery Partners: name, phone, delivery address for order fulfillment\n• Payment Processors: Razorpay, for payment processing\n• Communication Providers: MSG91, SendGrid for SMS/email delivery\n• Analytics Providers: for platform improvement (anonymized)\n• Legal Authorities: when required by law or to protect rights\n• Business Transfers: in case of merger, acquisition, or asset sale`,
  },
  {
    id: 'security', title: '5. Data Security', icon: '🛡️',
    content: `We implement industry-standard security measures:\n• AES-256 encryption for data at rest\n• TLS 1.3 for data in transit\n• Regular security audits and penetration testing\n• Role-based access control (RBAC)\n• Multi-factor authentication for admin accounts\n• Automated threat detection and incident response\n• SOC 2 Type II compliance roadmap`,
  },
  {
    id: 'rights', title: '6. Your Rights', icon: '⚖️',
    content: `Under applicable data protection laws, you have the right to:\n• Access: request a copy of your personal data\n• Correction: update inaccurate or incomplete data\n• Deletion: request erasure of your personal data\n• Portability: receive your data in a structured format\n• Restriction: limit how we process your data\n• Objection: opt out of marketing communications\n• Withdrawal: revoke consent at any time\n\nTo exercise these rights, contact us at privacy@onechoicekitchen.com`,
  },
  {
    id: 'retention', title: '7. Data Retention', icon: '🗂️',
    content: `We retain personal data for:\n• Account data: duration of active account + 3 years post-closure\n• Transaction records: 7 years (for tax and legal compliance)\n• Support communications: 2 years\n• Analytics data: 2 years (anonymized after 90 days)\n• Legal hold data: indefinitely until legal matter is resolved`,
  },
  {
    id: 'cookies', title: '8. Cookies Policy', icon: '🍪',
    content: `We use the following types of cookies:\n• Essential: required for platform functionality (login, session)\n• Preference: remember your settings and language choices\n• Analytics: measure platform performance (Google Analytics)\n• Marketing: serve relevant advertisements (with consent)\n\nYou can manage cookie preferences in your browser settings or through our Cookie Preference Center.`,
  },
  {
    id: 'children', title: '9. Children\'s Privacy', icon: '👶',
    content: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately at privacy@onechoicekitchen.com and we will promptly delete such information.`,
  },
  {
    id: 'changes', title: '10. Changes to This Policy', icon: '📢',
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes via:\n• Email to your registered address\n• In-app notification\n• Banner on our website\n\nContinued use of our platform after changes constitutes acceptance. The "Last Updated" date at the top reflects the most recent revision.`,
  },
  {
    id: 'contact', title: '11. Contact Us', icon: '📞',
    content: `For privacy-related queries or to exercise your rights:\n• Email: privacy@onechoicekitchen.com\n• Data Protection Officer: dpo@onechoicekitchen.com\n• Postal: OneChoiceKitchen Pvt. Ltd., Privacy Team, [Address]\n• Response time: Within 30 days of receiving your request`,
  },
];

export function PrivacyPolicyPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🔒 Privacy Policy</h1>
          <p className="page-subtitle">
            Last updated: July 1, 2026 · Effective: July 1, 2026 · Version 2.1
          </p>
        </div>
        <div className="page-actions">
          <a
            href="mailto:privacy@onechoicekitchen.com"
            className="btn btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Contact Privacy Team
          </a>
        </div>
      </div>

      {/* Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #eff6ff, #f0fdf4)',
        border: '1px solid #bfdbfe', borderRadius: 12,
        padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        display: 'flex', gap: '1rem', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '2rem', flexShrink: 0 }}>ℹ️</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e40af', marginBottom: '0.25rem' }}>
            Your Privacy Matters to Us
          </p>
          <p style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
            We collect only what we need, protect it with industry-standard security, and give you full control over your data.
            We never sell your personal information to third parties.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {sections.map(sec => (
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
              <span style={{ color: 'var(--text3)', fontSize: '0.8rem', transition: 'transform 0.2s', transform: active === sec.id ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block' }}>
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

      {/* Footer Note */}
      <div style={{
        marginTop: '2rem', padding: '1rem 1.25rem',
        background: 'var(--surf)', borderRadius: 10, border: '1px solid var(--bdr)',
        fontSize: '0.78rem', color: 'var(--text2)', lineHeight: 1.7,
      }}>
        <strong style={{ color: 'var(--text)' }}>OneChoiceKitchen Pvt. Ltd.</strong> is registered in India.
        This policy is governed by the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023 (DPDPA).
        For inquiries, email <a href="mailto:privacy@onechoicekitchen.com" style={{ color: 'var(--blue)' }}>privacy@onechoicekitchen.com</a>.
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
