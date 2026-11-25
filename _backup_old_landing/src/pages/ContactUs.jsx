import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
  const [dark, setDark] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark' || localStorage.getItem('aminod-theme') === 'dark'
  );

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => {
      setDark(el.getAttribute('data-theme') === 'dark');
    });
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const bg = dark ? '#020617' : '#F7F8FF';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : '#F7F9FF';
  const cardBorder = dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(147,155,255,0.25)';
  const text = dark ? '#E8EAFF' : '#0A0B0F';
  const muted = dark ? '#8899B4' : '#475569';

  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px', background: bg, color: text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto', background: dark ? 'transparent' : '#fff', borderRadius: 24, boxShadow: dark ? 'none' : '0 24px 80px rgba(15,23,42,0.08)', padding: '48px 42px' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: 24, color: muted, textDecoration: 'none' }}>&larr; Back to home</Link>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 36, marginBottom: 20 }}>Contact Us</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 24 }}>
          Have a question about AMINOID? We're happy to help. Whether you want to learn more about pricing, need technical support,
          or want to discuss your onboarding plan, our team is ready to respond.
        </p>
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ padding: 24, background: cardBg, borderRadius: 20, border: cardBorder }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: text }}>Email</h2>
            <ul style={{ listStyle: 'disc inside', color: muted, lineHeight: 1.8 }}>
              <li>hello@aminoid.app — General enquiries</li>
              <li>support@aminoid.app — Technical support</li>
              <li>billing@aminoid.app — Billing & plans</li>
            </ul>
          </div>
          <div style={{ padding: 24, background: cardBg, borderRadius: 20, border: cardBorder }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: text }}>Phone</h2>
            <p style={{ color: muted, lineHeight: 1.8, marginBottom: 12 }}>Call us at <strong>+91 98765 43210</strong></p>
            <p style={{ color: muted, lineHeight: 1.8 }}>Available Monday to Friday, 9am–6pm IST.</p>
          </div>
          <div style={{ padding: 24, background: cardBg, borderRadius: 20, border: cardBorder }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: text }}>Need help faster?</h2>
            <p style={{ color: muted, lineHeight: 1.8, marginBottom: 12 }}>
              Please include your company name and a brief description of your request.
            </p>
            <p style={{ color: muted, lineHeight: 1.8 }}>We aim to reply within 24 hours on business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
