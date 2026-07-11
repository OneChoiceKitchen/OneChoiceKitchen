const fs = require('fs');
const files = [
  'c:/Users/priyer/.gemini/antigravity-ide/scratch/restaurant-saas/apps/web/app/blogs/page.tsx',
  'c:/Users/priyer/.gemini/antigravity-ide/scratch/restaurant-saas/apps/web/app/blogs/[id]/page.tsx',
  'c:/Users/priyer/.gemini/antigravity-ide/scratch/restaurant-saas/apps/web/app/loyalty/page.tsx',
  'c:/Users/priyer/.gemini/antigravity-ide/scratch/restaurant-saas/apps/web/app/referral/page.tsx',
  'c:/Users/priyer/.gemini/antigravity-ide/scratch/restaurant-saas/apps/web/app/reviews/page.tsx',
  'c:/Users/priyer/.gemini/antigravity-ide/scratch/restaurant-saas/apps/web/app/support/page.tsx'
];

const footer = 
      {/* GLOBAL FOOTER */}
      <footer className={styles.globalFooter}>
        <div>
          <strong style={{ color: '#0f172a' }}>One Choice Kitchen Enterprise</strong> <br/>
          © {new Date().getFullYear()} — SaaS Management Platform
        </div>
        
        <div className={styles.footerLinks}>
          <a href="#" style={{ color: '#003893', textDecoration: 'none', fontWeight: 600 }}>System Status: Operational</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#" style={{ color: '#475569', textDecoration: 'none' }}>Support Desk</a>
        </div>

        <div className={styles.socialLinks}>
          <a href="#" title="Facebook">??</a>
          <a href="#" title="Twitter">??</a>
          <a href="#" title="Instagram">??</a>
          <a href="#" title="LinkedIn">??</a>
        </div>
      </footer>
;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('GLOBAL FOOTER')) continue; // already added

  const lastDivIndex = content.lastIndexOf('</div>');
  if (lastDivIndex !== -1) {
    content = content.substring(0, lastDivIndex) + footer + content.substring(lastDivIndex);
    fs.writeFileSync(file, content);
    console.log('Added footer to', file);
  }
}
