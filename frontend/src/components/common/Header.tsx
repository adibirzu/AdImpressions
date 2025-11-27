import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-dark-800 border-b border-dark-600 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AI</span>
            </div>
            <span className="text-2xl font-bold text-white">AdImpressions</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="hidden md:flex items-center space-x-3 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-white">{user?.username}</span>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
