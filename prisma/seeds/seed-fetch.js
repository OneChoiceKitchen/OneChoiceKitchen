const pages = [
  // WEB PORTAL (Default Customer Site)
  { title: 'Meal Plans', slug: 'meal-plans', section: 'Product', portals: 'web', content: '<h2>Meal Plans</h2><p>Subscribe to our daily homestyle tiffin service.</p>' },
  { title: 'Menu & Pricing', slug: 'menu-pricing', section: 'Product', portals: 'web', content: '<h2>Menu & Pricing</h2><p>Explore our premium food options.</p>' },
  { title: 'Dietary Preferences', slug: 'dietary', section: 'Product', portals: 'web', content: '<h2>Dietary Preferences</h2><p>Customized meal options for you.</p>' },
  { title: 'How it Works', slug: 'how-it-works', section: 'Product', portals: 'web', content: '<h2>How it Works</h2><p>Ordering is simple and easy.</p>' },

  { title: 'About Us', slug: 'about-us', section: 'Company', portals: 'web,rider,partner', content: '<h2>About Us</h2><p>We are One Choice Kitchen.</p>' },
  { title: 'Careers', slug: 'careers', section: 'Company', portals: 'web', content: '<h2>Careers</h2><p>Join our team.</p>' },
  { title: 'Partner With Us', slug: 'partner-with-us', section: 'Company', portals: 'web', content: '<h2>Partner With Us</h2><p>Grow your culinary business with us.</p>' },
  { title: 'Contact', slug: 'contact', section: 'Company', portals: 'web,rider,partner', content: '<h2>Contact</h2><p>Reach out to our support team.</p>' },

  { title: 'Privacy Policy', slug: 'privacy-policy', section: 'Legal', portals: 'web,rider,partner', content: '<h2>Privacy Policy</h2><p>Your data is secure with us.</p>' },
  { title: 'Terms of Service', slug: 'terms-of-service', section: 'Legal', portals: 'web,rider,partner', content: '<h2>Terms of Service</h2><p>Review our usage terms.</p>' },
  { title: 'Cookie Policy', slug: 'cookie-policy', section: 'Legal', portals: 'web', content: '<h2>Cookie Policy</h2><p>How we use cookies.</p>' },
  { title: 'Refunds', slug: 'refunds', section: 'Legal', portals: 'web', content: '<h2>Refunds</h2><p>Our refund policy.</p>' },

  // RIDER PORTAL
  { title: 'Dashboard', slug: 'rider-dashboard', section: 'Rider Resources', portals: 'rider', content: '<h2>Rider Dashboard</h2><p>Overview of your deliveries.</p>' },
  { title: 'Deliveries', slug: 'rider-deliveries', section: 'Rider Resources', portals: 'rider', content: '<h2>Active Deliveries</h2><p>Manage your assigned orders.</p>' },
  { title: 'Shift Schedule', slug: 'shift-schedule', section: 'Rider Resources', portals: 'rider', content: '<h2>Shift Schedule</h2><p>View your upcoming shifts.</p>' },
  { title: 'Map Routing', slug: 'map-routing', section: 'Rider Resources', portals: 'rider', content: '<h2>Map Routing</h2><p>Optimized delivery routes.</p>' },

  { title: 'Hub Locations', slug: 'hub-locations', section: 'Support & Help', portals: 'rider', content: '<h2>Hub Locations</h2><p>Find your nearest rider hub.</p>' },
  { title: 'Emergency Hotline', slug: 'emergency-hotline', section: 'Support & Help', portals: 'rider', content: '<h2>Emergency Hotline</h2><p>Contact us immediately in case of emergency.</p>' },
  { title: 'Policy Updates', slug: 'policy-updates', section: 'Support & Help', portals: 'rider', content: '<h2>Policy Updates</h2><p>Latest updates for riders.</p>' },
  { title: 'Vehicle Servicing', slug: 'vehicle-servicing', section: 'Support & Help', portals: 'rider', content: '<h2>Vehicle Servicing</h2><p>Maintenance guidelines and support.</p>' },

  { title: 'Rider Agreement', slug: 'rider-agreement', section: 'Compliance', portals: 'rider', content: '<h2>Rider Agreement</h2><p>Contract terms for independent contractors.</p>' },
  { title: 'Insurance Claims', slug: 'insurance-claims', section: 'Compliance', portals: 'rider', content: '<h2>Insurance Claims</h2><p>File a claim for on-job incidents.</p>' },
  { title: 'Safety Protocols', slug: 'safety-protocols', section: 'Compliance', portals: 'rider', content: '<h2>Safety Protocols</h2><p>Mandatory safety guidelines.</p>' },
  { title: 'Anti-Harassment', slug: 'anti-harassment', section: 'Compliance', portals: 'rider', content: '<h2>Anti-Harassment Policy</h2><p>We maintain a safe environment for everyone.</p>' },

  // PARTNER PORTAL
  { title: 'Inventory Manager', slug: 'inventory-manager', section: 'Partner Tools', portals: 'partner', content: '<h2>Inventory Manager</h2><p>Manage your stock levels.</p>' },
  { title: 'Menu Editor', slug: 'menu-editor', section: 'Partner Tools', portals: 'partner', content: '<h2>Menu Editor</h2><p>Update your offerings and pricing.</p>' },
  { title: 'Promotions', slug: 'promotions', section: 'Partner Tools', portals: 'partner', content: '<h2>Promotions</h2><p>Run discounts and special offers.</p>' },
  { title: 'Analytics', slug: 'partner-analytics', section: 'Partner Tools', portals: 'partner', content: '<h2>Analytics</h2><p>View your sales performance.</p>' },

  { title: 'Help Center', slug: 'partner-help-center', section: 'Support & Resources', portals: 'partner', content: '<h2>Help Center</h2><p>Guides and FAQs for partners.</p>' },
  { title: 'Merchant API', slug: 'merchant-api', section: 'Support & Resources', portals: 'partner', content: '<h2>Merchant API</h2><p>Integration documentation.</p>' },
  { title: 'Dedicated Manager', slug: 'dedicated-manager', section: 'Support & Resources', portals: 'partner', content: '<h2>Dedicated Manager</h2><p>Contact your account representative.</p>' },
  { title: 'Success Stories', slug: 'success-stories', section: 'Support & Resources', portals: 'partner', content: '<h2>Success Stories</h2><p>Learn from top performing partners.</p>' },

  { title: 'Vendor Agreement', slug: 'vendor-agreement', section: 'Legal & Compliance', portals: 'partner', content: '<h2>Vendor Agreement</h2><p>Terms and conditions for merchants.</p>' },
  { title: 'Tax Documents', slug: 'tax-documents', section: 'Legal & Compliance', portals: 'partner', content: '<h2>Tax Documents</h2><p>Download your 1099s and tax forms.</p>' },
  { title: 'Payout Schedule', slug: 'payout-schedule', section: 'Legal & Compliance', portals: 'partner', content: '<h2>Payout Schedule</h2><p>Information on when you get paid.</p>' },
  { title: 'Data Privacy', slug: 'data-privacy', section: 'Legal & Compliance', portals: 'partner', content: '<h2>Data Privacy</h2><p>How merchant data is handled.</p>' }
];

async function seed() {
  for (const page of pages) {
    try {
      const response = await fetch('http://localhost:3333/api/static-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, isPublished: true })
      });
      if (response.ok) {
        console.log(`Created page: ${page.title}`);
      } else {
        console.log(`Failed to create page: ${page.title} - ${response.statusText}`);
      }
    } catch (err) {
      console.error(err.message);
      break;
    }
  }
}
seed();
