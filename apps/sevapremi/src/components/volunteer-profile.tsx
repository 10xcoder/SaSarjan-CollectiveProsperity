'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Award,
  Plus,
  Trash2,
  Save,
  Camera
} from 'lucide-react'

interface VolunteerProfileProps {
  onClose: () => void
}

interface ProfileData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string
    location: string
    bio: string
    profilePicture?: string
  }
  preferences: {
    categories: string[]
    availability: string[]
    travelDistance: string
    skills: string[]
  }
  experience: {
    previousVolunteering: string
    achievements: string[]
    languages: string[]
  }
}

export function VolunteerProfile({ onClose }: VolunteerProfileProps) {
  const [activeTab, setActiveTab] = useState('personal')
  const [profileData, setProfileData] = useState<ProfileData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      location: '',
      bio: ''
    },
    preferences: {
      categories: [],
      availability: [],
      travelDistance: '10km',
      skills: []
    },
    experience: {
      previousVolunteering: '',
      achievements: [],
      languages: ['English']
    }
  })

  const [newSkill, setNewSkill] = useState('')
  const [newAchievement, setNewAchievement] = useState('')

  const categories = [
    'Education', 'Healthcare', 'Environment', 'Food Security', 
    'Elderly Care', 'Child Care', 'Disaster Relief', 'Animal Welfare'
  ]

  const availabilityOptions = [
    'Weekday Mornings', 'Weekday Evenings', 'Weekend Mornings', 
    'Weekend Evenings', 'Flexible Hours', 'Emergency Response'
  ]

  const handlePersonalInfoChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        categories: prev.preferences.categories.includes(category)
          ? prev.preferences.categories.filter(c => c !== category)
          : [...prev.preferences.categories, category]
      }
    }))
  }

  const handleAvailabilityToggle = (availability: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        availability: prev.preferences.availability.includes(availability)
          ? prev.preferences.availability.filter(a => a !== availability)
          : [...prev.preferences.availability, availability]
      }
    }))
  }

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfileData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          skills: [...prev.preferences.skills, newSkill.trim()]
        }
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        skills: prev.preferences.skills.filter(skill => skill !== skillToRemove)
      }
    }))
  }

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfileData(prev => ({
        ...prev,
        experience: {
          ...prev.experience,
          achievements: [...prev.experience.achievements, newAchievement.trim()]
        }
      }))
      setNewAchievement('')
    }
  }

  const removeAchievement = (achievementToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      experience: {
        ...prev.experience,
        achievements: prev.experience.achievements.filter(a => a !== achievementToRemove)
      }
    }))
  }

  const handleSave = () => {
    console.log('Saving profile data:', profileData)
    // Here you would typically save to a database
    onClose()
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Award },
    { id: 'experience', label: 'Experience', icon: Calendar }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">Volunteer Profile</CardTitle>
            <CardDescription>
              Create and manage your volunteer profile to get matched with relevant opportunities
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          <CardContent className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                    {profileData.personalInfo.profilePicture ? (
                      <img 
                        src={profileData.personalInfo.profilePicture} 
                        alt="Profile" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={profileData.personalInfo.fullName}
                      onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.personalInfo.email}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.personalInfo.phone}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profileData.personalInfo.dateOfBirth}
                      onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={profileData.personalInfo.location}
                      onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                      placeholder="City, State, Country"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileData.personalInfo.bio}
                      onChange={(e) => handlePersonalInfoChange('bio', e.target.value)}
                      placeholder="Tell us about yourself and why you want to volunteer..."
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">Volunteer Categories *</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select the areas you're interested in volunteering for
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={profileData.preferences.categories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category)}
                        className="justify-start"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Availability</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    When are you typically available to volunteer?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availabilityOptions.map((option) => (
                      <Button
                        key={option}
                        variant={profileData.preferences.availability.includes(option) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleAvailabilityToggle(option)}
                        className="justify-start"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="travelDistance" className="text-base font-semibold">
                    Travel Distance
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Maximum distance you're willing to travel for volunteer work
                  </p>
                  <select
                    id="travelDistance"
                    value={profileData.preferences.travelDistance}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, travelDistance: e.target.value }
                    }))}
                    className="w-full p-2 border border-input bg-background rounded-md"
                  >
                    <option value="5km">Within 5 km</option>
                    <option value="10km">Within 10 km</option>
                    <option value="25km">Within 25 km</option>
                    <option value="50km">Within 50 km</option>
                    <option value="100km">Within 100 km</option>
                    <option value="anywhere">Anywhere in city</option>
                  </select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Skills & Expertise</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add skills that could be useful in volunteer work
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.preferences.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <button onClick={() => removeSkill(skill)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="previousVolunteering" className="text-base font-semibold">
                    Previous Volunteering Experience
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Describe any previous volunteer work or community involvement
                  </p>
                  <Textarea
                    id="previousVolunteering"
                    value={profileData.experience.previousVolunteering}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      experience: { ...prev.experience, previousVolunteering: e.target.value }
                    }))}
                    placeholder="Describe your volunteer experience, organizations you've worked with, projects you've participated in..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold">Achievements & Certifications</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add any relevant achievements, certifications, or awards
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Add an achievement..."
                      onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                    />
                    <Button onClick={addAchievement} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {profileData.experience.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{achievement}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAchievement(achievement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Languages</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Languages you can communicate in during volunteer work
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['English', 'Hindi', 'Marathi', 'Tamil', 'Bengali', 'Gujarati', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi'].map((language) => (
                      <Button
                        key={language}
                        variant={profileData.experience.languages.includes(language) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setProfileData(prev => ({
                            ...prev,
                            experience: {
                              ...prev.experience,
                              languages: prev.experience.languages.includes(language)
                                ? prev.experience.languages.filter(l => l !== language)
                                : [...prev.experience.languages, language]
                            }
                          }))
                        }}
                      >
                        {language}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </div>

        <div className="border-t p-6 flex gap-4 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </Card>
    </div>
  )
}