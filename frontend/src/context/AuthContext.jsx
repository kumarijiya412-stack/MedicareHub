import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [patientCard, setPatientCard] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeMember, setActiveMemberState] = useState(null); // null = myself
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Toast notification helper
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info')
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Switch active profile (Myself vs Family Member)
  const setActiveMember = (member) => {
    setActiveMemberState(member);
    if (member) {
      localStorage.setItem('medicare_active_member_id', member.id);
      toast.info(`Switched view to ${member.full_name} (${member.relation})`);
    } else {
      localStorage.removeItem('medicare_active_member_id');
      toast.info('Switched view to Personal Records (Myself)');
    }
  };

  // Fetch Cart count
  const refreshCart = async () => {
    try {
      const res = await api.get('/cart');
      if (res.success && res.summary) {
        setCartCount(res.summary.itemCount || 0);
      }
    } catch {
      // ignore if unauthenticated
    }
  };

  // Initial user fetch
  const refreshUser = async () => {
    try {
      const data = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
        setPatientCard(data.patientCard);
        setFamilyMembers(data.familyMembers || []);

        // Restore saved active member if applicable
        const savedMemberId = localStorage.getItem('medicare_active_member_id');
        if (savedMemberId && data.familyMembers) {
          const matched = data.familyMembers.find(m => m.id === parseInt(savedMemberId));
          if (matched) setActiveMemberState(matched);
        }

        refreshCart();
      }
    } catch {
      setUser(null);
      setPatientCard(null);
      setFamilyMembers([]);
      localStorage.removeItem('medicare_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('medicare_token', data.token);
    }
    await refreshUser();
    toast.success(`Welcome back, ${data.user?.full_name || 'Friend'}!`);
    return data;
  };

  const signup = async (formData) => {
    const data = await api.post('/auth/signup', formData);
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const data = await api.post('/auth/verify-otp', { email, otp });
    if (data.token) {
      localStorage.setItem('medicare_token', data.token);
    }
    await refreshUser();
    toast.success('Email verified successfully! Welcome to MediCare Hub.');
    return data;
  };

  const resendOtp = async (email) => {
    const data = await api.post('/auth/resend-otp', { email });
    toast.info('New verification code sent to your email.');
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // continue
    }
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_active_member_id');
    setUser(null);
    setPatientCard(null);
    setFamilyMembers([]);
    setActiveMemberState(null);
    setCartCount(0);
    toast.info('Signed out securely. Stay healthy!');
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  const value = {
    user,
    patientCard,
    familyMembers,
    activeMember,
    setActiveMember,
    loading,
    cartCount,
    refreshCart,
    toast,
    toasts,
    removeToast,
    login,
    signup,
    verifyOtp,
    resendOtp,
    logout,
    refreshUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
