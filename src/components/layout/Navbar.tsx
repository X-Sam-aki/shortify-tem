import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/useAuth';
import { Video, UserCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Video className="h-6 w-6 text-brand-purple" />
          <span className="font-montserrat font-bold text-xl">Shortify</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-brand-purple transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-gray-600" />
                <span className="text-sm font-medium hidden md:inline">
                  {user.name || user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-gray-600 hover:text-brand-purple"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" className="text-brand-purple hover:text-brand-purple-dark">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="btn-primary">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
