import React from 'react';
import PricingCards from './PricingCards';
import IndustriesSection from './IndustriesSection';
import RevolvingShowcase3D from './RevolvingShowcase3D';

export default function HomePage({ hidden }) {
  return (
    <main id="v-home" hidden={hidden}>
{/* 1 HERO */}
<section className="hero"><div className="w">
 <div><div className="badge">✦ One Intelligent Platform. Endless Business Possibilities</div>
 <h1>Your Business. <span>Smarter with AI.</span></h1>
 <p>Automate customer conversations, streamline business operations and accelerate growth with Aminoid AI.<br /><br />From AI Voice Agents and Chatbots to CRM, HRMS, ERP and intelligent business automation — manage your business through one connected digital ecosystem.</p>
 <div className="acts"><a className="btn b1" href="#" data-cta>Get a free demo →</a><a className="btn b2" href="#" data-go="pricing">Start free trial</a></div>
 <div className="stats"><div><b>&lt;30s</b>Response time</div><div><b>24/7</b>Coverage</div><div><b>92%</b>Auto-resolved</div></div></div>
 <RevolvingShowcase3D />
</div></section>

{/* 2 LOGOS / ALL INDUSTRIES */}
<div className="logos">
  <div className="w center">
    <span className="ll" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--tx)', letterSpacing: '-0.01em', display: 'block' }}>
      Cover all industries
    </span>
    <span style={{ color: 'var(--mu)', fontSize: '14px', marginTop: '6px', display: 'block' }}>
      Built for modern businesses that move fast
    </span>
    <div className="lr">
      <div className="l">FINTECH</div>
      <div className="l">REAL ESTATE</div>
      <div className="l">HEALTHCARE</div>
      <div className="l">LOGISTICS</div>
      <div className="l">E-COMMERCE &amp; RETAIL</div>
      <div className="l">TECHNOLOGY</div>
      <div className="l">MANUFACTURING</div>
      <div className="l">EDUCATION</div>
      <div className="l">HOSPITALITY</div>
      <div className="l" style={{ borderStyle: 'solid', borderColor: 'var(--v2)', color: 'var(--v2)', fontWeight: '700' }}>
        + COVER ALL INDUSTRIES
      </div>
    </div>
  </div>
</div>

{/* 3 CHALLENGE */}
<section id="challenge"><div className="w center"><span className="eyebrow">THE CHALLENGE</span><h2>Growing businesses lose customers to slow responses</h2>
<p className="lead">When enquiries arrive across calls, chat, WhatsApp and email, things fall through the cracks.</p>
<div className="cost"><div className="bar"></div><h3>The cost of missed enquiries</h3>
 <div className="stats"><div className="n"><b className="bad">62%</b>of callers don't leave a voicemail and call a competitor instead.</div>
 <div className="n"><b className="bad">391%</b>higher conversion when you respond in under a minute.</div>
 <div className="n"><b className="bad">4–6</b>disconnected tools your team uses to handle one customer.</div></div></div></div></section>

{/* 4 WHY AMINOID */}
<section id="why" className="alt"><div className="w center"><span className="eyebrow">WHY AMINOID</span><h2>One platform for every customer conversation</h2>
<p className="lead">Replace disconnected software with an intelligent, end-to-end customer workflow.</p>
<div className="grid why" style={{ textAlign: 'left' }}>
 <div className="card"><h3>Voice &amp; Calls</h3><p>AI voice agents answer calls 24/7, qualify leads and book appointments in natural speech.</p></div>
 <div className="card"><h3>Chat &amp; Messaging</h3><p>Galaxy Chat and WhatsApp automation handle queries with live human handoff.</p></div>
 <div className="card"><h3>CRM &amp; Sales</h3><p>Automate follow-ups, lead routing, quotes and customer journeys from enquiry to close.</p></div>
 <div className="card"><h3>Operations &amp; ERP</h3><p>Connect inventory, workforce schedules and daily business workflows in one place.</p></div>
 <div className="card"><h3>Analytics &amp; ROI</h3><p>Listen into calls, read transcripts and track conversion and revenue impact in real time.</p></div></div></div></section>

{/* 5 HOW IT WORKS */}
<section id="features"><div className="w"><span className="eyebrow">HOW IT WORKS</span><h2>Three steps from enquiry to conversion</h2>
<div className="grid three" style={{ textAlign: 'left' }}>
 <div className="card"><div className="step"><em>01</em><h3>Answer</h3></div><p>Voice agents and chat pick up every call and message in seconds, 24 hours a day.</p></div>
 <div className="card"><div className="step"><em>02</em><h3>Qualify &amp; Route</h3></div><p>AI asks the right questions, scores intent and logs everything straight into your CRM.</p></div>
 <div className="card"><div className="step"><em>03</em><h3>Close &amp; Follow Up</h3></div><p>Appointments get booked, confirmations sent, and reminders run automatically.</p></div></div></div></section>

{/* 6 COMPARISON */}
<section id="compare" className="alt"><div className="w center"><span className="eyebrow">COMPARE</span><h2>How Aminoid compares to alternatives</h2>
<p className="lead">Built to deliver enterprise power without enterprise complexity or cost.</p>
<div className="cm" style={{ marginTop: '48px', textAlign: 'left' }}>
 <table><thead><tr><th>Capability</th><th>Manual teams</th><th>Fragmented tools</th><th className="me">Aminoid AI</th></tr></thead>
 <tbody>
  <tr><td>Response time</td><td>Minutes to hours</td><td>1–5 minutes</td><td className="me">&lt; 30 seconds</td></tr>
  <tr><td>Coverage</td><td>Business hours only</td><td>Partial 24/7</td><td className="me">True 24/7/365</td></tr>
  <tr><td>Voice, chat &amp; CRM</td><td>Separate silos</td><td>Requires Zapier / APIs</td><td className="me">Native single platform</td></tr>
  <tr><td>Setup time</td><td>Weeks of hiring</td><td>2–4 months integration</td><td className="me">Days with guided setup</td></tr>
  <tr><td>Cost structure</td><td>High headcount</td><td>Multiple subscriptions</td><td className="me">Predictable flat plan</td></tr>
 </tbody></table></div></div></section>

{/* 7 AGENT SUITE */}
<section id="agents"><div className="w center"><span className="eyebrow">AGENT SUITE</span><h2>AI agents for every step of your workflow</h2>
<p className="lead">Deploy ready-to-run agents or tailor them to your exact business rules.</p>
<div className="grid four4" style={{ textAlign: 'left' }}>
 <div className="card" data-go="callzenza" style={{ cursor: 'pointer' }}><small>Front desk</small><h3>CallZenza Voice Agent</h3><p>Answers inbound calls, qualifies intent and books appointments.</p><a href="#" data-go="callzenza" style={{ color: 'var(--v2)', fontSize: '13px', fontWeight: '600', marginTop: '10px', display: 'inline-block' }}>Try Now ›</a></div>
 <div className="card" data-go="receptionist" style={{ cursor: 'pointer' }}><small>Front desk</small><h3>AI Receptionist</h3><p>Handles front-desk enquiries, schedules and routes callers.</p><a href="#" data-go="receptionist" style={{ color: 'var(--v2)', fontSize: '13px', fontWeight: '600', marginTop: '10px', display: 'inline-block' }}>Try Now ›</a></div>
 <div className="card"><small>Front desk</small><h3>Galaxy Chatbot</h3><p>Web and messaging assistant with instant human escalation.</p></div>
 <div className="card"><small>Front desk</small><h3>Omnichannel Inbox</h3><p>Calls, chats and WhatsApp in one shared team inbox.</p></div>
 <div className="card"><small>Sales</small><h3>Lead Qualifier</h3><p>Scores intent on every enquiry and routes hot leads.</p></div>
 <div className="card"><small>Sales</small><h3>Appointment booking</h3><p>Turns interest into confirmed visits.</p></div>
 <div className="card"><small>Sales</small><h3>Reminder &amp; confirmation</h3><p>Cuts no-shows with timely nudges.</p></div>
 <div className="card"><small>Sales</small><h3>Missed-call recovery</h3><p>Calls back every missed enquiry.</p></div>
 <div className="card"><small>Service</small><h3>Feedback collection</h3><p>Captures insights after every visit.</p></div>
 <div className="card"><small>Service</small><h3>Customer support</h3><p>Answers questions after the sale.</p></div>
 <div className="card"><small>Service</small><h3>Payment reminders</h3><p>Keeps collections moving.</p></div>
 <div className="card"><small>Growth</small><h3>Review &amp; referral</h3><p>Turns happy customers into new leads.</p></div></div></div></section>

{/* 8 ENTERPRISE */}
<section className="alt"><div className="w center"><span className="eyebrow">ENTERPRISE READY</span><h2>Ready for enterprise from day one</h2>
<p className="lead">Moving from spreadsheets or another tool? Aminoid scales with you.</p>
<div className="grid four" style={{ textAlign: 'left' }}>
 <div className="card"><div className="ic">⚡</div><h3>Fast setup</h3><p>Configure workflows, connect tools and train your team in days.</p></div>
 <div className="card"><div className="ic">🔒</div><h3>Enterprise security</h3><p>Encryption, role-based access and audit trails.</p></div>
 <div className="card"><div className="ic">⇪</div><h3>Easy migration</h3><p>Bring your leads and customer history with you.</p></div>
 <div className="card"><div className="ic">☁</div><h3>Flexible hosting</h3><p>Secure cloud or your own servers.</p></div></div></div></section>

{/* 9 PRICING */}
<section id="plans">
  <div className="w center">
    <span className="eyebrow">GET STARTED</span>
    <h2>Start small. Scale at your own pace.</h2>
    <p className="lead">Try Aminoid with your own business data before you choose a plan.</p>
    <PricingCards />
  </div>
</section>

{/* 10 INDUSTRIES (3D SCROLL ZOOM) */}
<IndustriesSection />

{/* 11 FAQ */}
<section id="faq"><div className="w center"><span className="eyebrow">FAQ</span><h2>Frequently asked questions</h2>
<div className="faq" style={{ textAlign: 'left' }}><div>What does Aminoid AI do?<span>−</span></div>
<p>Aminoid AI builds intelligent business automation: voice agents, chat, CRM, ERP and analytics that help teams serve customers faster.</p>
<div>Is it suitable for small businesses?<span>+</span></div><div>Can it be customised to our workflows?<span>+</span></div><div>Is my data secure?<span>+</span></div><div>How fast can we go live?<span>+</span></div></div></div></section>

</main>
  );
}
