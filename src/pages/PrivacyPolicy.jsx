import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const [dark, setDark] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark' || localStorage.getItem('aminod-theme') === 'dark'
  );

  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.getAttribute('data-theme') === 'dark'));
    obs.observe(el, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const bg = dark ? '#020617' : '#F7F8FF';
  const wrapperBg = dark ? 'transparent' : '#fff';
  const cardShadow = dark ? 'none' : '0 24px 80px rgba(15,23,42,0.08)';
  const text = dark ? '#E8EAFF' : '#0A0B0F';
  const muted = dark ? '#8899B4' : '#475569';

  return (
    <div style={{ minHeight: '100vh', padding: '80px 24px', background: bg, color: text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ maxWidth: 960, margin: '0 auto', background: wrapperBg, borderRadius: 24, boxShadow: cardShadow, padding: '48px 42px' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: 24, color: muted, textDecoration: 'none' }}>&larr; Back to home</Link>
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 36, marginBottom: 20 }}>Privacy Policy</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 24 }}>
          We collect only the data necessary to provide our service. Your information is never sold to third parties. All data is encrypted in transit and at rest.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 24 }}>
          You may request deletion of your account data at any time by contacting support@aminod.app.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 0 }}>
          We keep your privacy central to everything we build. We use industry standard controls to protect your personal information and we only retain it as long as necessary to deliver our service.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
