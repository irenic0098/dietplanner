import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import toast from 'react-hot-toast';
import { Check, ShieldCheck, Heart, Users, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Subscriptions() {
  const { profile, fetchProfile } = useAuthStore();
  const [sub, setSub] = useState(null);

  const fetchSubscription = async () => {
    try {
      const res = await client.get('subscriptions/');
      setSub(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (planType) => {
    try {
      const res = await client.post('subscriptions/', { plan_type: planType });
      setSub(res.data);
      toast.success(`Successfully switched to ${res.data.plan_display}!`);
      fetchProfile();
    } catch (err) {
      toast.error('Failed to change plan.');
    }
  };

  const plans = [
    {
      type: 'free',
      name: 'Free Basic',
      price: '$0',
      description: 'Track core daily macros, water amounts, and weights.',
      icon: Heart,
      color: 'var(--text-muted)',
      features: [
        'Water intake logger',
        'Weight trend tracking',
        'Meal completions log',
        'Core food database lookup',
      ]
    },
    {
      type: 'premium',
      name: 'Premium Pro',
      price: '$9.99/mo',
      description: 'Unlock AI algorithms, visual food scanners, and recipe lists.',
      icon: Star,
      color: 'var(--primary)',
      features: [
        'Everything in Free Basic',
        'AI Diet Plan Recommendation',
        'AI Food Image Recognition scanner',
        'AI Chatbot Nutrition Assistant',
        'Full PDF & Excel exports',
        'Daily streaks achievements',
      ]
    },
    {
      type: 'dietitian',
      name: 'Dietitian Coach',
      price: '$29.99/mo',
      description: 'Real interaction with certified professional coaches.',
      icon: Users,
      color: 'var(--accent)',
      features: [
        'Everything in Premium Pro',
        'Licensed dietitian consultation matching',
        'Live messaging chat client',
        'Interactive calendar appointments',
        'Custom template prescription feeds',
      ]
    }
  ];

  return (
    <div className="animate-fade-in">
      <div className="header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Upgrade Your Plan</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Get access to advanced AI vision recognition, dietitian consultations, and PDF summaries.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '20px' }}>
        {plans.map(p => {
          const isCurrent = sub?.plan_type === p.type;
          const Icon = p.icon;
          return (
            <div 
              key={p.type} 
              className="card glass" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                border: `2px solid ${isCurrent ? p.color : 'var(--border)'}`,
                boxShadow: isCurrent ? 'var(--shadow-lg)' : 'var(--shadow)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: p.color }}>
                  <Icon size={20} />
                </div>
                {isCurrent && (
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active Plan</span>
                )}
              </div>

              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800' }}>{p.name}</h3>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>{p.price}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>{p.description}</p>
              </div>

              <div style={{ flexGrow: 1, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none' }}>
                  {p.features.map((f, idx) => (
                    <li key={idx} style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Check size={14} color="var(--primary)" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleUpgrade(p.type)}
                className="btn btn-primary" 
                style={{ width: '100%', background: isCurrent ? 'var(--border)' : p.color, cursor: isCurrent ? 'default' : 'pointer' }}
                disabled={isCurrent}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
