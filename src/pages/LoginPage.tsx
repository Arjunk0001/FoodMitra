import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { UserRole } from '../types';
import {
  HeartHandshake,
  Shield,
  Utensils,
  Building2,
  Bike,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, register, quickLogin, isLoading } = useAuth();
  const { success, error, info } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'donor' as UserRole,
    organization_name: '',
    phone: '',
    address: '',
    city: 'Mumbai',
    verification_doc: '',
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const getDashboardId = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'admin-dashboard';
      case 'donor': return 'donor-dashboard';
      case 'ngo': return 'ngo-dashboard';
      case 'volunteer': return 'volunteer-dashboard';
      default: return 'home';
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      success('Welcome Back!', 'Logged in to FoodMitra successfully.');
      onNavigate('home');
    } catch (err: any) {
      error('Sign In Failed', err.message || 'Invalid email or password');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(regData);
      success('Account Created!', 'Your account has been registered with verified safety protocols.');
      onNavigate(getDashboardId(regData.role));
    } catch (err: any) {
      error('Registration Failed', err.message);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    try {
      await quickLogin(role);
      success('Quick Sign-In Successful', `Logged in as ${DEMO_USERS[role].label}`);
      onNavigate(getDashboardId(role));
    } catch (err: any) {
      error('Sign In Error', err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Brand Heading */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#066B4B] text-white flex items-center justify-center mx-auto shadow-md">
          <HeartHandshake className="w-8 h-8 text-[#B9E769]" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#064E3B]">
          Access the FoodMitra Platform
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Role-governed security for donors, registered NGO charities, volunteer squads, and trust administrators.
        </p>
      </div>

      {/* 1-Click Fast Role Switcher for instant demoing */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-6 rounded-3xl border border-emerald-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#066B4B]" />
            Instant 1-Click Role Testing (Server Verified)
          </div>
          <span className="text-[11px] text-emerald-700 font-medium hidden sm:inline">
            Click any role to test its specific dashboard instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
            const item = DEMO_USERS[r];
            return (
              <button
                key={r}
                type="button"
                onClick={() => handleQuickLogin(r)}
                className="bg-white p-3.5 rounded-2xl border border-emerald-100 hover:border-[#066B4B] shadow-2xs hover:shadow-md transition text-left space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-[#066B4B] group-hover:bg-[#066B4B] group-hover:text-white transition">
                    {r === 'super_admin' && <Shield className="w-4 h-4" />}
                    {r === 'donor' && <Utensils className="w-4 h-4" />}
                    {r === 'ngo' && <Building2 className="w-4 h-4" />}
                    {r === 'volunteer' && <Bike className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 group-hover:text-[#066B4B]">
                    Sign In →
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900 group-hover:text-[#066B4B]">
                  {item.label}
                </div>
                <div className="text-[11px] text-gray-500 leading-tight">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm max-w-xl mx-auto space-y-6">
        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition ${
              mode === 'login'
                ? 'border-[#066B4B] text-[#066B4B]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition ${
              mode === 'register'
                ? 'border-[#066B4B] text-[#066B4B]'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1. Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@foodmitra.org or your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs text-[#066B4B] hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#066B4B] focus:ring-1 focus:ring-[#066B4B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>
        )}

        {/* 2. Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'donor', label: 'Commercial Donor', icon: Utensils },
                  { role: 'ngo', label: 'Registered NGO', icon: Building2 },
                  { role: 'volunteer', label: 'Field Volunteer', icon: Bike },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setRegData({ ...regData, role: item.role as UserRole })}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        regData.role === item.role
                          ? 'border-[#066B4B] bg-emerald-50 text-[#066B4B] ring-1 ring-[#066B4B]'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Mehra"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="anand@organization.org"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
              />
            </div>

            {regData.role !== 'volunteer' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Organization / Banquet / NGO Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={regData.role === 'donor' ? 'e.g. Royal Palace Banquet & Catering' : 'e.g. Seva Bharat Hunger Trust'}
                  value={regData.organization_name}
                  onChange={(e) => setRegData({ ...regData, organization_name: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                <select
                  value={regData.city}
                  onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Kolkata">Kolkata</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98000 12345"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            </div>

            {regData.role !== 'volunteer' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  License / Trust Registration ID (Optional for immediate verification)
                </label>
                <input
                  type="text"
                  placeholder="e.g. FSSAI #1152001800012 or Trust Reg #MH/2019/042"
                  value={regData.verification_doc}
                  onChange={(e) => setRegData({ ...regData, verification_doc: e.target.value })}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-600 border border-gray-200">
              <span className="font-semibold text-gray-900">Safety Notice:</span> To maintain platform integrity, new donor and NGO profiles are reviewed by the Super Admin compliance desk.
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#066B4B] hover:bg-[#064E3B] text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-60"
            >
              {isLoading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>
        )}

        {/* 3. Password Reset Form */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Reset Your Password</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your account email and choose a new password.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Account Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="New secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:border-[#066B4B]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Back to Sign In
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!forgotEmail) {
                      error('Email required', 'Please provide your account email.');
                      return;
                    }
                    try {
                      await api.resetPassword(forgotEmail, newPassword || 'FoodMitra@2026');
                      success('Password Updated', 'Your password has been changed. You can now log in.');
                      setMode('login');
                    } catch (err: any) {
                      error('Reset Error', err.message);
                    }
                  }}
                  className="flex-1 py-2.5 bg-[#066B4B] text-white font-bold text-xs rounded-xl shadow-2xs"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
