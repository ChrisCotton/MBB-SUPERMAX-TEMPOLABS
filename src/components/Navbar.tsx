import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/kanban', label: 'Kanban Board' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-3 flex gap-6 items-center border-b border-gray-800">
      <span className="font-bold text-lg mr-8">Mental Bank</span>
      {navLinks.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`hover:text-primary transition-colors ${
            location.pathname === link.to ? 'text-primary font-semibold' : ''
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default Navbar; 