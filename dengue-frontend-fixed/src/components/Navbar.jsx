import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ pendingVerificationCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (user?.role === 'Councillor') navigate('/councillor');
    else if (user?.role === 'Inspector') navigate('/inspector');
    else navigate('/');
  };

  return (
    <header className="bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <button onClick={handleBack} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <span className="text-lg">🦟</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-sm leading-tight">Dengue Alert</p>
            <p className="text-xs text-red-200 leading-tight">Ward Management</p>
          </div>
        </button>

        {/* Right: User info + notification + logout */}
        <div className="flex items-center gap-3">
          {/* Notification bell — councillor only, for pending verifications */}
          {user?.role === 'Councillor' && pendingVerificationCount > 0 && (
            <button
              onClick={() => navigate('/councillor?filter=Pending+Verification')}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white bg-opacity-15 hover:bg-opacity-25 transition-colors"
              title={`${pendingVerificationCount} pending verification${pendingVerificationCount > 1 ? 's' : ''}`}
            >
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingVerificationCount > 9 ? '9+' : pendingVerificationCount}
              </span>
            </button>
          )}

          {/* User info */}
          {user && (
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold leading-tight">{user.full_name}</p>
              <p className="text-xs text-red-200 leading-tight">
                {user.role}{user.ward_id ? ` · Ward ${user.ward_id}` : ''}
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={logout}
            className="bg-white bg-opacity-15 hover:bg-opacity-25 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
