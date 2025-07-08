import React, { useState } from 'react';
import { ProfileType, FreelancerProfile, VolunteerProfile, EntrepreneurProfile } from '../types/profile-types';
import { BaseProfile } from '../types/base-profile';

interface ProfileBuilderProps {
  profileType: 'freelancer' | 'volunteer' | 'entrepreneur' | 'company';
  initialData?: Partial<ProfileType>;
  onSave: (profile: Omit<ProfileType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({
  profileType,
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<any>({
    type: profileType,
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    bio: initialData?.bio || '',
    location: initialData?.location || {
      country: 'India',
      state: '',
      city: ''
    },
    ...getTypeSpecificDefaults(profileType, initialData)
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await onSave(formData);
    } catch (error: any) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold">
        Create {profileType.charAt(0).toUpperCase() + profileType.slice(1)} Profile
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            pattern="[6-9][0-9]{9}"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              type="text"
              value={formData.location.state}
              onChange={(e) => updateNestedField('location', 'state', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={formData.location.city}
              onChange={(e) => updateNestedField('location', 'city', e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
        </div>

        {profileType === 'freelancer' && (
          <FreelancerFields
            formData={formData}
            updateField={updateField}
            updateNestedField={updateNestedField}
          />
        )}

        {profileType === 'volunteer' && (
          <VolunteerFields
            formData={formData}
            updateField={updateField}
            updateNestedField={updateNestedField}
          />
        )}

        {profileType === 'entrepreneur' && (
          <EntrepreneurFields
            formData={formData}
            updateField={updateField}
            updateNestedField={updateNestedField}
          />
        )}
      </div>

      {errors.submit && (
        <div className="text-red-600 text-sm">{errors.submit}</div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const FreelancerFields: React.FC<any> = ({ formData, updateField }) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        value={formData.category}
        onChange={(e) => updateField('category', e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
        required
      >
        <option value="">Select category</option>
        <option value="tech">Technology</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
        <option value="content">Content</option>
        <option value="consulting">Consulting</option>
        <option value="other">Other</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Availability</label>
      <select
        value={formData.availability}
        onChange={(e) => updateField('availability', e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
        required
      >
        <option value="full-time">Full-time</option>
        <option value="part-time">Part-time</option>
        <option value="project-based">Project-based</option>
      </select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Min Hourly Rate (INR)</label>
        <input
          type="number"
          value={formData.hourlyRate.min}
          onChange={(e) => updateField('hourlyRate', { ...formData.hourlyRate, min: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded-md"
          min="0"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Max Hourly Rate (INR)</label>
        <input
          type="number"
          value={formData.hourlyRate.max}
          onChange={(e) => updateField('hourlyRate', { ...formData.hourlyRate, max: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded-md"
          min="0"
          required
        />
      </div>
    </div>
  </>
);

const VolunteerFields: React.FC<any> = ({ formData, updateField }) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        value={formData.category}
        onChange={(e) => updateField('category', e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
        required
      >
        <option value="">Select category</option>
        <option value="education">Education</option>
        <option value="environment">Environment</option>
        <option value="health">Health</option>
        <option value="community">Community</option>
        <option value="animal-welfare">Animal Welfare</option>
        <option value="disaster-relief">Disaster Relief</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Hours per Week</label>
      <input
        type="number"
        value={formData.availability.hoursPerWeek}
        onChange={(e) => updateField('availability', { ...formData.availability, hoursPerWeek: Number(e.target.value) })}
        className="w-full px-3 py-2 border rounded-md"
        min="0"
        max="40"
        required
      />
    </div>
  </>
);

const EntrepreneurFields: React.FC<any> = ({ formData, updateField }) => (
  <>
    <div>
      <label className="block text-sm font-medium mb-1">Business Name</label>
      <input
        type="text"
        value={formData.businessName}
        onChange={(e) => updateField('businessName', e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
      />
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Business Stage</label>
      <select
        value={formData.stage}
        onChange={(e) => updateField('stage', e.target.value)}
        className="w-full px-3 py-2 border rounded-md"
        required
      >
        <option value="idea">Idea</option>
        <option value="mvp">MVP</option>
        <option value="growth">Growth</option>
        <option value="scale">Scale</option>
        <option value="established">Established</option>
      </select>
    </div>
  </>
);

function getTypeSpecificDefaults(profileType: string, initialData?: any): any {
  switch (profileType) {
    case 'freelancer':
      return {
        category: initialData?.category || '',
        skills: initialData?.skills || [],
        experience: initialData?.experience || [],
        portfolio: initialData?.portfolio || [],
        hourlyRate: initialData?.hourlyRate || { min: 0, max: 0, currency: 'INR' },
        availability: initialData?.availability || 'full-time',
        preferredProjectDuration: initialData?.preferredProjectDuration || 'both',
        languages: initialData?.languages || ['Hindi', 'English'],
        certifications: initialData?.certifications || []
      };
    case 'volunteer':
      return {
        category: initialData?.category || '',
        causes: initialData?.causes || [],
        availability: initialData?.availability || {
          hoursPerWeek: 10,
          preferredDays: [],
          preferredTime: 'flexible'
        },
        skills: initialData?.skills || [],
        experience: initialData?.experience || [],
        impactMetrics: initialData?.impactMetrics || []
      };
    case 'entrepreneur':
      return {
        businessName: initialData?.businessName || '',
        businessCategory: initialData?.businessCategory || '',
        foundingYear: initialData?.foundingYear || new Date().getFullYear(),
        stage: initialData?.stage || 'idea',
        lookingFor: initialData?.lookingFor || [],
        achievements: initialData?.achievements || [],
        socialLinks: initialData?.socialLinks || {}
      };
    default:
      return {};
  }
}