import React, { useState, useEffect } from 'react';
import Solutions3DAnimation from './Solutions3DAnimation';

export default function SolutionsPage({ hidden, onNavigate }) {
  const [isLight, setIsLight] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'light';
    }
    return false;
  });

  useEffect(() => {
    const checkTheme = () => {
      const current = document.documentElement.getAttribute('data-theme') === 'light';
      setIsLight(current);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleCta = (e) => {
    const ctaEl = document.getElementById('cta');
    if (ctaEl) {
      ctaEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNav = (target) => (e) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(target);
    }
  };

  return (
    <main id="v-solutions" hidden={hidden} className="solutions-container">
      <style>{`
        #v-solutions {
          --bg: #07061a;
          --card: #0f0d2a;
          --line: #2a2560;
          --pri: #6d4cff;
          --pri2: #9b82ff;
          --txt: #eceaff;
          --mut: #9a96c8;
          --teal: #37e0c0;
          background: var(--bg);
          color: var(--txt);
          font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.55;
          min-height: 100vh;
          transition: background-color 0.25s, color 0.25s;
        }

        html[data-theme="light"] #v-solutions {
          --bg: #f6f5ff;
          --card: #ffffff;
          --line: rgba(109, 74, 255, 0.18);
          --pri: #6d4cff;
          --pri2: #5a3de6;
          --txt: #1a1640;
          --mut: #5b5883;
          --teal: #0b8aa8;
        }

        #v-solutions[hidden] {
          display: none !important;
        }

        #v-solutions .wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 20px;
          width: 100%;
          box-sizing: border-box;
        }

        #v-solutions section {
          padding: 72px 0;
          position: relative;
          box-sizing: border-box;
        }

        #v-solutions .glow {
          background: radial-gradient(ellipse at 50% 120%, rgba(109, 76, 255, 0.45), transparent 65%);
        }

        html[data-theme="light"] #v-solutions .glow {
          background: radial-gradient(ellipse at 50% 120%, rgba(109, 76, 255, 0.12), transparent 65%);
        }

        #v-solutions .eyebrow {
          display: inline-block;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--pri2);
          border: 1px solid var(--line);
          border-radius: 20px;
          padding: 5px 12px;
          margin-bottom: 16px;
          font-weight: 600;
        }

        #v-solutions h1 {
          font-family: 'Instrument Serif', Georgia, "Times New Roman", serif;
          font-weight: 400;
          font-size: clamp(34px, 5.4vw, 60px);
          line-height: 1.1;
          margin: 0 0 18px;
          color: var(--txt);
          letter-spacing: -0.01em;
        }

        #v-solutions h1 em {
          font-style: italic;
          color: var(--pri2);
        }

        #v-solutions h2 {
          font-family: 'Instrument Serif', Georgia, "Times New Roman", serif;
          font-weight: 400;
          font-size: clamp(24px, 3.4vw, 36px);
          text-align: center;
          margin: 0 0 36px;
          color: var(--txt);
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        #v-solutions .lead {
          color: var(--mut);
          max-width: 560px;
          font-size: 17px;
          line-height: 1.6;
        }

        #v-solutions .btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin: 26px 0;
        }

        #v-solutions .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 30px;
          border: 1px solid var(--pri2);
          color: var(--txt);
          transition: all 0.2s ease;
          cursor: pointer;
          background: transparent;
        }

        #v-solutions .btn:hover {
          transform: translateY(-2px);
          border-color: #fff;
          color: #fff;
        }

        #v-solutions .btn.p {
          background: linear-gradient(135deg, var(--pri), #8a5cff);
          border-color: transparent;
          color: #fff !important;
          box-shadow: 0 0 28px rgba(109, 76, 255, 0.5);
        }

        #v-solutions .btn.p:hover {
          box-shadow: 0 0 36px rgba(109, 76, 255, 0.7);
          filter: brightness(1.08);
        }

        #v-solutions .btn.w {
          background: var(--txt);
          color: #1a1450 !important;
          border-color: transparent;
        }

        #v-solutions .btn.w:hover {
          background: #fff;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
        }

        html[data-theme="light"] #v-solutions .btn.w {
          background: #1a1450;
          color: #ffffff !important;
        }

        #v-solutions .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 36px;
          align-items: center;
        }

        @media (max-width: 860px) {
          #v-solutions .hero {
            grid-template-columns: 1fr;
          }
        }

        #v-solutions .stats {
          display: flex;
          gap: 0;
          border-top: 1px solid var(--line);
          padding-top: 20px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        #v-solutions .stats div {
          padding: 0 22px;
          border-left: 1px solid var(--line);
        }

        #v-solutions .stats div:first-child {
          padding-left: 0;
          border: 0;
        }

        #v-solutions .stats b {
          display: block;
          font-family: 'Instrument Serif', Georgia, serif;
          font-weight: 400;
          font-size: 32px;
          color: var(--txt);
          line-height: 1.1;
        }

        #v-solutions .stats span {
          font-size: 12px;
          color: var(--mut);
        }

        #v-solutions .dash {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 0 50px rgba(109, 76, 255, 0.25);
          backdrop-filter: blur(8px);
        }

        html[data-theme="light"] #v-solutions .dash {
          box-shadow: 0 10px 40px rgba(80, 60, 170, 0.08);
        }

        #v-solutions .dash .tag {
          font-size: 11px;
          color: var(--teal);
          margin-bottom: 8px;
          font-weight: 600;
        }

        #v-solutions .dash b {
          color: var(--txt);
        }

        #v-solutions .cols {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 12px;
        }

        #v-solutions .mini {
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 10px;
          font-size: 12px;
          color: var(--mut);
          background: rgba(255, 255, 255, 0.02);
        }

        html[data-theme="light"] #v-solutions .mini {
          background: rgba(109, 74, 255, 0.04);
        }

        #v-solutions .mini b {
          display: block;
          color: var(--txt);
          font-size: 13px;
          font-weight: 700;
        }

        #v-solutions .grid {
          display: grid;
          gap: 16px;
        }

        #v-solutions .g4 {
          grid-template-columns: repeat(4, 1fr);
        }

        #v-solutions .g5 {
          grid-template-columns: repeat(5, 1fr);
        }

        #v-solutions .g3 {
          grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 960px) {
          #v-solutions .g4,
          #v-solutions .g5,
          #v-solutions .g3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 560px) {
          #v-solutions .g4,
          #v-solutions .g5,
          #v-solutions .g3 {
            grid-template-columns: 1fr;
          }
        }

        #v-solutions .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 20px;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }

        html[data-theme="light"] #v-solutions .card {
          box-shadow: 0 4px 20px rgba(80, 60, 170, 0.05);
        }

        #v-solutions .card:hover {
          border-color: var(--pri2);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(109, 76, 255, 0.25);
        }

        #v-solutions .card h3 {
          margin: 0 0 8px;
          font-size: 16px;
          font-weight: 700;
          color: var(--txt);
        }

        #v-solutions .card p {
          margin: 0;
          font-size: 13.5px;
          color: var(--mut);
          line-height: 1.5;
        }

        #v-solutions .ic {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--pri), #8a5cff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          margin-bottom: 14px;
        }

        #v-solutions .kick {
          font-size: 10.5px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--teal);
          margin-bottom: 6px;
          font-weight: 700;
        }

        #v-solutions .sub {
          text-align: center;
          color: var(--mut);
          margin: -22px auto 32px;
          max-width: 520px;
          font-size: 15px;
        }

        #v-solutions .nums {
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 28px 0;
          margin-top: 36px;
          text-align: center;
        }

        #v-solutions .nums b {
          display: block;
          font-family: 'Instrument Serif', Georgia, serif;
          font-weight: 400;
          font-size: 38px;
          color: var(--txt);
          line-height: 1.1;
        }

        #v-solutions .nums span {
          font-size: 12px;
          color: var(--mut);
        }

        #v-solutions .more {
          display: inline-block;
          margin-top: 12px;
          font-size: 13px;
          color: var(--pri2);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.15s ease;
          cursor: pointer;
        }

        #v-solutions .more:hover {
          color: #fff;
          text-decoration: underline;
        }

        html[data-theme="light"] #v-solutions .more:hover {
          color: var(--pri);
        }

        #v-solutions .cta {
          text-align: center;
        }

        #v-solutions .pts {
          display: flex;
          justify-content: center;
          gap: 28px;
          flex-wrap: wrap;
          margin: 26px 0;
        }

        #v-solutions .pts div {
          max-width: 190px;
          font-size: 12.5px;
          color: var(--mut);
          line-height: 1.45;
        }

        #v-solutions .pts b {
          display: block;
          color: var(--txt);
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        #v-solutions .cta .btns {
          justify-content: center;
        }
      `}</style>

      {/* 1 HERO */}
      <section className="glow">
        <div className="wrap hero">
          <div>
            <span className="eyebrow">Enterprise Voice &amp; Omnichannel AI</span>
            <h1>
              Turn every customer conversation into <em>revenue &amp; growth.</em>
            </h1>
            <p className="lead">
              Aminoid AI brings voice agents, WhatsApp chatbots, dialer, CRM, HRMS, and ERP into one platform, so every enquiry gets answered, qualified, and followed up within seconds.
            </p>
            <div className="btns">
              <a className="btn p" href="#cta" data-cta onClick={handleCta}>
                Book Demo →
              </a>
              <a className="btn" href="#callzenza" data-go="callzenza" onClick={handleNav('callzenza')}>
                Test an AI Agent
              </a>
            </div>
            <div className="stats">
              <div>
                <b>0</b>
                <span>Missed enquiries</span>
              </div>
              <div>
                <b>&lt;30s</b>
                <span>Speed-to-lead</span>
              </div>
              <div>
                <b>24/7</b>
                <span>Voice &amp; WhatsApp</span>
              </div>
            </div>
          </div>
          <Solutions3DAnimation isLight={isLight}>
            <div className="dash">
              <div className="tag">● New lead · Just now</div>
              <b>Arjun M. · Interested in CRM</b>
              <div style={{ fontSize: '12px', color: 'var(--mut)' }}>
                Qualified by AI · Demo requested
              </div>
              <div className="cols">
                <div className="mini">
                  <b>148</b>Calls answered today
                </div>
                <div className="mini">
                  <b>12</b>Demos booked
                </div>
                <div className="mini">
                  <b>Karthik V.</b>Follow-up scheduled
                </div>
                <div className="mini">
                  <b>Priya R.</b>Invoice reminder sent
                </div>
              </div>
            </div>
          </Solutions3DAnimation>
        </div>
      </section>

      {/* 2 THE CHALLENGE */}
      <section>
        <div className="wrap">
          <h2>Fragmented tools and slow response kill conversion</h2>
          <div className="grid g4">
            <div className="card">
              <div className="ic">1</div>
              <h3>Missed inbound calls</h3>
              <p>Callers rarely leave a voicemail. They call the next vendor on Google.</p>
            </div>
            <div className="card">
              <div className="ic">2</div>
              <h3>Slow lead response</h3>
              <p>Buyer interest fades within minutes. Manual callbacks reach cold leads.</p>
            </div>
            <div className="card">
              <div className="ic">3</div>
              <h3>Disconnected tools</h3>
              <p>Calls, WhatsApp, CRM, HR, and ERP don’t share context, so customers repeat themselves.</p>
            </div>
            <div className="card">
              <div className="ic">4</div>
              <h3>High operational overhead</h3>
              <p>Your best people spend their days on qualification questions and scheduling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 THE JOURNEY */}
      <section className="glow">
        <div className="wrap">
          <h2>From first customer contact to retention</h2>
          <div className="grid g5">
            <div className="card">
              <div className="ic">1</div>
              <h3>Engage</h3>
              <p>Voice and WhatsApp agents greet every prospect instantly, 24/7.</p>
            </div>
            <div className="card">
              <div className="ic">2</div>
              <h3>Qualify</h3>
              <p>AI captures budget, timeline, and needs, and updates your CRM.</p>
            </div>
            <div className="card">
              <div className="ic">3</div>
              <h3>Schedule</h3>
              <p>Qualified leads are booked on your calendar with WhatsApp reminders.</p>
            </div>
            <div className="card">
              <div className="ic">4</div>
              <h3>Execute</h3>
              <p>Quotes and orders flow into your ERP without manual entry.</p>
            </div>
            <div className="card">
              <div className="ic">5</div>
              <h3>Retain</h3>
              <p>Automated check-ins, invoice nudges, and renewal prompts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 OPERATIONAL STAGES */}
      <section>
        <div className="wrap">
          <h2>Intelligent automation for every operational stage</h2>
          <div className="grid g3">
            <div className="card">
              <div className="kick">Revenue &amp; Sales</div>
              <h3>Lead qualification</h3>
              <p>Separates serious buyers from casual enquiries and routes them to the right rep.</p>
            </div>
            <div className="card">
              <div className="kick">Revenue &amp; Sales</div>
              <h3>Demo &amp; meeting booking</h3>
              <p>Checks live availability and confirms the meeting during the conversation.</p>
            </div>
            <div className="card">
              <div className="kick">Revenue &amp; Sales</div>
              <h3>Missed-call recovery</h3>
              <p>Triggers a callback or WhatsApp message seconds after a missed call.</p>
            </div>
            <div className="card">
              <div className="kick">Operations &amp; Support</div>
              <h3>Omnichannel support</h3>
              <p>Resolves common queries across voice, chat, and WhatsApp from your knowledge base.</p>
            </div>
            <div className="card">
              <div className="kick">Operations &amp; Support</div>
              <h3>Payment &amp; invoice tracking</h3>
              <p>Sends polite invoice updates and payment reminders automatically.</p>
            </div>
            <div className="card">
              <div className="kick">Operations &amp; Support</div>
              <h3>Reviews &amp; referrals</h3>
              <p>Asks happy customers for reviews and referrals after a resolved request.</p>
            </div>
          </div>
          <div className="nums">
            <div>
              <b>85%</b>
              <span>Queries resolved by AI</span>
            </div>
            <div>
              <b>300%</b>
              <span>Faster response</span>
            </div>
            <div>
              <b>0</b>
              <span>Missed enquiries</span>
            </div>
            <div>
              <b>2h+</b>
              <span>Saved per rep daily</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5 THE AMINOID ECOSYSTEM */}
      <section className="glow" id="sol-products">
        <div className="wrap">
          <div style={{ textAlign: 'center' }}>
            <span className="eyebrow">The Aminoid Ecosystem</span>
          </div>
          <h2>One platform. Every product your business needs.</h2>
          <div className="grid g4">
            <div className="card">
              <div className="ic">V</div>
              <h3>AI Voice Agents</h3>
              <p>Human-like inbound and outbound calling in natural, localised speech.</p>
              <a className="more" href="#callzenza" data-go="callzenza" onClick={handleNav('callzenza')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">C</div>
              <h3>Chatbots</h3>
              <p>WhatsApp and web bots that handle enquiries, bookings, and support.</p>
              <a className="more" href="#receptionist" data-go="receptionist" onClick={handleNav('receptionist')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">D</div>
              <h3>Dialer</h3>
              <p>Predictive and progressive calling with logs, dispositions, and recordings.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">R</div>
              <h3>CRM</h3>
              <p>Every lead, conversation, and deal in one pipeline.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">H</div>
              <h3>HRMS</h3>
              <p>Attendance, leave, payroll, and employee records in one place.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">E</div>
              <h3>ERP</h3>
              <p>Quotes, orders, invoices, and inventory, synced with your CRM.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">L</div>
              <h3>Language AI</h3>
              <p>Chat, translation, and code-mixed language support.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">S</div>
              <h3>Voice AI</h3>
              <p>Speech-to-text, text-to-speech, and voice cloning.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">O</div>
              <h3>Document AI</h3>
              <p>OCR, data extraction, and document translation.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
            <div className="card">
              <div className="ic">&lt;/&gt;</div>
              <h3>Developer Platform</h3>
              <p>API, Console, and SDK (Python and JS) to build your own agents.</p>
              <a className="more" href="#products" data-go="products" onClick={handleNav('products')}>
                Learn more →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6 CALL TO ACTION */}
      <section className="glow cta" id="sol-demo">
        <div className="wrap">
          <h2 style={{ marginBottom: '10px' }}>Ready to answer every customer?</h2>
          <p className="lead" style={{ margin: '0 auto' }}>
            Voice, chat, CRM, and automation focused in one platform.
          </p>
          <div className="pts">
            <div>
              <b>More control</b>One dashboard for every conversation
            </div>
            <div>
              <b>More predictability</b>Consistent, automated follow-ups
            </div>
            <div>
              <b>More visibility</b>Live analytics across teams
            </div>
            <div>
              <b>More growth</b>Faster response, more conversions
            </div>
          </div>
          <div className="btns">
            <a className="btn p" href="#cta" data-cta onClick={handleCta}>
              Book Demo →
            </a>
            <a className="btn" href="#cta" data-cta onClick={handleCta}>
              Talk to Support
            </a>
            <a className="btn w" href="#pricing" data-go="pricing" onClick={handleNav('pricing')}>
              Start Free Trial
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
