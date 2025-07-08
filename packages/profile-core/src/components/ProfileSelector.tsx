import React, { useState, useEffect } from 'react';
import { ProfileType } from '../types/profile-types';

interface ProfileSelectorProps {
  profiles: ProfileType[];
  currentProfileId?: string;
  onSelect: (profile: ProfileType) => void;
  onCreateNew: () => void;
  onImport?: () => void;
  showImportOption?: boolean;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  currentProfileId,
  onSelect,
  onCreateNew,
  onImport,
  showImportOption = true
}) => {
  const [selectedId, setSelectedId] = useState(currentProfileId);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentProfile = profiles.find(p => p.id === selectedId);

  const handleSelect = (profile: ProfileType) => {
    setSelectedId(profile.id);
    onSelect(profile);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
      >
        {currentProfile ? (
          <>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {currentProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <div className="font-medium">{currentProfile.name}</div>
              <div className="text-xs text-gray-500 capitalize">{currentProfile.type}</div>
            </div>
          </>
        ) : (
          <span>Select Profile</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 w-72 bg-white border rounded-md shadow-lg z-50">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-2 py-1">YOUR PROFILES</div>
            
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile)}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-50 ${
                  profile.id === selectedId ? 'bg-blue-50' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{profile.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{profile.type}</div>
                  {profile.type === 'freelancer' && profile.category && (
                    <div className="text-xs text-gray-400 capitalize">{profile.category}</div>
                  )}
                </div>
                {profile.id === selectedId && (
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}

            <div className="border-t mt-2 pt-2">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onCreateNew();
                }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50"
              >
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium">Create New Profile</span>
              </button>

              {showImportOption && onImport && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onImport();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="font-medium">Import from SaSarjan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};