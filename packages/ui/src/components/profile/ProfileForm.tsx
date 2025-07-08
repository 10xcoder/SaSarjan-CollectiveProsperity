import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  Upload, 
  X, 
  Plus, 
  MapPin, 
  Briefcase, 
  Star,
  Globe,
  Phone,
  Mail,
  Calendar,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  UserBrandProfile, 
  ProfileType, 
  ProfileSchema, 
  ProfileVisibility 
} from '@sasarjan/shared/types/brand';

interface ProfileFormProps {
  profile?: UserBrandProfile;
  profileType: ProfileType;
  schema: ProfileSchema;
  brandId: string;
  onSave: (profileData: any) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

interface FormData {
  name: string;
  email: string;
  title: string;
  bio: string;
  location: string;
  phone?: string;
  website?: string;
  skills: string[];
  experience: string;
  education: any[];
  portfolio: any[];
  services: any[];
  interests: string[];
  availability: {
    status: 'available' | 'busy' | 'unavailable';
    hours: string;
    timezone: string;
  };
  pricing: {
    hourlyRate?: number;
    currency: string;
    negotiable: boolean;
  };
  languages: string[];
  certifications: any[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    behance?: string;
    dribbble?: string;
  };
  preferences: {
    remote: boolean;
    travel: boolean;
    partTime: boolean;
    fullTime: boolean;
  };
  visibility: ProfileVisibility;
}

export function ProfileForm({
  profile,
  profileType,
  schema,
  brandId,
  onSave,
  onCancel,
  isLoading = false,
  mode = profile ? 'edit' : 'create'
}: ProfileFormProps) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile?.profileData.avatar || null
  );
  const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<FormData>({
    defaultValues: {
      name: profile?.profileData.name || '',
      email: profile?.profileData.email || '',
      title: profile?.profileData.title || '',
      bio: profile?.profileData.bio || '',
      location: profile?.profileData.location || '',
      phone: profile?.profileData.phone || '',
      website: profile?.profileData.website || '',
      skills: profile?.profileData.skills || [],
      experience: profile?.profileData.experience || '',
      education: profile?.profileData.education || [],
      portfolio: profile?.profileData.portfolio || [],
      services: profile?.profileData.services || [],
      interests: profile?.profileData.interests || [],
      availability: {
        status: profile?.profileData.availability?.status || 'available',
        hours: profile?.profileData.availability?.hours || '',
        timezone: profile?.profileData.availability?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      pricing: {
        hourlyRate: profile?.profileData.pricing?.hourlyRate,
        currency: profile?.profileData.pricing?.currency || 'USD',
        negotiable: profile?.profileData.pricing?.negotiable || false
      },
      languages: profile?.profileData.languages || [],
      certifications: profile?.profileData.certifications || [],
      socialLinks: {
        linkedin: profile?.profileData.socialLinks?.linkedin || '',
        github: profile?.profileData.socialLinks?.github || '',
        twitter: profile?.profileData.socialLinks?.twitter || '',
        behance: profile?.profileData.socialLinks?.behance || '',
        dribbble: profile?.profileData.socialLinks?.dribbble || ''
      },
      preferences: {
        remote: profile?.profileData.preferences?.remote || false,
        travel: profile?.profileData.preferences?.travel || false,
        partTime: profile?.profileData.preferences?.partTime || false,
        fullTime: profile?.profileData.preferences?.fullTime || true
      },
      visibility: profile?.visibility || 'public'
    }
  });

  const watchedSkills = watch('skills');
  const watchedInterests = watch('interests');
  const watchedVisibility = watch('visibility');

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (skillInput && !watchedSkills.includes(skillInput)) {
      setValue('skills', [...watchedSkills, skillInput], { shouldDirty: true });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setValue('skills', watchedSkills.filter(s => s !== skill), { shouldDirty: true });
  };

  const addInterest = () => {
    if (interestInput && !watchedInterests.includes(interestInput)) {
      setValue('interests', [...watchedInterests, interestInput], { shouldDirty: true });
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setValue('interests', watchedInterests.filter(i => i !== interest), { shouldDirty: true });
  };

  const addEducation = () => {
    const education = watch('education');
    setValue('education', [...education, {
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      current: false
    }], { shouldDirty: true });
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const education = watch('education');
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setValue('education', updated, { shouldDirty: true });
  };

  const removeEducation = (index: number) => {
    const education = watch('education');
    setValue('education', education.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const addCertification = () => {
    const certifications = watch('certifications');
    setValue('certifications', [...certifications, {
      name: '',
      issuer: '',
      date: '',
      url: ''
    }], { shouldDirty: true });
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const certifications = watch('certifications');
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setValue('certifications', updated, { shouldDirty: true });
  };

  const removeCertification = (index: number) => {
    const certifications = watch('certifications');
    setValue('certifications', certifications.filter((_, i) => i !== index), { shouldDirty: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      const profileData = {
        ...data,
        avatar: avatarPreview
      };

      await onSave(profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const isRequired = (field: string) => schema.required.includes(field);
  const getFieldLabel = (field: string) => schema.display.labels[field] || field;
  const getFieldPlaceholder = (field: string) => schema.display.placeholders[field] || '';
  const getFieldHelp = (field: string) => schema.display.help[field] || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'create' ? 'Create' : 'Edit'} {profileType.charAt(0).toUpperCase() + profileType.slice(1)} Profile
            <Badge variant="outline">{brandId}</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarPreview || ''} />
              <AvatarFallback className="text-lg">
                {watch('name')?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </div>
              </Label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 400x400px, max 2MB
              </p>
            </div>
          </div>

          {/* Visibility Settings */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {watchedVisibility === 'public' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Profile Visibility
            </Label>
            <Controller
              name="visibility"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible to everyone</SelectItem>
                    <SelectItem value="verified_only">Verified Only - Only verified users can see</SelectItem>
                    <SelectItem value="private">Private - Only you can see</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {getFieldLabel('name')} {isRequired('name') && <span className="text-red-500">*</span>}
              </Label>
              <Controller
                name="name"
                control={control}
                rules={{ required: isRequired('name') }}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={getFieldPlaceholder('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                )}
              />
              {getFieldHelp('name') && (
                <p className="text-xs text-muted-foreground">{getFieldHelp('name')}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                {getFieldLabel('email')} {isRequired('email') && <span className="text-red-500">*</span>}
              </Label>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: isRequired('email'),
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                }}
                render={({ field }) => (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="email"
                      placeholder={getFieldPlaceholder('email')}
                      className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                )}
              />
            </div>

            {/* Title/Position */}
            <div className="space-y-2">
              <Label htmlFor="title">
                {getFieldLabel('title')} {isRequired('title') && <span className="text-red-500">*</span>}
              </Label>
              <Controller
                name="title"
                control={control}
                rules={{ required: isRequired('title') }}
                render={({ field }) => (
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder={getFieldPlaceholder('title')}
                      className={`pl-10 ${errors.title ? 'border-red-500' : ''}`}
                    />
                  </div>
                )}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                {getFieldLabel('location')} {isRequired('location') && <span className="text-red-500">*</span>}
              </Label>
              <Controller
                name="location"
                control={control}
                rules={{ required: isRequired('location') }}
                render={({ field }) => (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      placeholder={getFieldPlaceholder('location')}
                      className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                    />
                  </div>
                )}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                    />
                  </div>
                )}
              />
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">
              {getFieldLabel('bio')} {isRequired('bio') && <span className="text-red-500">*</span>}
            </Label>
            <Controller
              name="bio"
              control={control}
              rules={{ required: isRequired('bio') }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={getFieldPlaceholder('bio')}
                  className={`min-h-[100px] ${errors.bio ? 'border-red-500' : ''}`}
                  maxLength={500}
                />
              )}
            />
            <p className="text-xs text-muted-foreground">
              {watch('bio')?.length || 0}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Expertise</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addSkill} disabled={!skillInput}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {watchedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="experience">
              {getFieldLabel('experience')} {isRequired('experience') && <span className="text-red-500">*</span>}
            </Label>
            <Controller
              name="experience"
              control={control}
              rules={{ required: isRequired('experience') }}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="Describe your professional experience..."
                  className={`min-h-[120px] ${errors.experience ? 'border-red-500' : ''}`}
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Provider-specific fields */}
      {profileType === 'provider' && (
        <>
          {/* Services & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Services & Pricing</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Availability */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Availability Status</Label>
                  <Controller
                    name="availability.status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="unavailable">Unavailable</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Controller
                    name="availability.hours"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="9 AM - 5 PM EST"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Controller
                    name="availability.timezone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="America/New_York"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Hourly Rate</Label>
                  <Controller
                    name="pricing.hourlyRate"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="number"
                          placeholder="50"
                          className="pl-10"
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Controller
                    name="pricing.currency"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Controller
                    name="pricing.negotiable"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2 h-10">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label>Negotiable</Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Seeker-specific fields */}
      {profileType === 'seeker' && (
        <Card>
          <CardHeader>
            <CardTitle>Interests & Preferences</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Interests */}
            <div className="space-y-2">
              <Label>Interests</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest..."
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addInterest} disabled={!interestInput}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {watchedInterests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedInterests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {interest}
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Work Preferences */}
            <div className="space-y-3">
              <Label>Work Preferences</Label>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="preferences.remote"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      <Label>Remote work</Label>
                    </div>
                  )}
                />
                
                <Controller
                  name="preferences.travel"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      <Label>Willing to travel</Label>
                    </div>
                  )}
                />
                
                <Controller
                  name="preferences.partTime"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      <Label>Part-time</Label>
                    </div>
                  )}
                />
                
                <Controller
                  name="preferences.fullTime"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      <Label>Full-time</Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          disabled={isLoading || !isDirty}
          className="min-w-[120px]"
        >
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Profile' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}