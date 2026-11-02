import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  HeartHandshake,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Shield,
  Utensils,
  Building2,
  Bike,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenReportModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onOpenReportModal }) => {
  const { user, logout, quickLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'available-food', label: 'Available Food' },
    { id: 'donate-food', label: 'Donate Food' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const getDashboardIdForRole = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'admin-dashboard';
      case 'donor': return 'donor-dashboard';
      case 'ngo': return 'ngo-dashboard';
      case 'volunteer': return 'volunteer-dashboard';
      default: return 'home';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Shield };
      case 'donor':
        return { label: 'Food Donor', bg: 'bg-emerald-100 text-[#066B4B] border-emerald-200', icon: Utensils };
      case 'ngo':
        return { label: 'Verified NGO', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Building2 };
      case 'volunteer':
        return { label: 'Rescue Volunteer', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Bike };
      default:
        return { label: 'User', bg: 'bg-gray-100 text-gray-800 border-gray-200', icon: UserIcon };
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
      {/* Top micro announcement bar */}
      <div className="bg-[#064E3B] text-emerald-100 px-4 py-1 text-xs text-center font-medium flex items-center justify-center gap-3">
        <span>🍲 Over 3,500 kg safe surplus food rescued this month across major metropolitan hubs.</span>
        <button
          onClick={onOpenReportModal}
          className="underline hover:text-white flex items-center gap-1 font-semibold ml-2 transition"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Safety Hotline
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#066B4B] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-[#B9E769]" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#064E3B] flex items-center">
                Food<span className="text-[#066B4B]">Mitra</span>
              </span>
              <span className="block text-[10px] tracking-wider uppercase font-semibold text-gray-500">
                Rescue • Redistribute • Dignity
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === link.id
                    ? 'text-[#066B4B] bg-emerald-50'
                    : 'text-gray-700 hover:text-[#066B4B] hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Actions & Role Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-[#066B4B] rounded-lg border border-emerald-200 transition"
                title="Switch between the 4 roles to test all dashboards"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#066B4B]" />
                <span>Demo Roles</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-2 z-50 animate-scale-in"
                  onClick={() => setDemoMenuOpen(false)}
                >
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                    Instant 1-Click Role Switch
                  </p>
                  {(Object.keys(DEMO_USERS) as UserRole[]).map((role) => {
                    const info = DEMO_USERS[role];
                    return (
                      <button
                        key={role}
                        onClick={async () => {
                          await quickLogin(role);
                          onNavigate(getDashboardIdForRole(role));
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-emerald-50/70 transition flex items-start gap-2.5 group"
                      >
                        <div className="mt-0.5 p-1 rounded bg-gray-100 text-gray-700 group-hover:bg-[#066B4B] group-hover:text-white transition">
                          {role === 'super_admin' && <Shield className="w-3.5 h-3.5" />}
                          {role === 'donor' && <Utensils className="w-3.5 h-3.5" />}
                          {role === 'ngo' && <Building2 className="w-3.5 h-3.5" />}
                          {role === 'volunteer' && <Bike className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 group-hover:text-[#066B4B]">
                            {info.label}
                          </div>
                          <div className="text-[11px] text-gray-500 leading-tight">
                            {info.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#066B4B] bg-white transition shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-[#066B4B] text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.slice(0, 2)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[110px]">
                      {user.name}
                    </p>
                    {(() => {
                      const badge = getRoleBadge(user.role);
                      return (
                        <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-50 animate-scale-in"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => onNavigate(getDashboardIdForRole(user.role))}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#066B4B] rounded-lg transition flex items-center gap-2 mt-1"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Role Dashboard
                    </button>

                    {user.role === 'donor' && (
                      <button
                        onClick={() => onNavigate('donate-food')}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-[#066B4B] rounded-lg transition flex items-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4 text-[#066B4B]" />
                        List New Donation
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        onNavigate('home');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#066B4B] rounded-xl transition"
                >
                  Log In
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#066B4B] hover:bg-[#064E3B] rounded-xl shadow-xs transition transform hover:-translate-y-0.5"
                >
                  Join FoodMitra
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  currentPage === link.id
                    ? 'bg-emerald-50 text-[#066B4B]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Quick Test Role Switcher
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={async () => {
                    await quickLogin(r);
                    onNavigate(getDashboardIdForRole(r));
                    setMobileMenuOpen(false);
                  }}
                  className="text-left p-2 rounded-lg bg-gray-50 hover:bg-emerald-50 text-xs font-semibold text-gray-800 border border-gray-200"
                >
                  {DEMO_USERS[r].label.split(' ')[0]} {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onNavigate(getDashboardIdForRole(user.role));
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-[#066B4B] text-white text-center font-bold text-sm rounded-xl shadow-xs"
                >
                  Open {getRoleBadge(user.role).label} Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 border border-gray-200 text-gray-700 text-center font-semibold text-xs rounded-xl"
                >
                  Sign Out ({user.name})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold text-gray-700 bg-gray-100 rounded-xl"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onNavigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 text-center text-sm font-bold text-white bg-[#066B4B] rounded-xl shadow-xs"
                >
                  Join FoodMitra
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
