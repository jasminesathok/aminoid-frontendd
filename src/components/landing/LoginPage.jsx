import React from 'react';
import Login from '../../pages/Login';

export default function LoginPage({ hidden, onNavigate }) {
  if (hidden) return null;
  return (
    <main id="v-login" hidden={hidden}>
      <Login onBack={() => onNavigate && onNavigate('home')} />
    </main>
  );
}
