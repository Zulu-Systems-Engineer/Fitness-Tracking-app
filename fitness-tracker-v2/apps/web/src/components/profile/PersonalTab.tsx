import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types/UserProfile';

interface PersonalTabProps {
  profile: UserProfile;
  onChange: (field: string, value: any) => void;
}

export function PersonalTab({ profile, onChange }: PersonalTabProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(profile.profilePicture || null);
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      onChange('profilePicture', result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadError('Error reading file. Please try again.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onChange('profilePicture', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Personal Information</h2>
      
      {/* Profile Picture Section */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Picture</h3>
        
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Current Profile Picture */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32">
              {isUploading ? (
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center border-4 border-card-border">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                </div>
              ) : imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-card-border shadow-lg"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center border-4 border-card-border">
                  <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {imagePreview && !isUploading && (
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Upload Area */}
          <div className="flex-1">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-card-border hover:border-accent-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-accent-primary">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                
                <div>
                  <p className="text-text-primary font-medium">
                    {dragActive ? 'Drop your image here' : 'Upload a profile picture'}
                  </p>
                  <p className="text-text-muted text-sm mt-1">
                    Drag and drop an image, or click to browse
                  </p>
                  <p className="text-text-muted text-xs mt-2">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-btn-primary-bg text-btn-primary-text px-4 py-2 rounded-lg hover:bg-btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            {uploadError && (
              <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-lg text-sm">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="bg-card-bg border border-card-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={profile.dateOfBirth || ''}
              onChange={(e) => onChange('dateOfBirth', e.target.value)}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Gender
            </label>
            <select
              value={profile.gender || ''}
              onChange={(e) => onChange('gender', e.target.value)}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Height (cm)
            </label>
            <input
              type="number"
              value={profile.height || ''}
              onChange={(e) => onChange('height', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter your height"
              min="100"
              max="250"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Weight (kg)
            </label>
            <input
              type="number"
              value={profile.weight || ''}
              onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Enter your weight"
              min="30"
              max="300"
              step="0.1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio || ''}
              onChange={(e) => onChange('bio', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-input-bg border border-input-border text-input-text rounded-md focus:outline-none focus:ring-2 focus:ring-border-focus"
              placeholder="Tell us about yourself..."
              maxLength={500}
            />
            <p className="text-xs text-text-muted mt-1">
              {(profile.bio || '').length}/500 characters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
