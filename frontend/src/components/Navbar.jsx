import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
  Heart,
  Users,
  ShoppingCart,
  User,
  LogOut,
  Calendar,
  FileText,
  Stethoscope,
  Pill,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Plus
} from 'lucide-react';

export default function Navbar() {
  const { user, activeMember, setActiveMember, familyMembers, cartCount, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-xs">
              <Heart className="w-4 h-4 fill-warmrose-400 text-warmrose-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                MediCare<span className="text-primary-600 dark:text-primary-400">Hub</span>
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 dark:text-slate-500">
                Health Companion
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Logged In) */}
          {user ? (
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/find-doctors"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/find-doctors')
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Find Doctors</span>
              </Link>
              <Link
                to="/medicine-store"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/medicine-store')
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Pharmacy</span>
              </Link>
              <Link
                to="/appointments"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/appointments')
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Appointments</span>
              </Link>
              <Link
                to="/medical-reports"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/medical-reports')
                    ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                <span>Reports</span>
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How It Works</a>
              <a href="#trust" className="hover:text-slate-900 dark:hover:text-white transition-colors">Security</a>
              <Link to="/medicine-store" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center space-x-1">
                <Pill className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Pharmacy</span>
              </Link>
            </nav>
          )}

          {/* Right Action Icons & Theme Toggle */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle (Light / Dark / System) */}
            <ThemeToggle className="mr-1" />

            {user ? (
              <>
                {/* Family Profile Switcher Button & Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setFamilyDropdownOpen(!familyDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                    title="Switch active health profile"
                  >
                    <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="max-w-[100px] truncate font-medium">
                      {activeMember ? activeMember.full_name : 'Myself'}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {familyDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in duration-100">
                      <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Patient</p>
                      </div>

                      {/* Myself */}
                      <button
                        onClick={() => {
                          setActiveMember(null);
                          setFamilyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          !activeMember ? 'bg-primary-50/70 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 font-semibold' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
                            {user.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="leading-tight">{user.full_name}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">Account Owner</span>
                          </div>
                        </div>
                        {!activeMember && <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>}
                      </button>

                      {/* Family members */}
                      {familyMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => {
                            setActiveMember(member);
                            setFamilyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                            activeMember?.id === member.id ? 'bg-primary-50/70 dark:bg-primary-950/60 text-primary-800 dark:text-primary-300 font-semibold' : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
                              {member.full_name?.charAt(0)}
                            </div>
                            <div>
                              <p className="leading-tight">{member.full_name}</p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{member.relation}</span>
                            </div>
                          </div>
                          {activeMember?.id === member.id && <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>}
                        </button>
                      ))}

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <Link
                          to="/profile#family"
                          onClick={() => setFamilyDropdownOpen(false)}
                          className="w-full text-left px-3.5 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-950/40 flex items-center space-x-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add family member</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart Icon */}
                <Link
                  to="/medicine-store"
                  className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="View Medicine Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-primary-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* User Avatar Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setFamilyDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {user.profile_photo ? (
                      <img src={user.profile_photo} alt={user.full_name} className="w-7 h-7 rounded-md object-cover border border-slate-200 dark:border-slate-700" />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in duration-100">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/patient-id"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Digital Patient ID</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/legal-privacy"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Privacy & Compliance</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center space-x-2 px-3.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors shadow-xs"
                >
                  Create account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Dashboard</Link>
              <Link to="/find-doctors" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Find Doctors</Link>
              <Link to="/medicine-store" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Medicine Store</Link>
              <Link to="/appointments" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Doctor Check-ups</Link>
              <Link to="/medical-reports" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Medical Reports</Link>
              <Link to="/patient-id" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Digital Patient ID</Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Profile & Family</Link>
              <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30">Sign out</button>
            </>
          ) : (
            <>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200">How It Works</a>
              <a href="#trust" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-200">Security</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-primary-600 dark:text-primary-400">Sign in</Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-white bg-primary-600 rounded-lg text-center">Create account</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
