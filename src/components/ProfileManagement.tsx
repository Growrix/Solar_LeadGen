'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/button';

// --- Icon Components with Semantic Colors ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
const LoaderIcon = () => <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

interface ApiProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  postcode: string | null;
  image: string | null;
  updatedAt: string;
}

interface ProfileManagementProps {
  onDeleteClick?: () => void;
}

export default function ProfileManagement({ onDeleteClick }: ProfileManagementProps) {
  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', postcode: '', image: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageAction, setImageAction] = useState<'set' | 'remove' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/homeowner/profile');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('You must be logged in to view your profile');
          }
          throw new Error(`Failed to load profile: ${response.statusText}`);
        }
        const data: ApiProfile = await response.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          postcode: data.postcode || '',
          image: data.image || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFieldErrors((prev) => ({ ...prev, image: 'Image must be smaller than 5MB' }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setFieldErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG, GIF, and WebP images are allowed' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setFormData((prev) => ({ ...prev, image: dataUrl }));
        setImageAction('set');
        setFieldErrors((prev) => {
          const updated = { ...prev };
          delete updated.image;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImageAction('remove');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setFieldErrors({});
      setSuccessMessage(null);
      const payload: { name: string; phone?: string; postcode?: string; image?: { action: 'set' | 'remove'; url?: string } } = { name: formData.name.trim() };
      if (formData.phone.trim()) { payload.phone = formData.phone.trim(); }
      if (formData.postcode.trim()) { payload.postcode = formData.postcode.trim(); }
      if (imageAction) { payload.image = { action: imageAction, ...(imageAction === 'set' && formData.image ? { url: formData.image } : {}) }; }
      const response = await fetch('/api/homeowner/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 && data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          return;
        }
        throw new Error(data.error || 'Failed to save profile');
      }
      setProfile(data);
      setFormData({ name: data.name || '', phone: data.phone || '', postcode: data.postcode || '', image: data.image || '' });
      setImageAction(null);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({ name: profile.name || '', phone: profile.phone || '', postcode: profile.postcode || '', image: profile.image || '' });
    }
    setFieldErrors({});
    setError(null);
    setImageAction(null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="theme-card p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 bg-muted rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangleIcon />
          <h3 className="text-error">Error Loading Profile</h3>
        </div>
        <p className="text-error/80 mt-2">{error}</p>
        {/* Migrated: button → shadcn Button - preserved onClick, error handling */}
  <Button onClick={() => window.location.reload()} variant="minimal" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!profile) return null;

  const displayImage = formData.image || 'https://picsum.photos/seed/default-avatar/200';
  const displayEmail = profile.email;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-success/10 border border-success/30 rounded-lg p-4">
          <p className="text-success">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangleIcon />
            <p className="text-error">{error}</p>
          </div>
        </div>
      )}

      {/* Profile Picture Section */}
      <div className="theme-card p-6">
        <h2 className="text-heading-3 text-foreground mb-4">Profile Picture</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Image 
              src={displayImage} 
              alt="Profile" 
              width={96} 
              height={96} 
              className="w-24 h-24 rounded-full object-cover border-4 border-border" 
            />
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center">
                <span className="text-foreground-secondary text-caption">Edit</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-heading-4 text-foreground">{formData.name || 'No name set'}</h3>
            <p className="text-body-small text-muted-foreground">{displayEmail}</p>
            {isEditing && (
              <div className="mt-3 flex space-x-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/jpeg,image/png,image/gif,image/webp" 
                  className="hidden" 
                />
                {/* Migrated: buttons → shadcn Button - preserved onClick, disabled, upload/remove logic */}
                <Button
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={isSaving} 
                  variant="secondary"
                >
                  Upload New
                </Button>
                {formData.image && (
                  <Button
                    onClick={handleRemoveImage} 
                    disabled={isSaving} 
                    variant="destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
            )}
            {fieldErrors.image && (
              <p className="text-error text-body-small mt-2">{fieldErrors.image}</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information Section */}
      <div className="theme-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-heading-3 text-foreground">Personal Information</h2>
          {/* Migrated: button → shadcn Button - preserved onClick, edit mode toggle */}
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)} 
              variant="secondary"
            >
              Edit Profile
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-body-small text-foreground mb-2">
              Full Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <UserIcon />
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                disabled={!isEditing || isSaving} 
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground ${
                  !isEditing || isSaving 
                    ? 'bg-muted cursor-not-allowed' 
                    : 'bg-surface'
                } ${
                  fieldErrors.name 
                    ? 'border-error' 
                    : 'border-border'
                } text-foreground`} 
                placeholder="John Doe" 
              />
            </div>
            {fieldErrors.name && (
              <p className="text-error text-body-small mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-body-small text-foreground mb-2">Email Address</label>
            <div className="relative">
              <MailIcon />
              <input 
                type="email" 
                value={displayEmail} 
                disabled 
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed text-foreground placeholder:text-muted-foreground" 
                placeholder="john@example.com" 
              />
            </div>
            <p className="text-caption text-muted-foreground mt-1">Email cannot be changed</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-body-small text-foreground mb-2">Phone Number</label>
            <div className="relative">
              <PhoneIcon />
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                disabled={!isEditing || isSaving} 
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground ${
                  !isEditing || isSaving 
                    ? 'bg-muted cursor-not-allowed' 
                    : 'bg-surface'
                } ${
                  fieldErrors.phone 
                    ? 'border-error' 
                    : 'border-border'
                } text-foreground`} 
                placeholder="+1 234 567 8900" 
              />
            </div>
            {fieldErrors.phone && (
              <p className="text-error text-body-small mt-1">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Postcode */}
          <div>
            <label className="block text-body-small text-foreground mb-2">Postcode</label>
            <div className="relative">
              <MapPinIcon />
              <input 
                type="text" 
                name="postcode" 
                value={formData.postcode} 
                onChange={handleInputChange} 
                disabled={!isEditing || isSaving} 
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground ${
                  !isEditing || isSaving 
                    ? 'bg-muted cursor-not-allowed' 
                    : 'bg-surface'
                } ${
                  fieldErrors.postcode 
                    ? 'border-error' 
                    : 'border-border'
                } text-foreground`} 
                placeholder="SW1A 1AA" 
              />
            </div>
            {fieldErrors.postcode && (
              <p className="text-error text-body-small mt-1">{fieldErrors.postcode}</p>
            )}
          </div>

          {/* Action Buttons - Migrated: buttons → shadcn Button - preserved onClick, saving state, disabled logic */}
          {isEditing && (
            <div className="flex space-x-3 pt-4">
              <Button
                onClick={handleSave} 
                disabled={isSaving} 
                className="bg-success hover:bg-success/90"
              >
                {isSaving ? (
                  <>
                    <LoaderIcon />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                onClick={handleCancel} 
                disabled={isSaving} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="theme-card p-6">
        <h2 className="text-heading-3 text-foreground mb-4">Security</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-body-small text-foreground mb-2">Current Password</label>
            <div className="relative">
              <LockIcon />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed text-foreground placeholder:text-muted-foreground" 
                placeholder="" 
                disabled 
              />
            </div>
          </div>
          <div>
            <label className="block text-body-small text-foreground mb-2">New Password</label>
            <div className="relative">
              <LockIcon />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed text-foreground placeholder:text-muted-foreground" 
                placeholder="" 
                disabled 
              />
            </div>
          </div>
          <div>
            <label className="block text-body-small text-foreground mb-2">Confirm New Password</label>
            <div className="relative">
              <LockIcon />
              <input 
                type="password" 
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed text-foreground placeholder:text-muted-foreground" 
                placeholder="" 
                disabled 
              />
            </div>
          </div>
          {/* Migrated: button → shadcn Button - preserved disabled state */}
          <Button
            disabled 
            variant="secondary"
            className="w-full"
          >
            Change Password (Coming Soon)
          </Button>
        </div>
      </div>

      {/* Danger Zone */}
      {onDeleteClick && (
        <div className="bg-error/10 border border-error/30 p-6 rounded-lg">
          <h2 className="text-heading-3 text-error mb-2">Danger Zone</h2>
          <p className="text-body-small text-error/80 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {/* Migrated: button → shadcn Button - preserved onClick, delete action */}
          <Button
            onClick={onDeleteClick} 
            variant="destructive"
          >
            <AlertTriangleIcon />
            Delete Account
          </Button>
        </div>
      )}
    </div>
  );
}
