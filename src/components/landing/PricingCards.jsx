import React from 'react';

export const PRICING_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    badge: null,
    amount: 'Free',
    per: '',
    desc: 'Perfect for trying out the platform and individual projects.',
    features: [
      '1 User',
      '3 Dashboards',
      'Core analytics',
      'Community support'
    ],
    cta: 'Get Started',
    featured: false
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: 'MOST POPULAR',
    amount: '$29 | ₹2,499',
    per: '/mo',
    desc: 'Advanced features for growing teams and startups.',
    features: [
      'Up to 5 Users',
      'Unlimited Dashboards',
      'AI Predictions',
      'Priority support'
    ],
    cta: 'Start 14-day Free Trial',
    featured: true
  },
  {
    id: 'agency',
    name: 'Agency',
    badge: null,
    amount: '$99 | ₹8,499',
    per: '/mo',
    desc: 'Powerful tools for larger organizations and agencies.',
    features: [
      'Up to 25 Users',
      'White-labeling',
      'Smart Alerts',
      '24/7 dedicated support'
    ],
    cta: 'Start 14-day Free Trial',
    featured: false
  },
  {
    id: 'agency-white-label',
    name: 'Agency White Label',
    badge: null,
    amount: 'Custom',
    per: '',
    desc: 'Bespoke solutions for high-volume enterprise needs.',
    features: [
      'Unlimited Users',
      'Dedicated infrastructure',
      'SOC2 compliance',
      'Custom SLA'
    ],
    cta: 'Contact Sales',
    featured: false
  }
];

export default function PricingCards() {
  return (
    <div className="pricing-grid">
      {PRICING_PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`price-card ${plan.featured ? 'featured' : ''}`}
        >
          {plan.badge && <span className="price-badge">{plan.badge}</span>}
          <div className="price-name">{plan.name}</div>
          <div className="price-amount">
            <span className="amt">{plan.amount}</span>
            {plan.per && <span className="per">{plan.per}</span>}
          </div>
          <p className="price-desc">{plan.desc}</p>
          <ul className="price-features">
            {plan.features.map((feature, i) => (
              <li key={i}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a
            href="#"
            data-cta="true"
            className={`price-cta ${plan.featured ? 'primary' : ''}`}
          >
            {plan.cta}
          </a>
        </div>
      ))}
    </div>
  );
}

