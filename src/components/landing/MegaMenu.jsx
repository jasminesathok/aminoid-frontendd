import React, { useState } from 'react';

const IC = {
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  chart: "M3 3v18h18M7 14l4-4 3 3 5-6",
  cal: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  users: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M21 21v-2a4 4 0 0 0-3-3.9",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 .5-1.5-1L15 4h-4l-.5 2.5-1.5 1L7 7 5 11l2 1v1l-2 1 2 4 2-.5 1.5 1L11 20h4l.5-2.5 1.5-1 2 .5 2-4-2-1z",
  bolt: "M13 2L3 14h8l-1 8 10-12h-8z",
  pulse: "M3 12h3l3-8 4 16 3-8h5",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  case: "M3 7h18v13H3zM9 7V4h6v3M3 13h18",
  layers: "M12 2l10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5",
  bldg: "M4 21V3h10v18M14 9h6v12M8 7h2M8 11h2M8 15h2",
  heart: "M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z",
  cart: "M3 3h2l3 12h11l2-8H6M9 20h.01M18 20h.01",
  cap: "M2 9l10-5 10 5-10 5zM6 11v5c3 2 9 2 12 0v-5",
  dial: "M4 4h4l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2"
};

const CATS = ['All Products', 'Voice & Calls', 'Chat & Messaging', 'Sales & CRM', 'Operations & ERP', 'HR & Workforce', 'Analytics & Insights'];

// [name, description, category, icon, opens, tryOpens]
const PR = [
  ['CallZenza', 'AI voice agent that answers inbound calls, qualifies leads and resolves queries in natural speech.', 'Voice & Calls', 'phone', 'products', 'callzenza'],
  ['AI Receptionist', 'Front-desk AI that schedules, reminds and routes customer enquiries 24/7.', 'Voice & Calls', 'cal', 'receptionist', 'receptionist'],
  ['CRM & Sales Ops', 'Connected sales workflows and customer journeys from enquiry to close.', 'Sales & CRM', 'chart', 'pricing'],
  ['Galaxy Chat', 'Conversational AI across web, mobile and messaging with live human handoff.', 'Chat & Messaging', 'chat', 'pricing'],
  ['Digital Hub', 'Intelligent analytics and real-time monitoring for faster decisions.', 'Analytics & Insights', 'layers', 'pricing'],
  ['VoiceFlow Monitor', 'Listen in, read transcripts and track every call outcome from one live view.', 'Analytics & Insights', 'pulse', 'pricing'],
  ['Auto Dialer', 'Outbound calling that runs automatically so your team reaches more customers.', 'Voice & Calls', 'dial', 'pricing'],
  ['Lead Qualification', 'Scores intent on every enquiry and routes hot leads to the right person.', 'Sales & CRM', 'target', 'pricing'],
  ['Aminoid ERP', 'Connected operations, inventory and back-office workflows in one system.', 'Operations & ERP', 'case', 'pricing'],
  ['Workforce', 'Attendance, tasks and team coordination for field and office staff.', 'HR & Workforce', 'users', 'pricing'],
  ['Scheduler', 'Live calendars, bookings and automatic confirmations and reminders.', 'Operations & ERP', 'bolt', 'pricing'],
  ['Omnichannel Inbox', 'Calls, chats and WhatsApp conversations in one shared inbox.', 'Chat & Messaging', 'gear', 'pricing']
];

const SU = [
  ['Front Desk Suite', 'AI Receptionist, CallZenza and Galaxy Chat working together on every enquiry.', '', 'layers', 'pricing'],
  ['Sales Suite', 'CRM, Lead Qualification, Auto Dialer and missed-call recovery for your sales team.', '', 'chart', 'pricing'],
  ['Operations Suite', 'ERP, Workforce and Scheduler to run daily operations smoothly.', '', 'case', 'pricing'],
  ['Insights Suite', 'Digital Hub and VoiceFlow Monitor for live visibility and ROI tracking.', '', 'pulse', 'pricing']
];

const SO = [
  ['Real Estate', 'Instant caller qualification, enquiry routing and site-visit booking.', '', 'bldg', 'solutions'],
  ['Healthcare', 'Patient reception, appointment scheduling and automated reminders.', '', 'heart', 'pricing'],
  ['Retail & E-Commerce', '24/7 customer service, order queries and sales engagement.', '', 'cart', 'pricing'],
  ['Education', 'Admissions enquiries, student onboarding and query resolution.', '', 'cap', 'pricing'],
  ['Manufacturing & ERP', 'Connected ERP operations and supply chain monitoring.', '', 'gear', 'pricing'],
  ['Service Businesses', 'Never miss an enquiry and automate lead follow-ups.', '', 'users', 'pricing']
];

export default function MegaMenu({ isOpen, onClose, onNavigate }) {
  const [tab, setTab] = useState('stack');
  const [cat, setCat] = useState('All Products');
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  let list = tab === 'suite' ? SU : tab === 'solution' ? SO : PR.filter(r => (tab === 'all' || cat === 'All Products' || r[2] === cat));
  if (q) {
    list = [...PR, ...SU, ...SO].filter(r => (r[0] + ' ' + r[1]).toLowerCase().includes(q));
  }

  const renderIcon = (k) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={IC[k]} />
    </svg>
  );

  return (
    <div className={`mega ${isOpen ? 'open' : ''} ${tab !== 'stack' ? 'nosb' : ''}`} id="mega" role="dialog" aria-label="Products menu">
      <div className="mtop">
        <div className="mtabs">
          <button data-t="stack" className={tab === 'stack' ? 'on' : ''} onClick={() => { setTab('stack'); setSearch(''); }}>Stack</button>
          <button data-t="suite" className={tab === 'suite' ? 'on' : ''} onClick={() => { setTab('suite'); setSearch(''); }}>Suite</button>
          <button data-t="solution" className={tab === 'solution' ? 'on' : ''} onClick={() => { setTab('solution'); setSearch(''); }}>Solution</button>
          <button data-t="all" className={tab === 'all' ? 'on' : ''} onClick={() => { setTab('all'); setSearch(''); }}>All Products</button>
        </div>
        <button className="mx" aria-label="Close menu" onClick={onClose}>✕</button>
      </div>
      <div className="mbody">
        <aside className="mside">
          <div className="msearch">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input
              id="msq"
              placeholder="I'm looking for"
              autoComplete="off"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul id="mcats">
            {CATS.map(c => (
              <li
                key={c}
                className={c === cat ? 'on' : ''}
                onClick={() => { setCat(c); setTab('stack'); setSearch(''); }}
              >
                {c}
              </li>
            ))}
          </ul>
        </aside>
        <div className="mgrid" id="mgrid">
          {list.length ? (
            list.map((r, i) => {
              const body = (
                <div>
                  <div className="mh">
                    {renderIcon(r[3])}
                    <b>{r[0]}</b>
                  </div>
                  <p>{r[1]}</p>
                </div>
              );

              if (r[5]) {
                return (
                  <div
                    key={r[0] + i}
                    className="mc"
                    data-go={r[4]}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if (!e.target.closest('a')) {
                        onNavigate(r[4]);
                      }
                    }}
                  >
                    {body}
                    <a
                      className="try"
                      href="#"
                      data-go={r[5]}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(r[5]);
                      }}
                    >
                      Try Now ›
                    </a>
                  </div>
                );
              }

              return (
                <a
                  key={r[0] + i}
                  href="#"
                  className="mc"
                  data-go={r[4]}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(r[4]);
                  }}
                >
                  {body}
                  <span className="try">Try Now ›</span>
                </a>
              );
            })
          ) : (
            <div className="mnone">No products match "{q}". Try another word.</div>
          )}
        </div>
      </div>
    </div>
  );
}
