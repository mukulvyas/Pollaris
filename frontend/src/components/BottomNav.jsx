import React, { memo, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, MapPin, BookOpen, HelpCircle, Users } from 'lucide-react';

const navItems = [
  { name: 'HOME', path: '/', icon: Home, ariaLabel: 'Go to Home page' },
  { name: 'MAP', path: '/map', icon: MapPin, ariaLabel: 'Go to Map and find polling booth' },
  { name: 'CANDIDATES', path: '/candidates', icon: Users, ariaLabel: 'Go to Know Your Candidate page' },
  { name: 'GUIDE', path: '/guide', icon: BookOpen, ariaLabel: 'Go to Election Guide and Timeline' },
  { name: 'HELP', path: '/help', icon: HelpCircle, ariaLabel: 'Go to Help and Report Problem' },
];

/**
 * BottomNav — persistent app navigation bar.
 * Fires a Google Analytics page_view event on every tab click.
 */
const BottomNav = memo(() => {
  const handleNavClick = useCallback((pageName) => {
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('navigation_click', { page: pageName });
    }
  }, []);

  return (
    <nav className="fixed-bottom-nav flex justify-around items-center" aria-label="Main navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            id={`nav-${item.name.toLowerCase()}`}
            aria-label={item.ariaLabel}
            onClick={() => handleNavClick(item.name)}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`
            }
          >
            <Icon size={24} strokeWidth={2} aria-hidden="true" />
            <span className="text-[11px] font-bold tracking-tight">
              {item.name}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
});
BottomNav.displayName = 'BottomNav';

export default BottomNav;
