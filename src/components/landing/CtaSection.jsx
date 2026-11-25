import React from 'react';

export default function CtaSection() {
  return (
    <section id="cta" className="cta"><div className="w"><h2 style={{ margin: '0 auto', fontSize: '44px' }}>Ready to answer every customer?</h2>
<p className="lead" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Put voice, chat, CRM and analytics to work in one AI platform.</p>
<div className="three"><div><b>More control</b>One connected platform</div><div><b>More productivity</b>Automation everywhere</div><div><b>More visibility</b>Real-time insight</div><div><b>More growth</b>Built to scale</div></div>
<div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}><a className="btn b1" href="mailto:hello@aminoid.ai?subject=Book%20a%20demo">Get a free demo →</a><a className="btn b2" href="mailto:hello@aminoid.ai?subject=Book%20a%20demo">Talk to an expert</a><a className="btn b3" href="#" data-go="pricing">Start free trial</a></div></div></section>
  );
}
