import React, { useState } from 'react';

const faqs = [
  {
    cat: '🛍️ Orders', items: [
      { q: 'How do I cancel an order?', a: 'Orders can be cancelled within 2 minutes of placement through the Orders module. After that window, contact support with the order ID.' },
      { q: 'Why is an order stuck in "Preparing" status?', a: 'Contact the restaurant directly via the partner contact. If unresponsive for >30 minutes, escalate via the Orders > Escalate option.' },
      { q: 'How long does a refund take?', a: 'Refunds are processed within 2-3 business days. The amount appears in the original payment method within 5-7 business days.' },
    ],
  },
  {
    cat: '🔐 Account & Access', items: [
      { q: 'I forgot my admin password', a: 'Use the "Forgot Password" link on the login screen. A reset email will be sent to your registered email address.' },
      { q: 'How do I add a new admin user?', a: 'Go to Settings > Roles > Create Role, then Users > Add User and assign the role. See the Roles module for permission details.' },
      { q: 'Why am I getting "Access Denied"?', a: 'Your role may not have permission for that module. Contact your super admin to update your role permissions.' },
    ],
  },
  {
    cat: '💳 Payments & Payouts', items: [
      { q: 'A partner payout is delayed', a: 'Check Finance > Payouts for the payout status. If status is "Pending" >48h, contact Razorpay support or raise a ticket here.' },
      { q: 'How do I set up Razorpay?', a: 'Go to Settings > Payment Configuration. Enter your Razorpay API Key and Secret. Test with a ₹1 transaction before going live.' },
      { q: 'How are platform fees calculated?', a: 'Platform fees are configured in Settings > Subscription Plans. Default commission is set per partner agreement.' },
    ],
  },
  {
    cat: '🚚 Delivery & Riders', items: [
      { q: 'A rider is not picking up an order', a: 'Check the active rider list in the Riders module. Use the "Re-assign Rider" action from the order detail page.' },
      { q: 'How do I update delivery zones?', a: 'Go to Branches > [Branch Name] > Delivery Zones. Draw or update the delivery radius on the map.' },
      { q: 'Why is the rider app not tracking location?', a: 'Ensure the rider has granted location permissions to the app. Check Settings > Maps Configuration for API key validity.' },
    ],
  },
];

const channels = [
  { icon: '📧', label: 'Email Support', value: 'support@onechoicekitchen.com', sub: 'Response within 24 hours', color: '#2563EB', action: 'mailto:support@onechoicekitchen.com' },
  { icon: '📞', label: 'Phone Support', value: '+91-1800-XXX-XXXX', sub: 'Mon–Sat, 9 AM–6 PM IST', color: '#16a34a', action: 'tel:+911800XXXXXXXX' },
  { icon: '💬', label: 'Live Chat', value: 'Open Chat Widget', sub: 'Available during business hours', color: '#7c3aed', action: '#' },
  { icon: '🐛', label: 'Bug Report', value: 'bugs@onechoicekitchen.com', sub: 'Technical issues & errors', color: '#dc2626', action: 'mailto:bugs@onechoicekitchen.com' },
];

export function SupportCenterPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [ticket, setTicket] = useState({ subject: '', category: 'Order Issue', message: '', priority: 'Medium' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setTicket({ subject: '', category: 'Order Issue', message: '', priority: 'Medium' });
  };

  return (
    <div className="page-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <div className="page-title-block">
          <h1 className="page-title">🎧 Support Center</h1>
          <p className="page-subtitle">Get help, browse FAQs, or raise a support ticket</p>
        </div>
        <div className="page-actions">
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.35rem 0.875rem', borderRadius: 999,
            background: '#f0fdf4', color: '#16a34a',
            fontSize: '0.78rem', fontWeight: 700,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Support Online
          </span>
        </div>
      </div>

      {/* Contact Channels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.875rem', marginBottom: '1.75rem' }}>
        {channels.map(ch => (
          <a
            key={ch.label}
            href={ch.action}
            style={{
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
              background: 'var(--surf)', border: '1px solid var(--bdr)',
              borderRadius: 10, padding: '1rem 1.125rem', textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = ch.color + '60'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 16px ${ch.color}18`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--bdr)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none'; }}
          >
            <span style={{ fontSize: '1.5rem' }}>{ch.icon}</span>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{ch.label}</div>
              <div style={{ fontSize: '0.78rem', color: ch.color, fontWeight: 600 }}>{ch.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text2)', marginTop: '0.15rem' }}>{ch.sub}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* FAQs */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            Frequently Asked Questions
          </h2>
          {faqs.map(cat => (
            <div key={cat.cat} style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '0.5rem' }}>
                {cat.cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cat.items.map(faq => {
                  const key = `${cat.cat}::${faq.q}`;
                  return (
                    <div key={key} style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 8, overflow: 'hidden' }}>
                      <button
                        onClick={() => setOpenFaq(openFaq === key ? null : key)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                      >
                        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{faq.q}</span>
                        <span style={{ color: 'var(--text3)', fontSize: '0.75rem', transform: openFaq === key ? 'rotate(180deg)' : 'rotate(0deg)', display: 'block', transition: 'transform 0.2s', flexShrink: 0 }}>▼</span>
                      </button>
                      {openFaq === key && (
                        <div style={{ padding: '0 1rem 0.875rem' }}>
                          <div style={{ height: 1, background: 'var(--bdr)', marginBottom: '0.625rem' }} />
                          <p style={{ fontSize: '0.8rem', color: 'var(--text2)', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Form */}
        <div style={{ background: 'var(--surf)', border: '1px solid var(--bdr)', borderRadius: 12, padding: '1.25rem', position: 'sticky', top: '1rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            📩 Submit a Support Ticket
          </h2>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.25rem' }}>Ticket Submitted!</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>We'll respond to your registered email within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>Subject *</label>
                <input
                  required value={ticket.subject}
                  onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid var(--bdr)', borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--bg)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--bdr)')}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>Category</label>
                <select
                  value={ticket.category}
                  onChange={e => setTicket(t => ({ ...t, category: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid var(--bdr)', borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--bg)' }}
                >
                  {['Order Issue', 'Payment / Payout', 'Account Access', 'Bug / Error', 'Feature Request', 'Delivery Issue', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>Priority</label>
                <select
                  value={ticket.priority}
                  onChange={e => setTicket(t => ({ ...t, priority: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid var(--bdr)', borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', background: 'var(--bg)' }}
                >
                  {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.3rem' }}>Message *</label>
                <textarea
                  required value={ticket.message}
                  onChange={e => setTicket(t => ({ ...t, message: e.target.value }))}
                  placeholder="Describe the issue in detail. Include order IDs, timestamps, or steps to reproduce."
                  rows={5}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1.5px solid var(--bdr)', borderRadius: 6, fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', background: 'var(--bg)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--blue)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--bdr)')}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Submit Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupportCenterPage;
