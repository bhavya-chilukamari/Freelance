import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth.service';
import { User, Lock, Building, CheckCircle2, AlertCircle } from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    professionalTitle: user?.professionalTitle || '',
    businessName: user?.businessName || '',
    hourlyRate: user?.hourlyRate || 0,
    currency: user?.currency || 'USD',
    phone: user?.phone || '',
    address: user?.address || '',
    taxId: user?.taxId || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileStatus, setProfileStatus] = useState({ loading: false, success: '', error: '' });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, success: '', error: '' });

  const handleProfileChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileStatus({ loading: true, success: '', error: '' });

    try {
      const res = await authService.updateProfile(profileData);
      if (res.success && res.data.user) {
        updateUser(res.data.user);
        setProfileStatus({ loading: false, success: 'Profile updated successfully!', error: '' });
      }
    } catch (err) {
      setProfileStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || 'Failed to update profile.',
      });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, success: '', error: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ loading: false, success: '', error: 'New passwords do not match.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({
        loading: false,
        success: '',
        error: 'New password must be at least 6 characters.',
      });
      return;
    }

    try {
      const res = await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.success) {
        setPasswordStatus({ loading: false, success: 'Password changed successfully!', error: '' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordStatus({
        loading: false,
        success: '',
        error: err.response?.data?.message || 'Failed to update password.',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Account & Business Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Configure your freelance identity, default currency, billing info, and security credentials.
        </p>
      </div>

      {/* Profile & Business Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Freelancer Profile & Branding</h3>
            <p className="text-xs text-slate-500">
              These details appear on your generated invoices and client proposals.
            </p>
          </div>
        </div>

        {profileStatus.success && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileStatus.success}</span>
          </div>
        )}

        {profileStatus.error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileStatus.error}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Professional Title
              </label>
              <input
                type="text"
                name="professionalTitle"
                value={profileData.professionalTitle}
                onChange={handleProfileChange}
                placeholder="Senior Full Stack Engineer"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Business / Studio Name
              </label>
              <input
                type="text"
                name="businessName"
                value={profileData.businessName}
                onChange={handleProfileChange}
                placeholder="Acme Digital"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Currency
              </label>
              <select
                name="currency"
                value={profileData.currency}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Standard Hourly Rate
              </label>
              <input
                type="number"
                name="hourlyRate"
                min="0"
                step="0.01"
                value={profileData.hourlyRate}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tax ID / GSTIN / VAT
              </label>
              <input
                type="text"
                name="taxId"
                value={profileData.taxId}
                onChange={handleProfileChange}
                placeholder="TAX-12345678"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Billing Address
            </label>
            <textarea
              name="address"
              rows="2"
              value={profileData.address}
              onChange={handleProfileChange}
              placeholder="123 Freelancer Blvd, Suite 100, San Francisco, CA"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileStatus.loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
            >
              {profileStatus.loading ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-slate-100">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Security & Credentials</h3>
            <p className="text-xs text-slate-500">
              Ensure your account is protected with a secure password.
            </p>
          </div>
        </div>

        {passwordStatus.success && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordStatus.success}</span>
          </div>
        )}

        {passwordStatus.error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordStatus.error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              required
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              New Password (min. 6 characters)
            </label>
            <input
              type="password"
              name="newPassword"
              required
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={passwordStatus.loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition shadow-sm disabled:opacity-50"
            >
              {passwordStatus.loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;

