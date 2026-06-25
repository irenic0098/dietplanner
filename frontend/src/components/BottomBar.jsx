import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
   LayoutDashboard, 
   Activity, 
   Sparkles, 
   ClipboardList,
   Flower,
} from 'lucide-react';

export default function BottomBar() {
  const links = [
    { to: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tracking',   label: 'Track',     icon: Activity },
    { to: '/diet-plan',  label: 'Diet Plan', icon: ClipboardList },
    { to: '/yoga',       label: 'Yoga',      icon: Flower },
    { to: '/ai-coach',   label: 'AI Coach',  icon: Sparkles },
  ];

  return (
    <nav className="bottom-bar">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 
              `bottom-bar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
