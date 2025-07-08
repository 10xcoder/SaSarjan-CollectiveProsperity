import { FreelancerProfile, VolunteerProfile, EntrepreneurProfile, CompanyProfile } from '../../types';

export const mockFreelancerProfile: FreelancerProfile = {
  id: 'freelancer-1',
  userId: 'user-123',
  type: 'freelancer',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  phone: '9876543210',
  bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies.',
  location: {
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400001'
  },
  category: 'tech',
  subCategories: ['web-development', 'cloud-architecture'],
  skills: [
    { name: 'React', level: 'expert', yearsOfExperience: 5, verified: true },
    { name: 'Node.js', level: 'expert', yearsOfExperience: 5, verified: true },
    { name: 'AWS', level: 'advanced', yearsOfExperience: 3, verified: false },
    { name: 'TypeScript', level: 'advanced', yearsOfExperience: 4, verified: true }
  ],
  experience: [
    {
      title: 'Senior Full Stack Developer',
      company: 'Tech Solutions Ltd',
      location: 'Mumbai',
      startDate: new Date('2020-01-01'),
      endDate: new Date('2023-12-31'),
      description: 'Led development of multiple web applications',
      technologies: ['React', 'Node.js', 'AWS', 'MongoDB']
    }
  ],
  portfolio: [
    {
      id: 'portfolio-1',
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce platform handling 10k+ daily users',
      url: 'https://example.com/project1',
      category: 'Web Application',
      tags: ['React', 'Node.js', 'MongoDB']
    }
  ],
  hourlyRate: {
    min: 2000,
    max: 4000,
    currency: 'INR'
  },
  availability: 'full-time',
  preferredProjectDuration: 'long-term',
  languages: ['Hindi', 'English', 'Marathi'],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: new Date('2022-06-15'),
      url: 'https://aws.amazon.com/certification/'
    }
  ],
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

export const mockVolunteerProfile: VolunteerProfile = {
  id: 'volunteer-1',
  userId: 'user-123',
  type: 'volunteer',
  name: 'Rajesh Kumar',
  email: 'rajesh.kumar@example.com',
  phone: '9876543211',
  bio: 'Passionate educator committed to improving literacy in rural areas.',
  location: {
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore',
    district: 'Bangalore Urban'
  },
  category: 'education',
  causes: ['Rural Education', 'Adult Literacy', 'Digital Education'],
  availability: {
    hoursPerWeek: 10,
    preferredDays: ['saturday', 'sunday'],
    preferredTime: 'morning'
  },
  skills: ['Teaching', 'Curriculum Development', 'Community Outreach'],
  experience: [
    {
      organization: 'Teach for India',
      role: 'Volunteer Teacher',
      duration: '2 years',
      impact: 'Taught 200+ students'
    }
  ],
  impactMetrics: [
    {
      metric: 'Students Taught',
      value: 200,
      unit: 'students',
      description: 'Directly taught and mentored students'
    },
    {
      metric: 'Literacy Improvement',
      value: 85,
      unit: 'percent',
      description: 'Students showing improvement in reading skills'
    }
  ],
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

export const mockEntrepreneurProfile: EntrepreneurProfile = {
  id: 'entrepreneur-1',
  userId: 'user-456',
  type: 'entrepreneur',
  name: 'Amit Patel',
  email: 'amit.patel@startup.com',
  phone: '9876543212',
  bio: 'Serial entrepreneur building solutions for sustainable agriculture.',
  location: {
    country: 'India',
    state: 'Gujarat',
    city: 'Ahmedabad'
  },
  businessName: 'AgriTech Solutions',
  businessCategory: 'Agriculture Technology',
  foundingYear: 2021,
  stage: 'growth',
  lookingFor: ['funding', 'mentorship', 'partners'],
  achievements: [
    {
      title: 'Best AgriTech Startup 2023',
      description: 'Awarded by Gujarat Startup Summit',
      date: new Date('2023-11-15')
    }
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/amitpatel',
    twitter: 'https://twitter.com/amitpatel',
    website: 'https://agritechsolutions.in'
  },
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

export const mockCompanyProfile: CompanyProfile = {
  id: 'company-1',
  userId: 'user-789',
  type: 'company',
  name: 'Tech Innovations Pvt Ltd',
  email: 'hr@techinnovations.com',
  phone: '9876543213',
  bio: 'Leading software development company focused on AI and ML solutions.',
  location: {
    country: 'India',
    state: 'Karnataka',
    city: 'Bangalore'
  },
  companyName: 'Tech Innovations Pvt Ltd',
  industry: 'Software Development',
  size: '51-200',
  founded: 2015,
  website: 'https://techinnovations.com',
  description: 'We build AI-powered solutions for enterprises',
  culture: ['Innovation', 'Work-Life Balance', 'Learning & Development'],
  benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work'],
  hiringFor: ['Machine Learning Engineer', 'Full Stack Developer', 'Product Manager'],
  techStack: ['Python', 'TensorFlow', 'React', 'AWS', 'Kubernetes'],
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15')
};

export const generateBulkProfiles = (count: number, type: 'freelancer' | 'volunteer' | 'entrepreneur' | 'company') => {
  const profiles = [];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad'];
  const states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Maharashtra', 'Telangana'];
  
  for (let i = 0; i < count; i++) {
    const cityIndex = i % cities.length;
    const baseProfile = {
      id: `${type}-${i + 1}`,
      userId: `user-${i + 1}`,
      type,
      name: `Test User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `98765${String(43210 + i).padStart(5, '0')}`,
      bio: `Professional ${type} with extensive experience in the field.`,
      location: {
        country: 'India',
        state: states[cityIndex],
        city: cities[cityIndex]
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    switch (type) {
      case 'freelancer':
        profiles.push({
          ...baseProfile,
          ...mockFreelancerProfile,
          id: baseProfile.id,
          userId: baseProfile.userId,
          name: baseProfile.name,
          email: baseProfile.email,
          phone: baseProfile.phone,
          location: baseProfile.location,
          category: ['tech', 'design', 'marketing'][i % 3] as any,
          hourlyRate: {
            min: 1000 + (i * 100),
            max: 2000 + (i * 200),
            currency: 'INR'
          }
        });
        break;
      case 'volunteer':
        profiles.push({
          ...baseProfile,
          ...mockVolunteerProfile,
          id: baseProfile.id,
          userId: baseProfile.userId,
          name: baseProfile.name,
          email: baseProfile.email,
          phone: baseProfile.phone,
          location: baseProfile.location,
          category: ['education', 'environment', 'health'][i % 3] as any
        });
        break;
      case 'entrepreneur':
        profiles.push({
          ...baseProfile,
          ...mockEntrepreneurProfile,
          id: baseProfile.id,
          userId: baseProfile.userId,
          name: baseProfile.name,
          email: baseProfile.email,
          phone: baseProfile.phone,
          location: baseProfile.location,
          stage: ['idea', 'mvp', 'growth'][i % 3] as any
        });
        break;
      case 'company':
        profiles.push({
          ...baseProfile,
          ...mockCompanyProfile,
          id: baseProfile.id,
          userId: baseProfile.userId,
          name: baseProfile.name,
          email: baseProfile.email,
          phone: baseProfile.phone,
          location: baseProfile.location,
          companyName: `Company ${i + 1}`,
          size: ['1-10', '11-50', '51-200'][i % 3] as any
        });
        break;
    }
  }
  
  return profiles;
};