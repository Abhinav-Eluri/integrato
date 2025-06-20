import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUI } from '@/hooks/useUI';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UserCircleIcon, CameraIcon, ChartBarIcon, BellIcon, CogIcon } from '@heroicons/react/24/outline';
import { ProfileFormData, ChangePasswordFormData } from '@/types';

const ProfilePage: React.FC = () => {
  const { user, updateProfile, updatePassword, loading, error } = useAuth();
  const { showSuccess, showError } = useUI();

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    bio: '',
    location: '',
    birth_date: '',
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordFormData>({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });

  // Form errors
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileFormData>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<ChangePasswordFormData>>({});

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'password'>('overview');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        birth_date: user.birth_date || '',
      });

      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // Handle profile form errors
  useEffect(() => {
    if (error) {
      showError('Update Failed', error);
    }
  }, [error, showError]);

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile form change
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (profileErrors[name as keyof ProfileFormData]) {
      setProfileErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (passwordErrors[name as keyof ChangePasswordFormData]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate profile form
  const validateProfileForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!profileForm.first_name) {
      newErrors.first_name = 'First name is required';
    }

    if (!profileForm.last_name) {
      newErrors.last_name = 'Last name is required';
    }

    if (!profileForm.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!profileForm.username) {
      newErrors.username = 'Username is required';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const newErrors: Partial<ChangePasswordFormData> = {};

    if (!passwordForm.old_password) {
      newErrors.old_password = 'Current password is required';
    }

    if (!passwordForm.new_password1) {
      newErrors.new_password1 = 'New password is required';
    } else if (passwordForm.new_password1.length < 8) {
      newErrors.new_password1 = 'Password must be at least 8 characters';
    }

    if (!passwordForm.new_password2) {
      newErrors.new_password2 = 'Please confirm your new password';
    } else if (passwordForm.new_password1 !== passwordForm.new_password2) {
      newErrors.new_password2 = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle profile form submit
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }

    try {
      // Create form data for multipart/form-data request
      const formData = new FormData();
      
      // Add profile fields
      Object.entries(profileForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      
      // Add avatar if changed
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const result = await updateProfile(formData);
      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess('Profile Updated', 'Your profile has been updated successfully.');
      }
    } catch (err) {
      // Error is handled by the auth slice and useEffect above
    }
  };

  // Handle password form submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      const result = await updatePassword(passwordForm);
      if (result.meta.requestStatus === 'fulfilled') {
        showSuccess('Password Updated', 'Your password has been changed successfully.');
        // Reset password form
        setPasswordForm({
          old_password: '',
          new_password1: '',
          new_password2: '',
        });
      }
    } catch (err) {
      // Error is handled by the auth slice and useEffect above
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Profile & Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account overview, profile information and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Account Overview
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'password'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Change Password
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'overview' ? (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user?.first_name || user?.username}!
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Here's what's happening with your account today.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Profile Completion',
                    value: '85%',
                    icon: UserCircleIcon,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
                  },
                  {
                    name: 'Account Status',
                    value: 'Active',
                    icon: ChartBarIcon,
                    color: 'text-green-600',
                    bgColor: 'bg-green-100 dark:bg-green-900/20',
                  },
                  {
                    name: 'Settings',
                    value: 'Updated',
                    icon: CogIcon,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
                  },
                  {
                    name: 'Notifications',
                    value: '3 New',
                    icon: BellIcon,
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-100 dark:bg-orange-900/20',
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.name}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.name}
                          </p>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Account Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Account Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Profile Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Name:</span>
                          <span className="text-gray-900 dark:text-white">
                            {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Not set'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Email:</span>
                          <span className="text-gray-900 dark:text-white">
                            {user?.email}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Username:</span>
                          <span className="text-gray-900 dark:text-white">
                            {user?.username}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Account Status
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status:</span>
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            Active
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Member since:</span>
                          <span className="text-gray-900 dark:text-white">
                            {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Last login:</span>
                          <span className="text-gray-900 dark:text-white">
                            {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => setActiveTab('profile')}
                        variant="default" 
                        className="w-full sm:w-auto"
                      >
                        Edit Profile
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('password')}
                        variant="outline" 
                        className="w-full sm:w-auto"
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          Account created successfully
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Welcome to the platform!
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Just now
                      </span>
                    </div>
                    
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No more recent activity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit}>
              {/* Avatar */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon className="w-24 h-24 text-gray-400" />
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <CameraIcon className="w-4 h-4" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Click the camera icon to upload a new profile picture
                </p>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First name"
                    name="first_name"
                    type="text"
                    value={profileForm.first_name}
                    onChange={handleProfileChange}
                    error={profileErrors.first_name}
                    required
                  />

                  <Input
                    label="Last name"
                    name="last_name"
                    type="text"
                    value={profileForm.last_name}
                    onChange={handleProfileChange}
                    error={profileErrors.last_name}
                    required
                  />
                </div>

                <Input
                  label="Email address"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  error={profileErrors.email}
                  required
                />

                <Input
                  label="Username"
                  name="username"
                  type="text"
                  value={profileForm.username}
                  onChange={handleProfileChange}
                  error={profileErrors.username}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Location"
                    name="location"
                    type="text"
                    value={profileForm.location}
                    onChange={handleProfileChange}
                    error={profileErrors.location}
                  />

                  <Input
                    label="Birth date"
                    name="birth_date"
                    type="date"
                    value={profileForm.birth_date}
                    onChange={handleProfileChange}
                    error={profileErrors.birth_date}
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit}>
              {/* Password Form */}
              <div className="space-y-6">
                <Input
                  label="Current password"
                  name="old_password"
                  type="password"
                  value={passwordForm.old_password}
                  onChange={handlePasswordChange}
                  error={passwordErrors.old_password}
                  required
                />

                <Input
                  label="New password"
                  name="new_password1"
                  type="password"
                  value={passwordForm.new_password1}
                  onChange={handlePasswordChange}
                  error={passwordErrors.new_password1}
                  helperText="Must be at least 8 characters"
                  required
                />

                <Input
                  label="Confirm new password"
                  name="new_password2"
                  type="password"
                  value={passwordForm.new_password2}
                  onChange={handlePasswordChange}
                  error={passwordErrors.new_password2}
                  required
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={loading}
                    disabled={loading}
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;