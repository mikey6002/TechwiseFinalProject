import React, { useState } from 'react';
import './Navbar.css';

/**
 * Navbar Component - Left-side navigation bar
 * 
 * This component renders a collapsible left-side navbar with navigation items
 */
const Navbar = ({ onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleNavbar = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    if (onToggle) {
      onToggle(newExpandedState);
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      icon: '/svg_icons/dashboardIcon.svg',
      label: 'Dashboard',
      active: true
    },
    {
      id: 'dictionary',
      icon: '/svg_icons/dictionaryIcon.svg',
      label: 'Dictionary'
    },
    {
      id: 'history',
      icon: '/svg_icons/historyIcon.svg',
      label: 'History'
    },
    {
      id: 'help',
      icon: '/svg_icons/helpIcon.svg',
      label: 'Help'
    },
    {
      id: 'logout',
      icon: '/svg_icons/exitIcon.svg',
      label: 'Logout'
    }

  ];

  return (
    <nav className={`navbar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Toggle button */}
      <button 
        className="navbar-toggle" 
        onClick={toggleNavbar}
        aria-label="Toggle navigation"
      >
        <img 
          src="/svg_icons/menuIcon.svg" 
          alt="Menu"
          className="menu-icon"
        />
      </button>

      {/* Navigation items */}
      <ul className="navbar-items">
        {navItems.map((item) => (
          <li key={item.id} className={`navbar-item ${item.active ? 'active' : ''}`}>
            <a href="#" className="navbar-link" onClick={(e) => e.preventDefault()}>
              <img 
                src={item.icon} 
                alt={item.label}
                className="navbar-icon"
              />
              <span className="navbar-label">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
