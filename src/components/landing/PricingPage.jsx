import React from 'react';
import PricingCards from './PricingCards';

export default function PricingPage({ hidden }) {
  return (
    <main id="v-pricing" hidden={hidden}>
      <section className="ph">
        <div className="w center">
          <span className="eyebrow">PRICING</span>
          <h2 style={{ margin: '0 auto', fontSize: '46px' }}>
            Start small. Scale at your own pace.
          </h2>
          <p className="lead">
            Try Aminoid with your own business data, then choose the plan that fits.
          </p>
        </div>
        <div className="w">
          <PricingCards />
        </div>
      </section>

      <section className="alt">
        <div className="w center">
          <span className="eyebrow">COMPARE PLANS</span>
          <h2>What's included in each plan</h2>
          <table className="cm">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Starter</th>
                <th className="me">Pro</th>
                <th>Agency</th>
                <th>Agency White Label</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>AI voice agent (CallZenza)</td>
                <td><span className="y">✓</span></td>
                <td className="me"><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
              </tr>
              <tr>
                <td>AI Receptionist & scheduling</td>
                <td><span className="y">✓</span></td>
                <td className="me"><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
              </tr>
              <tr>
                <td>CRM & lead management</td>
                <td><span className="y">✓</span></td>
                <td className="me"><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
              </tr>
              <tr>
                <td>Chat & WhatsApp inbox</td>
                <td><span className="n">✗</span></td>
                <td className="me"><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
              </tr>
              <tr>
                <td>Dashboards & Users</td>
                <td>1 user / 3 boards</td>
                <td className="me">5 users / Unlimited</td>
                <td>25 users / White-label</td>
                <td>Unlimited users / Dedicated</td>
              </tr>
              <tr>
                <td>Workflow automation & Predictions</td>
                <td>Basic</td>
                <td className="me">AI Predictions</td>
                <td>Smart Alerts</td>
                <td>Custom SLA & pipelines</td>
              </tr>
              <tr>
                <td>ERP & custom integrations</td>
                <td><span className="n">✗</span></td>
                <td className="me"><span className="n">✗</span></td>
                <td><span className="y">✓</span></td>
                <td><span className="y">✓</span></td>
              </tr>
              <tr>
                <td>Security & compliance</td>
                <td>Standard</td>
                <td className="me">Standard</td>
                <td>Advanced</td>
                <td>SOC2 & Custom SLA</td>
              </tr>
              <tr>
                <td>Dedicated support</td>
                <td>Community</td>
                <td className="me">Priority</td>
                <td>24/7 Dedicated</td>
                <td>Dedicated Success Mgr</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="w center">
          <span className="eyebrow">QUESTIONS</span>
          <h2>Pricing questions, answered</h2>
          <div className="faq" style={{ textAlign: 'left' }}>
            <div>Is there a setup fee?<span>−</span></div>
            <p>
              Setup and integration charges depend on your tools. They are quoted before you start and credited when you move to a paid plan.
            </p>
            <div>Can I switch plans later?<span>+</span></div>
            <div>What happens after the trial ends?<span>+</span></div>
            <div>Do you offer a refund?<span>+</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
