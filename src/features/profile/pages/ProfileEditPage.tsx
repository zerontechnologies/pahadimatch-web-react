import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Users, 
  Save, 
  X,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetOwnProfileQuery, useUpdateProfileMutation } from '@/store/api/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import type { ProfileCreateRequest } from '@/types';

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const EDUCATION_OPTIONS = [
  { value: 'high_school', label: 'High School' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelors', label: 'Bachelors' },
  { value: 'masters', label: 'Masters' },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional' },
];

const OCCUPATION_OPTIONS = [
  { value: 'government', label: 'Government' },
  { value: 'private', label: 'Private' },
  { value: 'business', label: 'Business' },
  { value: 'self_employed', label: 'Self Employed' },
  { value: 'army', label: 'Army/Defense' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'lawyer', label: 'Lawyer' },
  { value: 'other', label: 'Other' },
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'never_married', label: 'Never Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'awaiting_divorce', label: 'Awaiting Divorce' },
];

const RELIGION_OPTIONS = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'christian', label: 'Christian' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'jain', label: 'Jain' },
  { value: 'other', label: 'Other' },
];

const FAMILY_TYPES = [
  { value: 'joint', label: 'Joint Family' },
  { value: 'nuclear', label: 'Nuclear Family' },
];

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'eggetarian', label: 'Eggetarian' },
  { value: 'vegan', label: 'Vegan' },
];

const BODY_TYPES = [
  { value: 'slim', label: 'Slim' },
  { value: 'average', label: 'Average' },
  { value: 'athletic', label: 'Athletic' },
  { value: 'heavy', label: 'Heavy' },
];

const FEMALE_BODY_TYPES = [
  ...BODY_TYPES,
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'pear', label: 'Pear (Triangle)' },
  { value: 'apple', label: 'Apple (Round)' },
  { value: 'rectangle', label: 'Rectangle (H)' },
  { value: 'inverted_triangle', label: 'Inverted Triangle (V)' },
];

const COMPLEXION_OPTIONS = [
  { value: 'very_fair', label: 'Very Fair' },
  { value: 'fair', label: 'Fair' },
  { value: 'wheatish', label: 'Wheatish' },
  { value: 'dark', label: 'Dark' },
];

const HABIT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'occasionally', label: 'Occasionally' },
];

const COMMUNITY_OPTIONS = [
  { value: 'garhwali', label: 'Garhwali' },
  { value: 'kumaoni', label: 'Kumaoni' },
  { value: 'jonsari', label: 'Jonsari' },
  { value: 'other', label: 'Other' },
];

const CASTE_OPTIONS = [
  { value: 'brahmin', label: 'Brahmin' },
  { value: 'rajput', label: 'Rajput' },
  { value: 'others', label: 'Others' },
];

const ACCOUNT_CREATED_BY_OPTIONS = [
  { value: 'self', label: 'Self' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
];

const PARENT_STATUS_OPTIONS = [
  { value: 'alive', label: 'Alive' },
  { value: 'deceased', label: 'Deceased' },
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'working', label: 'Working' },
  { value: 'retired', label: 'Retired' },
  { value: 'not_working', label: 'Not Working' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
];

export function ProfileEditPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: profile, isLoading: profileLoading } = useGetOwnProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [formData, setFormData] = useState<ProfileCreateRequest>({
    country: 'India',
    hobbies: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newHobby, setNewHobby] = useState('');

  // Load profile data into form
  useEffect(() => {
    if (profile?.data) {
      // Handle different API response structures
      let rawData: any = profile.data;
      
      // Check if data is nested (e.g., { profile: {...} })
      if (rawData && typeof rawData === 'object' && 'profile' in rawData) {
        rawData = rawData.profile;
      }
      
      // If still not valid, try direct access
      if (!rawData || typeof rawData !== 'object') {
        return;
      }
      
      const profileData: ProfileCreateRequest = { ...rawData };
      
      // Convert dateOfBirth from ISO string to YYYY-MM-DD format for date input
      if (profileData.dateOfBirth) {
        try {
          const date = new Date(profileData.dateOfBirth);
          if (!isNaN(date.getTime())) {
            // Format as YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            profileData.dateOfBirth = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error('Error parsing dateOfBirth:', e);
        }
      }
      
      // Ensure all string fields are properly set (handle null/undefined)
      const stringFields: Array<keyof ProfileCreateRequest> = [
        'firstName', 'lastName', 'city', 'state', 'country', 
        'educationDetail', 'college', 'occupationDetail', 'company',
        'caste', 'motherTongue', 'fatherOccupation', 
        'motherOccupation', 'gothra', 'subCaste', 'aboutMe'
      ] as Array<keyof ProfileCreateRequest>;
      
      // Handle fatherName and motherName separately since they're optional string fields
      if (profileData.fatherName !== null && profileData.fatherName !== undefined) {
        profileData.fatherName = String(profileData.fatherName).trim();
      }
      if (profileData.motherName !== null && profileData.motherName !== undefined) {
        profileData.motherName = String(profileData.motherName).trim();
      }
      
      stringFields.forEach(field => {
        if (profileData[field] === null || profileData[field] === undefined) {
          profileData[field] = '' as any;
        }
      });

      // Normalize numeric fields that may come as strings
      const numericFields: Array<keyof ProfileCreateRequest> = ['height', 'weight', 'income', 'siblings'];
      numericFields.forEach((field) => {
        const value = profileData[field] as any;
        if (value !== null && value !== undefined && value !== '') {
          const parsed = Number(value);
          profileData[field] = isNaN(parsed) ? undefined as any : parsed as any;
        }
      });
      
      // Normalize enums to lowercase for select components
      // This ensures values like "Male", "MALE", "male" all become "male"
      const normalizeEnum = (val: any): string => {
        if (val === null || val === undefined || val === '') return '';
        if (typeof val === 'string') {
          const normalized = val.toLowerCase().trim();
          return normalized;
        }
        return String(val).toLowerCase().trim();
      };
      
      // Normalize all enum fields to lowercase strings
      const enumFields: Array<keyof ProfileCreateRequest> = [
        'gender', 'religion', 'community', 'origin', 'caste', 
        'accountCreatedBy', 'maritalStatus', 'occupation', 'education',
        'diet', 'smoking', 'drinking', 'familyType', 'bodyType', 'complexion'
      ];
      
      enumFields.forEach(field => {
        const value = profileData[field];
        if (value !== null && value !== undefined && value !== '') {
          profileData[field] = normalizeEnum(value) as any;
        } else {
          // Set to empty string to keep Select controlled
          profileData[field] = '' as any;
        }
      });
      
      // Special handling for community/origin backward compatibility
      if (!profileData.community && profileData.origin) {
        profileData.community = normalizeEnum(profileData.origin) as any;
      }
      
      // Ensure country defaults to India if not set
      if (!profileData.country || profileData.country === '') {
        profileData.country = 'India';
      }
      
      // Ensure hobbies is an array
      if (!Array.isArray(profileData.hobbies)) {
        profileData.hobbies = profileData.hobbies ? [profileData.hobbies].filter(Boolean).flat() : [];
      }
      
      // Final debug log
      console.log('Final mapped profile data:', {
        gender: profileData.gender,
        genderType: typeof profileData.gender,
        religion: profileData.religion,
        community: profileData.community,
        origin: profileData.origin,
        caste: profileData.caste,
        dateOfBirth: profileData.dateOfBirth,
        accountCreatedBy: profileData.accountCreatedBy,
        maritalStatus: profileData.maritalStatus,
        education: profileData.education,
        occupation: profileData.occupation,
      });
      
      setFormData(profileData);
    }
  }, [profile]);

  // Debug: Log when formData.gender changes
  useEffect(() => {
    console.log('formData.gender changed:', formData.gender, 'Type:', typeof formData.gender);
  }, [formData.gender]);

  const updateField = (field: keyof ProfileCreateRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 && age <= 100 ? age : null;
  };

  const getMinAge = (): number => {
    // Boys: min 21, Girls: min 18
    return formData.gender === 'male' ? 21 : 18;
  };

  const getMaxDate = (): string => {
    const minAge = getMinAge();
    return new Date(new Date().setFullYear(new Date().getFullYear() - minAge)).toISOString().split('T')[0];
  };

  const validateAge = (dateOfBirth: string): boolean => {
    if (!dateOfBirth) return false;
    const age = calculateAge(dateOfBirth);
    if (age === null) return false;
    const minAge = getMinAge();
    return age >= minAge && age <= 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth)) {
      const minAge = getMinAge();
      const genderText = formData.gender === 'male' ? 'boys' : 'girls';
      newErrors.dateOfBirth = `Minimum age for ${genderText} is ${minAge} years`;
    }
    if (!formData.height || formData.height < 140 || formData.height > 999) {
      newErrors.height = 'Height must be between 140 and 999 cm';
    }
    if (!formData.community) {
      newErrors.community = 'Community is required';
    }
    if (!formData.caste) {
      newErrors.caste = 'Caste is required';
    }
    if (!formData.accountCreatedBy) {
      newErrors.accountCreatedBy = 'Account Created By is required';
    }
    if (!formData.education) newErrors.education = 'Education is required';
    if (!formData.occupation) newErrors.occupation = 'Occupation is required';
    if (!formData.income || formData.income <= 0) {
      newErrors.income = 'Income must be greater than 0';
    }
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.aboutMe?.trim() || formData.aboutMe.trim().length === 0) {
      newErrors.aboutMe = 'About Me is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      dispatch(addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
      }));
      return;
    }

    try {
      const result = await updateProfile(formData).unwrap();
      
      if (result.success) {
        dispatch(addToast({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully',
        }));
        navigate('/profile');
      }
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to update profile. Please try again.',
      }));
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-semibold text-text flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            Edit Profile
          </h1>
          <p className="text-text-secondary mt-1">
            Update your profile information
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
          leftIcon={<X className="w-4 h-4" />}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="career" className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Career
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Family & Lifestyle
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.firstName || ''}
                    onChange={(e) => updateField('firstName', e.target.value.trim())}
                    error={errors.firstName}
                    required
                  />
                  <Input
                    label="Last Name"
                    value={formData.lastName || ''}
                    onChange={(e) => updateField('lastName', e.target.value.trim())}
                    error={errors.lastName}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Gender <span className="text-error">*</span>
                    </label>
                    <Select
                      value={formData.gender || ''}
                      onValueChange={(val) => updateField('gender', val)}
                      key={`gender-${formData.gender || 'empty'}`}
                    >
                      <SelectTrigger className={errors.gender ? 'border-error' : ''}>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.gender && (
                      <p className="text-xs text-error mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <DatePicker
                      label="Date of Birth *"
                      value={formData.dateOfBirth || ''}
                      onChange={(val) => updateField('dateOfBirth', val)}
                      maxDate={new Date(getMaxDate())}
                      minDate={new Date(new Date().setFullYear(new Date().getFullYear() - 100))}
                      error={errors.dateOfBirth}
                      placeholder="Choose your birth date"
                    />
                    {formData.dateOfBirth && !errors.dateOfBirth && calculateAge(formData.dateOfBirth) !== null && (
                      <p className="text-xs text-text-muted mt-1">
                        Age: {calculateAge(formData.dateOfBirth)} years
                      </p>
                    )}
                    {formData.gender && (
                      <p className="text-xs text-text-muted mt-1">
                        Minimum age: {getMinAge()} years
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Height (cm) <span className="text-error">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Limit to 3 digits max (999)
                        if (val === '' || (val.length <= 3 && !isNaN(Number(val)))) {
                          updateField('height', val ? parseInt(val) : undefined);
                        }
                      }}
                      placeholder="e.g., 175"
                      min={140}
                      max={999}
                      error={errors.height}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Weight (kg)
                    </label>
                    <Input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateField('weight', val ? parseInt(val) : undefined);
                      }}
                      placeholder="e.g., 70"
                      min={30}
                      max={200}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Community <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.community ? String(formData.community) : (formData.origin ? String(formData.origin) : '')}
                    onValueChange={(val) => {
                      updateField('community', val);
                      // Also update origin for backward compatibility
                      updateField('origin', val);
                    }}
                    key={`community-${formData.community || formData.origin || 'empty'}`}
                  >
                    <SelectTrigger className={errors.community ? 'border-error' : ''}>
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMUNITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.community && (
                    <p className="text-xs text-error mt-1">{errors.community}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Account Created By <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.accountCreatedBy || ''}
                    onValueChange={(val) => updateField('accountCreatedBy', val || undefined)}
                    key={`accountCreatedBy-${formData.accountCreatedBy || 'empty'}`}
                  >
                    <SelectTrigger className={errors.accountCreatedBy ? 'border-error' : ''}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_CREATED_BY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.accountCreatedBy && (
                    <p className="text-xs text-error mt-1">{errors.accountCreatedBy}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Body Type
                    </label>
                    <Select
                      value={formData.bodyType || ''}
                      onValueChange={(val) => updateField('bodyType', val)}
                      key={`bodyType-${formData.bodyType || 'empty'}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formData.gender === 'female' ? FEMALE_BODY_TYPES : BODY_TYPES).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Complexion
                    </label>
                    <Select
                      value={formData.complexion || ''}
                      onValueChange={(val) => updateField('complexion', val)}
                      key={`complexion-${formData.complexion || 'empty'}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexion" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPLEXION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Marital Status <span className="text-error">*</span>
                    </label>
                    <Select
                      value={formData.maritalStatus || 'never_married'}
                      onValueChange={(val) => updateField('maritalStatus', val)}
                      key={`maritalStatus-${formData.maritalStatus || 'never_married'}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Religion <span className="text-error">*</span>
                    </label>
                    <Select
                      value={formData.religion ? String(formData.religion) : ''}
                      onValueChange={(val) => updateField('religion', val)}
                      key={`religion-${formData.religion || 'empty'}`}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select religion" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELIGION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Caste <span className="text-error">*</span>
                    </label>
                    <Select
                      value={formData.caste || ''}
                      onValueChange={(val) => updateField('caste', val || undefined)}
                      key={`caste-${formData.caste || 'empty'}`}
                    >
                      <SelectTrigger className={errors.caste ? 'border-error' : ''}>
                        <SelectValue placeholder="Select caste" />
                      </SelectTrigger>
                      <SelectContent>
                        {CASTE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.caste && (
                      <p className="text-xs text-error mt-1">{errors.caste}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Gotra
                    </label>
                    <Input
                      value={formData.gothra || ''}
                      onChange={(e) => updateField('gothra', e.target.value.trim())}
                      placeholder="Enter your Gotra (optional)"
                    />
                  </div>
                </div>

                <div>
                  <Input
                    label="Mother Tongue"
                    value={formData.motherTongue || ''}
                    onChange={(e) => updateField('motherTongue', e.target.value.trim())}
                    placeholder="e.g., Hindi, English"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Career Tab */}
          <TabsContent value="career">
            <Card>
              <CardHeader>
                <CardTitle>Education & Career</CardTitle>
                <CardDescription>Update your professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Education <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.education || ''}
                    onValueChange={(val) => updateField('education', val)}
                  >
                    <SelectTrigger className={errors.education ? 'border-error' : ''}>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.education && (
                    <p className="text-xs text-error mt-1">{errors.education}</p>
                  )}
                </div>

                <Input
                  label="Education Detail"
                  value={formData.educationDetail || ''}
                  onChange={(e) => updateField('educationDetail', e.target.value.trim())}
                  placeholder="e.g., B.Tech in Computer Science"
                />

                <Input
                  label="College/University"
                  value={formData.college || ''}
                  onChange={(e) => updateField('college', e.target.value.trim())}
                  placeholder="Name of your college"
                />

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Occupation <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.occupation || ''}
                    onValueChange={(val) => updateField('occupation', val)}
                  >
                    <SelectTrigger className={errors.occupation ? 'border-error' : ''}>
                      <SelectValue placeholder="Select occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCUPATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.occupation && (
                    <p className="text-xs text-error mt-1">{errors.occupation}</p>
                  )}
                </div>

                <Input
                  label="Occupation Detail"
                  value={formData.occupationDetail || ''}
                  onChange={(e) => updateField('occupationDetail', e.target.value.trim())}
                  placeholder="e.g., Software Engineer"
                />

                <Input
                  label="Company/Organization"
                  value={formData.company || ''}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Where do you work?"
                />

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Annual Income (INR) <span className="text-error">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.income || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('income', val ? parseInt(val) : undefined);
                    }}
                    placeholder="e.g., 500000"
                    min={0}
                    error={errors.income}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Update your location information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    State <span className="text-error">*</span>
                  </label>
                  <Select
                    value={formData.state || ''}
                    onValueChange={(val) => updateField('state', val)}
                  >
                    <SelectTrigger className={errors.state ? 'border-error' : ''}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-xs text-error mt-1">{errors.state}</p>
                  )}
                </div>

                <Input
                  label="City"
                  value={formData.city || ''}
                  onChange={(e) => updateField('city', e.target.value.trim())}
                  placeholder="Enter your city"
                  error={errors.city}
                  required
                />

                <Input
                  label="Country"
                  value={formData.country || 'India'}
                  onChange={(e) => updateField('country', e.target.value.trim())}
                  disabled
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family & Lifestyle Tab */}
          <TabsContent value="family">
            <Card>
              <CardHeader>
                <CardTitle>Family & Lifestyle</CardTitle>
                <CardDescription>Update your family and lifestyle preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Family Type
                  </label>
                  <Select
                    value={formData.familyType || ''}
                    onValueChange={(val) => updateField('familyType', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select family type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FAMILY_TYPES.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 p-4 border border-border rounded-lg">
                  <h3 className="text-sm font-semibold text-text">Father's Details</h3>
                  <Input
                    label="Father's Name"
                    value={formData.fatherName || ''}
                    onChange={(e) => updateField('fatherName', e.target.value)}
                    placeholder="Father's name (optional)"
                  />
                  <Input
                    label="Father's Occupation"
                    value={formData.fatherOccupation || ''}
                    onChange={(e) => updateField('fatherOccupation', e.target.value.trim())}
                    placeholder="Father's profession"
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Alive Status
                      </label>
                      <Select
                        value={formData.fatherAlive || ''}
                        onValueChange={(val) => updateField('fatherAlive', val || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARENT_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Employment Status
                      </label>
                      <Select
                        value={formData.fatherEmploymentStatus || ''}
                        onValueChange={(val) => updateField('fatherEmploymentStatus', val || undefined)}
                        disabled={formData.fatherAlive === 'deceased'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 border border-border rounded-lg">
                  <h3 className="text-sm font-semibold text-text">Mother's Details</h3>
                  <Input
                    label="Mother's Name"
                    value={(formData.motherName as string) || ''}
                    onChange={(e) => updateField('motherName' as keyof ProfileCreateRequest, e.target.value)}
                    placeholder="Mother's name (optional)"
                  />
                  <Input
                    label="Mother's Occupation"
                    value={formData.motherOccupation || ''}
                    onChange={(e) => updateField('motherOccupation', e.target.value.trim())}
                    placeholder="Mother's profession"
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Alive Status
                      </label>
                      <Select
                        value={formData.motherAlive || ''}
                        onValueChange={(val) => updateField('motherAlive', val || undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {PARENT_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Employment Status
                      </label>
                      <Select
                        value={formData.motherEmploymentStatus || ''}
                        onValueChange={(val) => updateField('motherEmploymentStatus', val || undefined)}
                        disabled={formData.motherAlive === 'deceased'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Input
                  label="Number of Siblings"
                  type="number"
                  value={formData.siblings || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('siblings', val ? parseInt(val) : undefined);
                  }}
                  placeholder="Enter number of siblings (optional)"
                  min={0}
                />

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Diet Preference
                  </label>
                  <Select
                    value={formData.diet || ''}
                    onValueChange={(val) => updateField('diet', val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diet preference" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIET_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Smoking
                    </label>
                    <Select
                      value={formData.smoking || ''}
                      onValueChange={(val) => updateField('smoking', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {HABIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Drinking
                    </label>
                    <Select
                      value={formData.drinking || ''}
                      onValueChange={(val) => updateField('drinking', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {HABIT_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hobbies Section */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                    <Sparkles className="w-4 h-4" />
                    Hobbies & Interests (Optional)
                  </label>
                  <div className="space-y-3">
                    {/* Input for adding new hobby */}
                    <div className="flex gap-2">
                      <Input
                        value={newHobby}
                        onChange={(e) => setNewHobby(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newHobby.trim()) {
                            e.preventDefault();
                            const hobbies = formData.hobbies || [];
                            if (!hobbies.includes(newHobby.trim())) {
                              updateField('hobbies', [...hobbies, newHobby.trim()]);
                              setNewHobby('');
                            }
                          }
                        }}
                        placeholder="Type a hobby and press Enter"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newHobby.trim()) {
                            const hobbies = formData.hobbies || [];
                            if (!hobbies.includes(newHobby.trim())) {
                              updateField('hobbies', [...hobbies, newHobby.trim()]);
                              setNewHobby('');
                            }
                          }
                        }}
                        disabled={!newHobby.trim()}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Display hobbies as badges */}
                    {formData.hobbies && formData.hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-champagne/20">
                        {formData.hobbies.map((hobby, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 px-3 py-1.5 bg-surface border border-border rounded-full text-sm"
                          >
                            <span>{hobby}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const hobbies = formData.hobbies || [];
                                updateField('hobbies', hobbies.filter((_, i) => i !== index));
                              }}
                              className="ml-1 hover:text-error transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {(!formData.hobbies || formData.hobbies.length === 0) && (
                      <p className="text-xs text-text-muted">
                        Add your hobbies and interests to help others know more about you
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    About Me <span className="text-error">*</span>
                  </label>
                  <textarea
                    value={formData.aboutMe || ''}
                    onChange={(e) => updateField('aboutMe', e.target.value)}
                    placeholder="Tell us about yourself, your interests, and what you're looking for..."
                    className={`w-full min-h-[120px] px-4 py-2 rounded-lg border bg-surface text-base focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary resize-none ${
                      errors.aboutMe ? 'border-error' : 'border-border'
                    }`}
                    maxLength={500}
                    required
                  />
                  {errors.aboutMe && (
                    <p className="text-xs text-error mt-1">{errors.aboutMe}</p>
                  )}
                  <p className="text-xs text-text-muted mt-1">
                    {(formData.aboutMe || '').length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isUpdating}
            rightIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

