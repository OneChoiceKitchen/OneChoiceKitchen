import Link from "next/link";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  DATA                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
];

const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "500+", label: "Restaurant Partners" },
  { value: "5K+", label: "Riders Onboarded" },
  { value: "4.8 ⭐", label: "Avg App Rating" },
];

const FEATURES = [
  {
    icon: "🛒",
    title: "Customer Ordering",
    description:
      "Beautiful mobile app for ordering food, subscribing to tiffin plans, and earning OCK loyalty points with every rupee spent.",
  },
  {
    icon: "🍽️",
    title: "Partner Dashboard",
    description:
      "Restaurant partners get a full-featured portal to manage menus, orders, inventory, staff, branches, and earnings in real time.",
  },
  {
    icon: "🛵",
    title: "Rider Management",
    description:
      "Dedicated rider app with GPS navigation, delivery assignment, real-time earnings, and performance analytics.",
  },
  {
    icon: "🤖",
    title: "AI Chat & Automation",
    description:
      "AI-powered customer support chat with configurable rules engine, intent recognition, and seamless human handoff.",
  },
  {
    icon: "📊",
    title: "Analytics & Reporting",
    description:
      "Real-time revenue dashboards, order analytics, customer metrics, partner performance, and marketing insights.",
  },
  {
    icon: "💳",
    title: "Payments & Billing",
    description:
      "Razorpay integration for UPI, cards, wallets, and COD. Automated payouts to restaurant partners and riders.",
  },
  {
    icon: "🎁",
    title: "Loyalty Rewards",
    description:
      "OCK Points system — earn on every order, redeem for discounts. Tier system with Bronze, Silver, Gold, and Platinum levels.",
  },
  {
    icon: "🗓️",
    title: "Tiffin Subscriptions",
    description:
      "Daily meal subscription management with pause/resume, delivery calendars, and custom meal plans.",
  },
  {
    icon: "🏢",
    title: "Hall Bookings",
    description:
      "Party hall and event venue booking with packages, deposits, customer quotes, and admin approval workflows.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Onboard Your Restaurant",
    description:
      "Register your restaurant on the Partner Portal. Add your menu, branches, operating hours, and delivery zones in minutes.",
  },
  {
    step: "02",
    title: "Customers Discover & Order",
    description:
      "Customers find your restaurant on the OneChoiceKitchen app, browse your menu, and place orders with real-time tracking.",
  },
  {
    step: "03",
    title: "Riders Deliver Instantly",
    description:
      "Our rider network picks up and delivers orders with GPS navigation. Customers track delivery on a live map.",
  },
  {
    step: "04",
    title: "Earn, Grow & Scale",
    description:
      "Monitor revenue, manage feedback, grow your ratings, and expand to new areas — all from one unified dashboard.",
  },
];

const PRICING = [
  {
    name: "Starter",
    price: "₹999",
    period: "/month",
    color: "#2563EB",
    bg: "#EFF6FF",
    description: "Perfect for single-location restaurants getting started.",
    features: [
      "1 restaurant branch",
      "Up to 500 orders/month",
      "Customer app listing",
      "Basic analytics dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹2,999",
    period: "/month",
    color: "#DC2626",
    bg: "#FEF2F2",
    description: "For growing restaurants with multiple branches.",
    features: [
      "Up to 5 branches",
      "Unlimited orders",
      "Tiffin subscriptions",
      "Advanced analytics",
      "Loyalty rewards program",
      "Priority support",
      "AI chat integration",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    color: "#16A34A",
    bg: "#F0FDF4",
    description: "For restaurant chains, cloud kitchens, and food courts.",
    features: [
      "Unlimited branches",
      "White-label option",
      "Custom integrations",
      "Hall bookings module",
      "HRMS & payroll",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Rahul Mehta",
    role: "Owner, Mehta's Biryani House",
    city: "Hyderabad",
    rating: 5,
    quote:
      "OneChoiceKitchen transformed our business. We went from 20 orders a day to 200+ within 3 months. The partner dashboard is incredibly intuitive.",
    avatar: "👨‍🍳",
  },
  {
    name: "Priya Sharma",
    role: "Operations Head, CloudBites Kitchen",
    city: "Bengaluru",
    rating: 5,
    quote:
      "The tiffin subscription feature alone paid for itself in the first month. Our retention rate went from 40% to 85% with the loyalty rewards program.",
    avatar: "👩‍💼",
  },
  {
    name: "Amit Verma",
    role: "Delivery Partner",
    city: "Mumbai",
    rating: 5,
    quote:
      "The rider app is fantastic. The GPS navigation and order management are seamless. I earn ₹800-1200 per day consistently.",
    avatar: "🧑‍🔧",
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  COMPONENTS                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <span className="logo-icon">🍽️</span>
          <span className="logo-text">
            OneChoice<span className="logo-accent">Kitchen</span>
          </span>
        </a>
        <div className="nav-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <a href="http://localhost:4205" className="btn-ghost">Admin Login</a>
          <a href="http://localhost:4208" className="btn-primary">Get Started →</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>
      <div className="hero-inner">
        <div className="hero-badge">
          <span>🚀</span> India&apos;s #1 Enterprise Food Delivery SaaS
        </div>
        <h1 className="hero-title">
          Run Your Restaurant
          <br />
          <span className="hero-title-accent">Smarter, Faster & Bigger</span>
        </h1>
        <p className="hero-subtitle">
          OneChoiceKitchen gives restaurants, riders, and customers one unified platform.
          AI-powered ordering, real-time tracking, loyalty rewards, and powerful analytics — all in one place.
        </p>
        <div className="hero-actions">
          <a href="http://localhost:4208" className="hero-btn-primary">
            Order Now <span>🛒</span>
          </a>
          <a href="http://localhost:4206" className="hero-btn-secondary">
            Partner With Us <span>🍽️</span>
          </a>
        </div>
        <div className="hero-stats">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="section">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-badge">✨ Platform Features</div>
          <h2 className="section-title">Everything Your Restaurant Needs</h2>
          <p className="section-subtitle">
            From customer ordering to rider management, analytics to AI chat — OneChoiceKitchen handles every
            dimension of your food business.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="section section-alt">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-badge">📋 Simple Process</div>
          <h2 className="section-title">How OneChoiceKitchen Works</h2>
          <p className="section-subtitle">
            Get up and running in minutes. Our streamlined onboarding process has your restaurant live within 24 hours.
          </p>
        </div>
        <div className="steps-grid">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} className="step-card">
              <div className="step-number">{step.step}</div>
              {i < HOW_IT_WORKS.length - 1 && <div className="step-connector" />}
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portals() {
  return (
    <section className="section section-dark">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-badge light">🖥️ Dedicated Portals</div>
          <h2 className="section-title light">The Right App for Every Role</h2>
          <p className="section-subtitle light">
            Every stakeholder gets a tailored experience — customers, partners, riders, and admins.
          </p>
        </div>
        <div className="portals-grid">
          <div className="portal-card" style={{ borderTopColor: "#2563EB" }}>
            <div className="portal-icon" style={{ background: "#EFF6FF" }}>🛒</div>
            <div className="portal-badge" style={{ color: "#2563EB" }}>For Customers</div>
            <h3 className="portal-name">Customer App</h3>
            <p className="portal-desc">Order food, subscribe to tiffin, track delivery, earn OCK Points.</p>
            <a href="http://localhost:4208" className="portal-link" style={{ color: "#2563EB" }}>
              Open App →
            </a>
          </div>
          <div className="portal-card" style={{ borderTopColor: "#16A34A" }}>
            <div className="portal-icon" style={{ background: "#F0FDF4" }}>🍽️</div>
            <div className="portal-badge" style={{ color: "#16A34A" }}>For Restaurants</div>
            <h3 className="portal-name">Partner Portal</h3>
            <p className="portal-desc">Manage menus, orders, inventory, staff, branches and earnings.</p>
            <a href="http://localhost:4206" className="portal-link" style={{ color: "#16A34A" }}>
              Open Portal →
            </a>
          </div>
          <div className="portal-card" style={{ borderTopColor: "#EA580C" }}>
            <div className="portal-icon" style={{ background: "#FFF7ED" }}>🛵</div>
            <div className="portal-badge" style={{ color: "#EA580C" }}>For Riders</div>
            <h3 className="portal-name">Rider Portal</h3>
            <p className="portal-desc">Accept deliveries, navigate with GPS, track earnings and ratings.</p>
            <a href="http://localhost:4207" className="portal-link" style={{ color: "#EA580C" }}>
              Open Portal →
            </a>
          </div>
          <div className="portal-card" style={{ borderTopColor: "#7C3AED" }}>
            <div className="portal-icon" style={{ background: "#F5F3FF" }}>⚙️</div>
            <div className="portal-badge" style={{ color: "#7C3AED" }}>For Operators</div>
            <h3 className="portal-name">Admin Portal</h3>
            <p className="portal-desc">Full platform control — analytics, users, orders, settings, RBAC.</p>
            <a href="http://localhost:4205" className="portal-link" style={{ color: "#7C3AED" }}>
              Open Portal →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-badge">💰 Transparent Pricing</div>
          <h2 className="section-title">Simple Plans, No Hidden Costs</h2>
          <p className="section-subtitle">
            Start free for 30 days. No credit card required. Cancel anytime.
          </p>
        </div>
        <div className="pricing-grid">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`pricing-card ${plan.highlight ? "pricing-card-highlight" : ""}`}
              style={{ borderTopColor: plan.color }}
            >
              {plan.highlight && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-icon" style={{ background: plan.bg, color: plan.color }}>
                {plan.name === "Starter" ? "🌱" : plan.name === "Growth" ? "🚀" : "🏢"}
              </div>
              <h3 className="pricing-name">{plan.name}</h3>
              <p className="pricing-desc">{plan.description}</p>
              <div className="pricing-price">
                <span className="price-value">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((f) => (
                  <li key={f} className="pricing-feature">
                    <span style={{ color: plan.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="http://localhost:4206"
                className="pricing-cta"
                style={{
                  background: plan.highlight ? plan.color : "transparent",
                  color: plan.highlight ? "#fff" : plan.color,
                  border: `2px solid ${plan.color}`,
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="section section-alt">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-badge">💬 Customer Stories</div>
          <h2 className="section-title">Loved by Restaurants & Riders</h2>
          <p className="section-subtitle">
            Thousands of restaurants, riders, and customers trust OneChoiceKitchen every day.
          </p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="testimonial-card">
              <div className="testimonial-stars">
                {"⭐".repeat(t.rating)}
              </div>
              <blockquote className="testimonial-quote">&ldquo;{t.quote}&rdquo;</blockquote>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                  <div className="testimonial-city">📍 {t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="cta-section">
      <div className="cta-bg-orbs">
        <div className="cta-orb cta-orb-1" />
        <div className="cta-orb cta-orb-2" />
      </div>
      <div className="cta-inner">
        <h2 className="cta-title">Ready to Grow Your Restaurant Business?</h2>
        <p className="cta-subtitle">
          Join 500+ restaurants already using OneChoiceKitchen. Get started in minutes.
        </p>
        <div className="cta-actions">
          <a href="http://localhost:4208" className="cta-btn-primary">
            Start Ordering Now
          </a>
          <a href="http://localhost:4206" className="cta-btn-secondary">
            List Your Restaurant
          </a>
        </div>
        <p className="cta-note">30-day free trial · No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>🍽️</span>
            <span>OneChoice<strong>Kitchen</strong></span>
          </div>
          <p className="footer-tagline">India&apos;s AI-powered restaurant management platform.</p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter" className="social-link">𝕏</a>
            <a href="#" aria-label="Instagram" className="social-link">📸</a>
            <a href="#" aria-label="LinkedIn" className="social-link">in</a>
            <a href="#" aria-label="YouTube" className="social-link">▶</a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <a href="#features" className="footer-link">Features</a>
            <a href="#pricing" className="footer-link">Pricing</a>
            <a href="#how-it-works" className="footer-link">How It Works</a>
            <a href="http://localhost:4208/download" className="footer-link">Download App</a>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Portals</h4>
            <a href="http://localhost:4208" className="footer-link">Customer App</a>
            <a href="http://localhost:4206" className="footer-link">Partner Portal</a>
            <a href="http://localhost:4207" className="footer-link">Rider Portal</a>
            <a href="http://localhost:4205" className="footer-link">Admin Portal</a>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <a href="#" className="footer-link">About Us</a>
            <a href="#" className="footer-link">Careers</a>
            <a href="#" className="footer-link">Press</a>
            <a href="#" className="footer-link">Blog</a>
          </div>
          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <a href="#" className="footer-link">Help Center</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Contact Us</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 OneChoiceKitchen Pvt. Ltd. All rights reserved.</span>
        <span>Made with ❤️ in India 🇮🇳</span>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PAGE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Portals />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
