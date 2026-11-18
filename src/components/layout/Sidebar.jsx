import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Invoices & Payments', path: '/payments', icon: CreditCard },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden print:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">FreelanceOS</span>
              <span className="block text-[10px] font-medium uppercase tracking-wider text-indigo-400">
                Workspace
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 rounded-md lg:hidden hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Logout Footer */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.fullName || 'Freelancer'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.businessName || user?.email || 'Pro'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-700/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

