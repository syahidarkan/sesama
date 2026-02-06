'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { User, Mail, Lock, Upload, Camera, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fadeIn">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Profile Sidebar */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-fadeIn ">
          <div className="text-center">
            <div className="relative inline-block group">
              <div className="w-24 h-24 rounded-full bg-primary-700 flex items-center justify-center text-3xl font-semibold text-white mx-auto transition-all group-">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all  hover:border-primary-500">
                <Camera className="w-4 h-4 text-gray-600 group-hover:text-primary-600" />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                {user?.role.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all hover:translate-x-1 ${
                activeTab === 'profile'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className={`w-4 h-4 mr-3 transition-transform  ${activeTab === 'profile' ? 'text-primary-600' : 'text-gray-400'}`} />
              Profile Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all hover:translate-x-1 ${
                activeTab === 'security'
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Lock className={`w-4 h-4 mr-3 transition-transform  ${activeTab === 'security' ? 'text-primary-600' : 'text-gray-400'}`} />
              Security
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 p-6 animate-fadeIn ">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-all hover-lift"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role.replace(/_/g, ' ')}
                    disabled
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                <p className="text-sm text-gray-600 mt-1">Update your password and security preferences</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-md focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
                >
                  Update Password
                </button>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Enable 2FA</div>
                    <div className="text-xs text-gray-500 mt-1">Add an extra layer of security</div>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Current Session</div>
                      <div className="text-xs text-gray-500 mt-1">Windows · Chrome · Jakarta</div>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Active now</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
