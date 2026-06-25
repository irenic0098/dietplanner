import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Utensils, 
  Activity, 
  MessageSquare, 
  Award, 
  BookOpen, 
  CreditCard, 
  LogOut, 
  Moon, 
  Sun,
  Users,
  Calendar,
  Sparkles,
  Search,
  X,
  ClipboardList,
  TrendingDown,
  Flower,
} from 'lucide-react';

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseLinks = [
    { to: '/dashboard',    label: 'Dashboard',            icon: LayoutDashboard },
    { to: '/tracking',     label: 'Daily Tracking',        icon: Activity },
    { to: '/weight-trend', label: 'Weight Trend',          icon: TrendingDown },
    { to: '/meals',        label: 'Meal Planner',          icon: Utensils },
    { to: '/diet-plan',    label: 'Diet Plan',             icon: ClipboardList },
    { to: '/foods',        label: 'Food Search',           icon: Search },
    { to: '/ai-coach',     label: 'AI Coach',              icon: Sparkles },
    { to: '/recipes',      label: 'Healthy Recipes',       icon: BookOpen },
    { to: '/yoga',         label: 'Yoga & Meditation',     icon: Flower },
    { to: '/gamification', label: 'Challenges',            icon: Award },
    { to: '/subscriptions', label: 'Premium',              icon: CreditCard },
  ];

  const dietitianLinks = [
    { to: '/dietitian/clients', label: 'Clients', icon: Users },
    { to: '/dietitian/appointments', label: 'Appointments', icon: Calendar },
    { to: '/dietitian/chat', label: 'Client Chat', icon: MessageSquare },
  ];

  const adminLinks = [
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: LayoutDashboard },
  ];

  const links = [
    ...baseLinks,
    ...(user?.role === 'dietitian' ? dietitianLinks : []),
    ...(user?.role === 'admin' ? adminLinks : []),
  ];

  const avatarLetter = user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <aside className="sidebar glass">

      {/* ── Brand / Logo ── */}
      <div className="sidebar-brand">
        <div style={{
          background: 'var(--primary)',
          color: 'white',
          borderRadius: '10px',
          fontWeight: '800',
          fontSize: '1rem',
          flexShrink: 0,
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          NP
        </div>
        <div className="sidebar-label" style={{ overflow: 'hidden' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
            NUTRIPLATE
          </h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nutrition Ecosystem</span>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, overflowY: 'auto' }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">
                <Icon size={20} />
              </span>
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Profile Footer ── */}
      <div className="sidebar-footer">
        {/* Avatar + Username */}
        <div className="sidebar-profile-row">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1rem',
            flexShrink: 0,
          }}>
            {avatarLetter}
          </div>
          <div className="sidebar-label" style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {user?.username}
            </p>
            <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Theme toggle + Logout */}
        <div className="sidebar-action-row">
          {/* Theme toggle — always shown as icon */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Logout — icon + label */}
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--danger)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: '700',
              fontSize: '0.85rem',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            title="Logout"
          >
            <LogOut size={18} style={{ flexShrink: 0 }} />
            <span className="sidebar-label">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
