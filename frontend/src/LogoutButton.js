import React from 'react';

export default function LogoutButton({ onLogout }) {
  return (
    <button onClick={onLogout} style={{ marginBottom: 16 }}>
      Log out
    </button>
  );
} 