'use client';

import { useState, useEffect } from 'react';
// import { ProfileType, FreelancerProfile } from '@sasarjan/profile-core'; // TODO: Implement profile-core package
type FreelancerProfile = any;

export default function HomePage() {
  const [freelancers, setFreelancers] = useState<FreelancerProfile[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    minRate: 0,
    maxRate: 10000
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Top Freelancers</h1>
        <p className="text-gray-600">Connect with skilled professionals for your 10X growth journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Categories</option>
                  <option value="tech">Technology</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="content">Content</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  placeholder="City or State"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hourly Rate (INR)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRate}
                    onChange={(e) => setFilters({ ...filters, minRate: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRate}
                    onChange={(e) => setFilters({ ...filters, maxRate: Number(e.target.value) })}
                    className="w-1/2 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockFreelancers.map((freelancer) => (
              <div key={freelancer.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-semibold">
                    {freelancer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{freelancer.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{freelancer.category} Specialist</p>
                    <p className="text-sm text-gray-500">{freelancer.location.city}, {freelancer.location.state}</p>
                    <div className="mt-2">
                      <p className="text-sm font-medium">₹{freelancer.hourlyRate.min} - ₹{freelancer.hourlyRate.max}/hr</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {freelancer.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {skill.name}
                        </span>
                      ))}
                      {freelancer.skills.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{freelancer.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 line-clamp-2">{freelancer.bio}</p>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    View Profile
                  </button>
                  <button className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm">
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

const mockFreelancers: FreelancerProfile[] = [
  {
    id: '1',
    userId: 'user1',
    type: 'freelancer',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '9876543210',
    bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
    location: {
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai'
    },
    category: 'tech',
    subCategories: ['web-development', 'cloud-architecture'],
    skills: [
      { name: 'React', level: 'expert', yearsOfExperience: 5, verified: true },
      { name: 'Node.js', level: 'expert', yearsOfExperience: 5, verified: true },
      { name: 'AWS', level: 'advanced', yearsOfExperience: 3, verified: false }
    ],
    experience: [],
    portfolio: [],
    hourlyRate: { min: 2000, max: 4000, currency: 'INR' },
    availability: 'full-time',
    preferredProjectDuration: 'long-term',
    languages: ['Hindi', 'English'],
    certifications: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    userId: 'user2',
    type: 'freelancer',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543211',
    bio: 'UI/UX designer specializing in mobile app design and user research.',
    location: {
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore'
    },
    category: 'design',
    subCategories: ['ui-design', 'ux-research'],
    skills: [
      { name: 'Figma', level: 'expert', yearsOfExperience: 4, verified: true },
      { name: 'Adobe XD', level: 'advanced', yearsOfExperience: 3, verified: false },
      { name: 'User Research', level: 'advanced', yearsOfExperience: 3, verified: false }
    ],
    experience: [],
    portfolio: [],
    hourlyRate: { min: 1500, max: 3000, currency: 'INR' },
    availability: 'part-time',
    preferredProjectDuration: 'both',
    languages: ['Hindi', 'English', 'Kannada'],
    certifications: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];