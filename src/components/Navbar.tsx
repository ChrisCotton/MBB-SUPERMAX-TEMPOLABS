import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

const navLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/categories', label: 'Categories' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/kanban', label: 'Kanban Board' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('display_name, avatar_url')
          .eq('user_id', user.id)
          .single();
        setProfile(data || null);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-3 flex gap-6 items-center border-b border-gray-800 justify-between">
      <div className="flex gap-6 items-center">
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
      </div>
      <div className="flex items-center gap-2 relative">
        {profile && (
          <>
            <button
              className="flex items-center gap-2 focus:outline-none"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="mr-2 text-sm font-medium text-white/80">{profile.display_name || 'User'}</span>
              <Avatar>
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || 'User'} />
                <AvatarFallback>{(profile.display_name || 'U').charAt(0)}</AvatarFallback>
              </Avatar>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-12 mt-2 w-40 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                  onClick={() => setMenuOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 