import re

with open('apps/web/app/tiffin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Megaphone, AlertTriangle to lucide-react imports
content = re.sub(
    r"import { Calendar, CheckCircle2 } from 'lucide-react';",
    "import { Calendar, CheckCircle2, Megaphone, AlertTriangle } from 'lucide-react';",
    content
)

# 2. Add terms state, remove activeView state
content = re.sub(
    r"const \[plans, setPlans\] = useState<any\[\]>\(\[\]\);",
    "const [plans, setPlans] = useState<any[]>([]);\n  const [terms, setTerms] = useState<any[]>([]);",
    content
)
content = re.sub(
    r"\s*// Outer Navigation Tabs\s*const \[activeView, setActiveView\].*?;",
    "",
    content
)

# 3. Fetch terms in fetchPlansAndSettings
content = re.sub(
    r"fetch\('/api/tiffin/plans'\),\s*fetch\('/api/tiffin/settings'\)\s*\]\);",
    "fetch('/api/tiffin/plans'),\n          fetch('/api/tiffin/settings'),\n          fetch('/api/tiffin/terms')\n        ]);",
    content
)
content = re.sub(
    r"const p = await plansRes\.json\(\);\s*const s = await settingsRes\.json\(\);\s*setPlans\(Array\.isArray\(p\) \? p : \[\]\);\s*setGlobalSettings\(s\);",
    "const p = await plansRes.json();\n        const s = await settingsRes.json();\n        const t = await termsRes.json();\n        setPlans(Array.isArray(p) ? p : []);\n        setGlobalSettings(s);\n        setTerms(Array.isArray(t) ? t : []);",
    content
)

# 4. Remove Interactive Navigation for flyers
content = re.sub(
    r"\{/\* Full-width interactive navigation for flyers \*/\}.*?</div>\s*</div>\s*\{/\* Content Area - Full Width Container \*/\}",
    "{/* Content Area - Full Width Container */}",
    content,
    flags=re.DOTALL
)

# 5. Remove {activeView === 'DAILY' && ( ... )} wrappers
content = re.sub(r"\{activeView === 'DAILY' && \(\s*<>", "", content)
content = re.sub(r"</>\s*\)\}\s*\{activeView === 'MENU_PLAN'", "{activeView === 'MENU_PLAN'", content)

# 6. Remove activeView === 'MENU_PLAN' block
content = re.sub(
    r"\{activeView === 'MENU_PLAN' && \(\s*<div.*?</div>\s*\)\}",
    "",
    content,
    flags=re.DOTALL
)

# 7. Remove activeView === 'PRICING' && ( ... )
content = re.sub(r"\{activeView === 'PRICING' && \(\s*", "", content)
# We need to remove the closing )} for PRICING. Let's find it.
# The PRICING block ends right before {activeView === 'TERMS' && (
content = re.sub(r"\)\}\s*\{activeView === 'TERMS' && \(", "{activeView === 'TERMS' && (", content)

# 8. Replace activeView === 'TERMS' block with actual Terms layout
terms_html = """
          <div style={{ marginTop: '4rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <div style={{ background: '#ef4444', color: 'white', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <Megaphone size={24} />
              IMPORTANT NOTICE / आवश्यक सूचना
            </div>
            
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc' }}>
              {terms.map(term => (
                <div key={term.id} style={{ background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 1.5rem', background: '#f0f9ff', borderBottom: '1px solid #cbd5e1' }}>
                    <div style={{ color: '#0369a1', fontWeight: 'bold', fontSize: '1.1rem' }}>{term.title.split('|')[0]}</div>
                    <div style={{ color: '#0369a1', fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'right' }}>{term.title.split('|')[1]}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem' }}>
                    <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      <div dangerouslySetInnerHTML={{ __html: term.contentEn.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>') }} />
                    </div>
                    <div style={{ color: '#334155', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', borderLeft: '1px solid #e2e8f0', paddingLeft: '2rem' }}>
                      <div dangerouslySetInnerHTML={{ __html: term.contentHi.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>') }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fef2f2', borderTop: '2px solid #ef4444', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: '#ef4444', color: 'white', padding: '0.5rem 2rem', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
                <AlertTriangle size={20} />
                SERVICE TRANSPARENCY / हमारी पारदर्शिता
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Our goal is to provide delicious, uninterrupted meals. If you do not accept these guidelines, please inform us today. We will gladly settle your account, refund your balance, and terminate your service.</p>
              <p style={{ margin: 0, color: '#0f172a' }}>यदि आपको ये नियम स्वीकार नहीं हैं, तो कृपया आज ही सूचित करें। हम आज तक का हिसाब करके शेष राशि वापस कर देंगे।</p>
            </div>
          </div>
"""

content = re.sub(
    r"\{activeView === 'TERMS' && \(\s*<div.*?</div>\s*\)\}",
    terms_html,
    content,
    flags=re.DOTALL
)

with open('apps/web/app/tiffin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated tiffin/page.tsx successfully")
