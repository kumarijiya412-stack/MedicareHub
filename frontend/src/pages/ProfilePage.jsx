import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  User,
  Users,
  ShieldCheck,
  Lock,
  Download,
  Trash2,
  Edit2,
  Plus,
  Phone,
  Droplet,
  Heart,
  Save,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ProfilePage() {
  const { user, familyMembers, activeMember, setActiveMember, refreshUser, updateUser, logout, toast } = useAuth();

  // Personal Info Form
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.date_of_birth || '');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || 'O+');
  const [height, setHeight] = useState(user?.height || '');
  const [weight, setWeight] = useState(user?.weight || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_photo || '');
  const [infoLoading, setInfoLoading] = useState(false);

  // Change Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Family Member Modal
  const [familyModalOpen, setFamilyModalOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState(null);
  const [fName, setFName] = useState('');
  const [fRelation, setFRelation] = useState('spouse');
  const [fDob, setFDob] = useState('');
  const [fGender, setFGender] = useState('Female');
  const [fBlood, setFBlood] = useState('O+');
  const [fNotes, setFNotes] = useState('');
  const [familyLoading, setFamilyLoading] = useState(false);

  // Delete Account Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setDob(user.date_of_birth || '');
      setBloodGroup(user.blood_group || 'O+');
      setHeight(user.height || '');
      setWeight(user.weight || '');
      setEmergencyContact(user.emergency_contact || '');
      setProfilePhoto(user.profile_photo || '');
    }
  }, [user]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setInfoLoading(true);
    try {
      const res = await api.put('/profile', {
        full_name: fullName,
        phone,
        date_of_birth: dob,
        blood_group: bloodGroup,
        height,
        weight,
        emergency_contact: emergencyContact,
        profile_photo: profilePhoto
      });

      updateUser(res.user);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setInfoLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.post('/profile/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      toast.success(res.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Password update failed');
    } finally {
      setPassLoading(false);
    }
  };

  const handleOpenAddFamily = () => {
    setEditingFamilyId(null);
    setFName('');
    setFRelation('child');
    setFDob('');
    setFGender('Male');
    setFBlood('O+');
    setFNotes('');
    setFamilyModalOpen(true);
  };

  const handleOpenEditFamily = (m) => {
    setEditingFamilyId(m.id);
    setFName(m.full_name);
    setFRelation(m.relation);
    setFDob(m.date_of_birth || '');
    setFGender(m.gender || 'Male');
    setFBlood(m.blood_group || 'O+');
    setFNotes(m.notes || '');
    setFamilyModalOpen(true);
  };

  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    if (!fName) {
      toast.error('Name is required.');
      return;
    }

    setFamilyLoading(true);
    try {
      const payload = {
        full_name: fName,
        relation: fRelation,
        date_of_birth: fDob,
        gender: fGender,
        blood_group: fBlood,
        notes: fNotes
      };

      if (editingFamilyId) {
        await api.put(`/profile/family/${editingFamilyId}`, payload);
        toast.success('Family member updated.');
      } else {
        await api.post('/profile/family', payload);
        toast.success(`${fName} added to family!`);
      }

      await refreshUser();
      setFamilyModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Error saving family member');
    } finally {
      setFamilyLoading(false);
    }
  };

  const handleDeleteFamily = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your family profiles?`)) return;
    try {
      await api.delete(`/profile/family/${id}`);
      toast.info('Family member removed.');
      if (activeMember?.id === id) {
        setActiveMember(null);
      }
      refreshUser();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleExportData = () => {
    window.open('http://localhost:5000/api/profile/export', '_blank');
    toast.success('Health data export initiated.');
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePass) return;

    setDeleteLoading(true);
    try {
      await api.delete('/profile/account', { password: deletePass });
      toast.info('Account deleted. Goodbye!');
      logout();
    } catch (err) {
      toast.error(err.message || 'Incorrect password');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Account, Family & Security Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal medical profile, emergency contacts, linked family members, and data privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Personal Info & Password */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. PERSONAL INFORMATION FORM */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>Personal & Medical Vitals</span>
            </h2>

            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="175"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="68"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Contact (Name, Relation & Phone Number)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+1 (555) 912-3847 (Dr. Marcus - Spouse)"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={profilePhoto}
                  onChange={(e) => setProfilePhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={infoLoading}
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{infoLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 2. CHANGE PASSWORD CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>Change Security Password</span>
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="8+ chars, upper, lower, symbol"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="px-4 py-2 rounded-lg bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-medium text-xs shadow-xs transition-colors"
                >
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Family Profiles & Privacy */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3. FAMILY MEMBER PROFILES (Child, Parent, Spouse, Other) */}
          <div id="family" className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Family Members ({familyMembers.length})</span>
              </h2>

              <button
                onClick={handleOpenAddFamily}
                className="px-2.5 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/80 text-primary-700 dark:text-primary-300 font-medium text-xs flex items-center space-x-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage clinical records and doctor consultations for family members under your primary account.
            </p>

            <div className="space-y-2.5">
              {familyMembers.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-lg border transition-colors flex items-center justify-between ${
                    activeMember?.id === m.id
                      ? 'bg-primary-50/50 dark:bg-primary-950/30 border-primary-200 dark:border-primary-800'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-xs text-primary-700 dark:text-primary-300 shadow-2xs">
                      {m.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{m.full_name}</p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                        {m.relation} • {m.gender || 'Unknown'} • Blood: {m.blood_group || 'O+'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setActiveMember(m)}
                      className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {activeMember?.id === m.id ? 'Active' : 'Switch'}
                    </button>
                    <button
                      onClick={() => handleOpenEditFamily(m)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteFamily(m.id, m.full_name)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. PRIVACY, EXPORT & ACCOUNT REMOVAL */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Data Rights & Privacy Settings</span>
            </h2>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Export All Health Data</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Download medical history, reports, and visits in JSON format</p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              <div className="p-3.5 rounded-lg bg-warmrose-50/60 dark:bg-warmrose-950/30 border border-warmrose-200/70 dark:border-warmrose-900/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-warmrose-900 dark:text-warmrose-200">Delete Account & Data</p>
                  <p className="text-[11px] text-warmrose-700 dark:text-warmrose-300">Permanently erase profile and associated records</p>
                </div>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-warmrose-600 hover:bg-warmrose-700 text-white font-medium text-xs shadow-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Family Member Modal */}
      <Modal
        isOpen={familyModalOpen}
        onClose={() => setFamilyModalOpen(false)}
        title={editingFamilyId ? 'Edit Family Member Profile' : 'Add Family Member Profile'}
      >
        <form onSubmit={handleFamilySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fName}
              onChange={(e) => setFName(e.target.value)}
              placeholder="e.g. Emma Morgan"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Relationship *
              </label>
              <select
                value={fRelation}
                onChange={(e) => setFRelation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="spouse">Spouse / Partner</option>
                <option value="child">Child / Dependent</option>
                <option value="parent">Parent / In-law</option>
                <option value="sibling">Brother / Sister</option>
                <option value="other">Other Relative</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={fGender}
                onChange={(e) => setFGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={fDob}
                onChange={(e) => setFDob(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Blood Group
              </label>
              <select
                value={fBlood}
                onChange={(e) => setFBlood(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Medical Notes / Pediatric Reminders
            </label>
            <textarea
              rows={2}
              value={fNotes}
              onChange={(e) => setFNotes(e.target.value)}
              placeholder="e.g. Mild pollen allergy, regular vaccination scheduled..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={familyLoading}
              className="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm shadow-xs disabled:opacity-60 transition-colors"
            >
              {familyLoading ? 'Saving...' : editingFamilyId ? 'Update Family Profile' : 'Add to Family Registry'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Account"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div className="p-3.5 rounded-lg bg-warmrose-50 dark:bg-warmrose-950/40 border border-warmrose-200 dark:border-warmrose-900/60 text-xs text-warmrose-900 dark:text-warmrose-200 leading-relaxed">
            <p className="font-semibold mb-1 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-warmrose-600 dark:text-warmrose-400 shrink-0" />
              <span>Irreversible Action:</span>
            </p>
            Deleting your account will immediately purge all personal medical history, uploaded lab reports, family profiles, and appointments from our encrypted database.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Enter Password to Confirm Deletion
            </label>
            <input
              type="password"
              required
              value={deletePass}
              onChange={(e) => setDeletePass(e.target.value)}
              placeholder="Your current password"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:border-warmrose-500 focus:ring-1 focus:ring-warmrose-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={deleteLoading}
              className="w-full py-2.5 rounded-lg bg-warmrose-600 hover:bg-warmrose-700 text-white font-medium text-sm shadow-xs disabled:opacity-60 transition-colors"
            >
              {deleteLoading ? 'Erasing Records...' : 'Permanently Delete Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
