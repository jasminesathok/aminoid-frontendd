import React from 'react';

export default function ProductsPage({ hidden }) {
  return (
    <main id="v-products" hidden={hidden}>
<section className="hero"><div className="w">
 <div><div className="badge">Products / CallZenza</div>
 <h1>An AI voice agent that <span>picks up every call.</span></h1>
 <p>CallZenza answers inbound calls in natural speech, qualifies callers, books appointments and hands off to your team with the full context.</p>
 <div className="acts"><a className="btn b1" href="#" data-cta>Hear a live demo →</a><a className="btn b2" href="#" data-go="pricing">Start free trial</a></div>
 <div className="stats"><div><b>&lt;3s</b><small>To answer a call*</small></div><div><b>24/7</b><small>Availability</small></div><div><b>10+</b><small>Languages*</small></div></div></div>
 <div className="vis"><div className="orb" style={{ width: '400px', height: '400px', right: '0', top: '60px' }}></div>
  <div className="phone"><div className="live"><i></i>Live call · 02:14</div><b style={{ fontSize: '16px' }}>Incoming: +91 98xxx xxxxx</b>
   <div className="wave"><u style={{ height: '45%' }}></u><u style={{ height: '53%' }}></u><u style={{ height: '28%' }}></u><u style={{ height: '65%' }}></u><u style={{ height: '76%' }}></u><u style={{ height: '34%' }}></u><u style={{ height: '26%' }}></u><u style={{ height: '23%' }}></u><u style={{ height: '17%' }}></u><u style={{ height: '66%' }}></u><u style={{ height: '85%' }}></u><u style={{ height: '52%' }}></u><u style={{ height: '22%' }}></u><u style={{ height: '43%' }}></u><u style={{ height: '81%' }}></u><u style={{ height: '83%' }}></u><u style={{ height: '61%' }}></u><u style={{ height: '50%' }}></u><u style={{ height: '37%' }}></u><u style={{ height: '28%' }}></u><u style={{ height: '48%' }}></u><u style={{ height: '42%' }}></u><u style={{ height: '18%' }}></u><u style={{ height: '97%' }}></u><u style={{ height: '48%' }}></u><u style={{ height: '49%' }}></u><u style={{ height: '39%' }}></u><u style={{ height: '36%' }}></u></div>
   <div className="msg ai">Hello, this is Aminoid. How can I help you today?</div>
   <div className="msg cu">I want to book an appointment for Friday.</div>
   <div className="msg ai">Friday has 11:00 and 15:30 open. Which suits you?</div>
   <div className="msg cu">11:00 works.</div>
   <div className="msg ai">Booked. A confirmation is on its way to your phone.</div></div>
  <div className="float f2" style={{ right: '-10px', bottom: '40px' }}><div className="live"><i></i>Outcome</div><b>Appointment booked</b><div style={{ color: 'var(--mu)', marginTop: '4px' }}>Lead scored: Hot</div></div></div></div></section>

<div className="logos"><div className="w center"><div style={{ color: 'var(--mu)', fontSize: '14px' }}>Connects with the tools your team already uses</div>
<div className="intg"><span>Telephony</span><span>WhatsApp</span><span>CRM</span><span>ERP</span><span>Calendar</span><span>Helpdesk</span></div></div></div>

<section><div className="w center"><span className="eyebrow">HOW A CALL IS HANDLED</span><h2>From ring to resolved in four steps</h2>
<div className="grid flow" style={{ textAlign: 'left' }}>
 <div className="card"><div className="num">1</div><h3>Answers instantly</h3><p>Picks up on the first ring, day or night, with no hold music.</p></div>
 <div className="card"><div className="num">2</div><h3>Understands the caller</h3><p>Listens in natural speech and captures name, need and urgency.</p></div>
 <div className="card"><div className="num">3</div><h3>Resolves or books</h3><p>Answers questions, schedules appointments or qualifies the lead.</p></div>
 <div className="card"><div className="num">4</div><h3>Hands off with context</h3><p>Transfers to a person when needed and logs everything to your CRM.</p></div></div></div></section>

<section className="alt"><div className="w center"><span className="eyebrow">CAPABILITIES</span><h2>Everything a front desk does, without the queue</h2>
<div className="grid six" style={{ textAlign: 'left' }}>
 <div className="card"><div className="ic">☎</div><h3>Inbound call handling</h3><p>Answers, routes and resolves common queries automatically.</p></div>
 <div className="card"><div className="ic">★</div><h3>Lead qualification</h3><p>Asks the right questions and scores every caller.</p></div>
 <div className="card"><div className="ic">▦</div><h3>Appointment booking</h3><p>Checks live calendars and confirms by message.</p></div>
 <div className="card"><div className="ic">↻</div><h3>Missed-call recovery</h3><p>Calls back every missed enquiry within minutes.</p></div>
 <div className="card"><div className="ic">文</div><h3>Multi-language</h3><p>Speaks your customers' language, with a natural accent.</p></div>
 <div className="card"><div className="ic">⇄</div><h3>Human handoff</h3><p>Escalates sensitive calls with a full summary attached.</p></div></div></div></section>

<section><div className="w"><div className="sp">
 <div><span className="eyebrow">VOICEFLOW MONITOR</span><h2 style={{ fontSize: '32px' }}>See every call as it happens</h2>
 <p className="lead">Listen in, read transcripts and track outcomes from one live dashboard.</p>
 <ul className="chk"><li>Live transcripts and call summaries</li><li>Caller sentiment and intent tags</li><li>Outcome tracking per campaign or team</li><li>Alerts when a call needs a person</li></ul></div>
 <div className="dash"><div className="dh"><i></i><i></i><i></i></div>
  <div className="kp"><div><b>1,284</b><small>Calls this week</small></div><div><b>94%</b><small>Resolved by AI</small></div><div><b>4.6</b><small>Avg. satisfaction</small></div></div>
  <div className="row2"><div><small style={{ color: 'var(--mu)' }}>Call volume by hour</small><div className="bars"><u style={{ height: '20%' }}></u><u style={{ height: '35%' }}></u><u style={{ height: '60%' }}></u><u style={{ height: '85%' }}></u><u style={{ height: '100%' }}></u><u style={{ height: '78%' }}></u><u style={{ height: '66%' }}></u><u style={{ height: '82%' }}></u><u style={{ height: '55%' }}></u><u style={{ height: '40%' }}></u></div></div>
  <div><small style={{ color: 'var(--mu)' }}>Live now</small><div className="call"><b>Priya S.</b> Booking<span className="tag">Active</span></div><div className="call"><b>Arun K.</b> Pricing<span className="tag">Active</span></div><div className="call"><b>Meena R.</b> Support<span className="tag">Active</span></div></div></div></div></div></div></section>

<section className="alt"><div className="w center"><span className="eyebrow">USE CASES</span><h2>Built for businesses that live on the phone</h2>
<div className="grid four4" style={{ textAlign: 'left' }}>
 <div className="card"><h3>Healthcare</h3><p>Patient reception, bookings and reminders.</p></div>
 <div className="card"><h3>Real estate</h3><p>Enquiry qualification and site-visit booking.</p></div>
 <div className="card"><h3>Retail &amp; e-commerce</h3><p>Order status, returns and product questions.</p></div>
 <div className="card"><h3>Education</h3><p>Admissions enquiries and student queries.</p></div></div>
<div className="band"><div><b>85%</b><small>Fewer manual tasks*</small></div><div><b>40–60%</b><small>Lower overhead*</small></div><div><b>&lt;30s</b><small>Response time*</small></div><div><b>24/7</b><small>Coverage</small></div></div></div></section>
</main>
  );
}
