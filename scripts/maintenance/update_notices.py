import sys

path = r'c:\Users\priyer\.gemini\antigravity-ide\scratch\restaurant-saas\apps\admin\admin-portal\src\app\app.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_notices = '{/* NOTICES AND TERMS SETTINGS */}'
end_notices = 'Save Notices'

replacement_notices = r'''{/* NOTICES AND TERMS SETTINGS */}
                    <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <h3 style={{ margin: '0 0 1.25rem 0', color: '#0f172a' }}>📢 Tiffin Notices & Terms</h3>
                      <form onSubmit={handleSaveTiffinNotices} style={{ display: 'grid', gap: '1rem' }}>
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                          <input type="checkbox" checked={tiffinNotices.gasNoticeActive} onChange={(e) => setTiffinNotices({...tiffinNotices, gasNoticeActive: e.target.checked})} />
                          Enable Gas Shortage Notice
                        </label>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>1 Time Extra (₹)</label>
                            <input type="number" value={tiffinNotices.gasNoticeAmount1} onChange={(e) => setTiffinNotices({...tiffinNotices, gasNoticeAmount1: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>2 Time Extra (₹)</label>
                            <input type="number" value={tiffinNotices.gasNoticeAmount2} onChange={(e) => setTiffinNotices({...tiffinNotices, gasNoticeAmount2: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>3 Time Extra (₹)</label>
                            <input type="number" value={tiffinNotices.gasNoticeAmount3} onChange={(e) => setTiffinNotices({...tiffinNotices, gasNoticeAmount3: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Packaging Charge (₹)</label>
                            <input type="number" value={tiffinNotices.packagingCharge || 15} onChange={(e) => setTiffinNotices({...tiffinNotices, packagingCharge: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Absentee Limit</label>
                            <input type="number" value={tiffinNotices.absenteeLimit || 5} onChange={(e) => setTiffinNotices({...tiffinNotices, absenteeLimit: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Trial Delivery (₹)</label>
                            <input type="number" value={tiffinNotices.trialDeliveryCharge || 40} onChange={(e) => setTiffinNotices({...tiffinNotices, trialDeliveryCharge: parseInt(e.target.value)})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>QR Payment UPI ID</label>
                            <input type="text" value={tiffinNotices.qrPaymentUpi || ''} onChange={(e) => setTiffinNotices({...tiffinNotices, qrPaymentUpi: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>QR Payment Name</label>
                            <input type="text" value={tiffinNotices.qrPaymentName || ''} onChange={(e) => setTiffinNotices({...tiffinNotices, qrPaymentName: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                          </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginTop: '0.5rem' }}>
                          <input type="checkbox" checked={tiffinNotices.juiceOfferActive} onChange={(e) => setTiffinNotices({...tiffinNotices, juiceOfferActive: e.target.checked})} />
                          Enable Free Juice Summer Offer
                        </label>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Gas Important Notice Text</label>
                          <textarea rows={2} value={tiffinNotices.importantNoticeText} onChange={(e) => setTiffinNotices({...tiffinNotices, importantNoticeText: e.target.value})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>
                        
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Tiffin Rules (One per line)</label>
                          <textarea rows={5} value={(tiffinNotices.rules || []).join('\n')} onChange={(e) => setTiffinNotices({...tiffinNotices, rules: e.target.value.split('\n')})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Trial Policies (One per line)</label>
                          <textarea rows={3} value={(tiffinNotices.trialPolicies || []).join('\n')} onChange={(e) => setTiffinNotices({...tiffinNotices, trialPolicies: e.target.value.split('\n')})} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                        </div>

                        <button 
                          type="submit" 
                          style={{ background: '#0f172a', color: 'white', padding: '0.8rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}
                        >
                          Save Notices'''

start_idx = content.find(start_notices)
end_idx = content.find(end_notices, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + replacement_notices + content[end_idx + len(end_notices):]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Not found!", start_idx, end_idx)
