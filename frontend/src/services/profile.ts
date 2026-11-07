import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  username: string;
  institution: string;
  program: string;
  avatarColor: 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'blue';
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Student Scholar',
  username: 'scholar',
  institution: 'Department of Computer Science',
  program: 'Master of Computer Applications',
  avatarColor: 'cyan'
};

const STORAGE_KEY = 'dsverse_user_profile';
const PROFILE_EVENT = 'dsverse_profile_updated';

export const getStoredProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      name: (parsed.name && parsed.name.trim()) ? parsed.name.trim() : DEFAULT_PROFILE.name,
      username: (parsed.username && parsed.username.trim()) ? parsed.username.trim().toLowerCase().replace(/\s+/g, '_') : DEFAULT_PROFILE.username,
      institution: (parsed.institution && parsed.institution.trim()) ? parsed.institution.trim() : DEFAULT_PROFILE.institution,
      program: (parsed.program && parsed.program.trim()) ? parsed.program.trim() : DEFAULT_PROFILE.program,
      avatarColor: parsed.avatarColor || 'cyan',
    };
  } catch (err) {
    console.warn('Failed to parse stored user profile:', err);
    return DEFAULT_PROFILE;
  }
};

export const saveStoredProfile = (profile: Partial<UserProfile>): UserProfile => {
  try {
    const current = getStoredProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      name: profile.name?.trim() || current.name || DEFAULT_PROFILE.name,
      username: profile.username?.trim().toLowerCase().replace(/\s+/g, '_') || current.username || DEFAULT_PROFILE.username,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: updated }));
    return updated;
  } catch (err) {
    console.error('Failed to save profile to localStorage:', err);
    return DEFAULT_PROFILE;
  }
};

export const resetStoredProfile = (): UserProfile => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(PROFILE_EVENT, { detail: DEFAULT_PROFILE }));
  } catch {
    // ignore
  }
  return DEFAULT_PROFILE;
};

export const getCurrentUsername = (): string => {
  return getStoredProfile().username;
};

// React hook for synchronized profile state across components
export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e?.detail) {
        setProfile(e.detail);
      } else {
        setProfile(getStoredProfile());
      }
    };

    window.addEventListener(PROFILE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PROFILE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    profile,
    updateProfile: saveStoredProfile,
    resetProfile: resetStoredProfile,
  };
};
