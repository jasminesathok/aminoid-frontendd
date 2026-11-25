import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
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
        <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 36, marginBottom: 20 }}>Terms & Conditions</h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 24 }}>
          By using AMINOID you agree to use the platform lawfully. We reserve the right to suspend accounts that violate our acceptable use policy.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 24 }}>
          All plans are billed monthly or annually and may be cancelled at any time.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: muted, marginBottom: 0 }}>
          Refunds are issued within 7 days of purchase.
        </p>
      </div>
    </div>
  );
};

export default TermsConditions;
