import React from 'react';
import './auth.css';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="glass auth-card animate-fade-in">
        <div className="auth-brand">
          <div className="auth-logo">DP</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
