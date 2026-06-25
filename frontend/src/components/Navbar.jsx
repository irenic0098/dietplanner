import React, { useEffect, useState } from 'react';
import { Bell, Check, Trophy } from 'lucide-react';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Navbar({ onToggleMenu }) {
  const { profile } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto fetch
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await client.post('notifications/mark_all_read/');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await client.post(`notifications/${id}/mark_read/`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="glass" style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-sm)', marginBottom: '30px', position: 'relative' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Welcome back!</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track your nutrition, hit your targets, and achieve milestones today.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Streak & XP Display */}
        {profile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-primary)', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)', fontWeight: 'bold' }}>
              🔥 {profile.streak} Days
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 'bold' }}>
              <Trophy size={16} /> {profile.points} XP
            </div>
          </div>
        )}

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ position: 'relative', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }} />
            )}
          </button>

          {showDropdown && (
            <div className="glass animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, width: '320px', borderRadius: 'var(--radius-sm)', padding: '16px', zIndex: 1000, marginTop: '8px', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontWeight: '700', fontSize: '0.9rem' }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    Mark all read
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>No notifications yet.</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: '8px 12px', 
                        borderRadius: 'var(--radius-sm)', 
                        background: n.is_read ? 'transparent' : 'var(--primary-light)',
                        borderLeft: `3px solid ${n.is_read ? 'var(--border)' : 'var(--primary)'}`,
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{n.title}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                      </div>
                      {!n.is_read && (
                        <button onClick={() => markRead(n.id)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
