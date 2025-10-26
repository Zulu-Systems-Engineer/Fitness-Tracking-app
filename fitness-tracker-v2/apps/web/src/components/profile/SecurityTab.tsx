import React, { useState } from 'react';
import { UserProfile } from '../../types/UserProfile';

interface SecurityTabProps {
  profile: UserProfile;
  onChange: (field: string, value: any) => void;
}

export function SecurityTab({ profile, onChange }: SecurityTabProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    return errors;
  };

  const handlePasswordChange = async () => {
    const errors: string[] = [];
    
    // Validate current password (in real app, verify with server)
    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }
    
    // Validate new password
    const newPasswordErrors = validatePassword(passwordData.newPassword);
    errors.push(...newPasswordErrors);
    
    // Validate password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New passwords do not match');
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password');
    }
    
    setPasswordErrors(errors);
    
    if (errors.length > 0) {
      return;
    }
    
    setIsChangingPassword(true);
    try {
      // TODO: Implement actual password change API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Password changed successfully');
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors([]);
      
      // Show success message (in real app, use toast notification)
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors(['Failed to change password. Please try again.']);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Security Settings</h2>
      
      {/* Password Change Section */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Change Password</h3>
        
        {passwordErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg text-sm">
            <ul className="list-disc list-inside space-y-1">
              {passwordErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter your current password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter your new password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Confirm your new password"
            />
          </div>
          
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-medium text-blue-200 mb-2">Password Requirements:</h4>
            <ul className="text-sm text-blue-200 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Contains uppercase and lowercase letters</li>
              <li>• Contains at least one number</li>
              <li>• Contains at least one special character (@$!%*?&)</li>
            </ul>
          </div>
          
          <button
            onClick={handlePasswordChange}
            disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="w-full bg-btn-primary-bg text-btn-primary-text py-2 px-4 rounded-lg hover:bg-btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>
      </div>
      
      {/* Account Security Section */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Account Security</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card-bg rounded-lg border border-card-border">
            <div>
              <h4 className="font-medium text-text-primary">Two-Factor Authentication</h4>
              <p className="text-sm text-text-muted">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-btn-secondary-bg text-btn-secondary-text rounded-lg hover:bg-btn-secondary-hover transition-colors">
              Enable
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card-bg rounded-lg border border-card-border">
            <div>
              <h4 className="font-medium text-text-primary">Login Sessions</h4>
              <p className="text-sm text-text-muted">Manage your active login sessions</p>
            </div>
            <button className="px-4 py-2 bg-btn-secondary-bg text-btn-secondary-text rounded-lg hover:bg-btn-secondary-hover transition-colors">
              View Sessions
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card-bg rounded-lg border border-card-border">
            <div>
              <h4 className="font-medium text-text-primary">Account Deletion</h4>
              <p className="text-sm text-text-muted">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
