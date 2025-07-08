'use client';

import { useState } from 'react';
// import { ProfileSelector, ProfileBuilder } from '@sasarjan/profile-core'; // TODO: Implement profile-core package
// import { useProfile } from '@sasarjan/profile-core';
const ProfileSelector = () => <div>Profile Selector placeholder</div>;
const ProfileBuilder = () => <div>Profile Builder placeholder</div>;
const useProfile = () => ({ profile: null, updateProfile: () => {} });

export default function ProfilePage() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [showImport, setShowImport] = useState(false);
  
  const {
    profiles,
    currentProfile,
    loading,
    createProfile,
    selectProfile,
    importProfile
  } = useProfile({
    userId: 'demo-user', // In real app, get from auth
    appId: '10x-growth',
    autoSync: true
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <p>Loading profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Your Profile</h1>
        <p className="text-gray-600">Create and manage your professional profiles</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Active Profile</h2>
          <ProfileSelector
            profiles={profiles}
            currentProfileId={currentProfile?.id}
            onSelect={selectProfile}
            onCreateNew={() => setShowBuilder(true)}
            onImport={() => setShowImport(true)}
          />
        </div>

        {currentProfile ? (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold">
                {currentProfile.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{currentProfile.name}</h3>
                <p className="text-gray-600">{currentProfile.email} • {currentProfile.phone}</p>
                <p className="text-sm text-gray-500 capitalize">{currentProfile.type} Profile</p>
                <p className="mt-2">{currentProfile.bio}</p>
              </div>
            </div>

            {currentProfile.type === 'freelancer' && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Professional Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span> {currentProfile.category}
                  </div>
                  <div>
                    <span className="font-medium">Availability:</span> {currentProfile.availability}
                  </div>
                  <div>
                    <span className="font-medium">Rate:</span> ₹{currentProfile.hourlyRate.min} - ₹{currentProfile.hourlyRate.max}/hr
                  </div>
                  <div>
                    <span className="font-medium">Skills:</span> {currentProfile.skills.length} skills
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Edit Profile
              </button>
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50">
                View Public Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No profile selected</p>
            <button
              onClick={() => setShowBuilder(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Profile
            </button>
          </div>
        )}
      </div>

      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProfileBuilder
              profileType="freelancer"
              onSave={async (profileData: any) => {
                await createProfile(profileData);
                setShowBuilder(false);
              }}
              onCancel={() => setShowBuilder(false)}
            />
          </div>
        </div>
      )}

      {showImport && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Import Profile from SaSarjan</h2>
          <p className="text-gray-600 mb-4">
            Select a profile from your SaSarjan account to import and customize for 10X Growth.
          </p>
          <div className="space-y-2">
            {mockSasarjanProfiles.map((profile) => (
              <div
                key={profile.id}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={async () => {
                  await importProfile(profile.id, 'freelancer');
                  setShowImport(false);
                }}
              >
                <h3 className="font-semibold">{profile.name}</h3>
                <p className="text-sm text-gray-600">{profile.type} • {profile.location}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowImport(false)}
            className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

const mockSasarjanProfiles = [
  {
    id: 'sasarjan-1',
    name: 'Priya Sharma',
    type: 'Professional',
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'sasarjan-2',
    name: 'Priya Sharma',
    type: 'Volunteer',
    location: 'Mumbai, Maharashtra'
  }
];