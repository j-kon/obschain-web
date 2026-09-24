import React from 'react';
import { NavLink } from 'react-router-dom';
import { Radio, AlertCircle, Info, Home } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/events', label: 'Events', icon: Radio },
    { to: '/incidents', label: 'Incidents', icon: AlertCircle },
    { to: '/about', label: 'Architecture', icon: Info },
  ];

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-surface-card'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
