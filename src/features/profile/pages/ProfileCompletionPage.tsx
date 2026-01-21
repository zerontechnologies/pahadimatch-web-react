import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Users, 
  Heart, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUpdateProfileMutation } from '@/store/api/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { updateUser } from '@/store/slices/authSlice';
import type { ProfileCreateRequest } from '@/types';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User, fields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'height', 'community', 'caste', 'gothra', 'accountCreatedBy'] },
  { id: 2, title: 'Education & Career', icon: GraduationCap, fields: ['education', 'occupation', 'income', 'company'] },
  { id: 3, title: 'Location', icon: MapPin, fields: ['city', 'state', 'country'] },
  { id: 4, title: 'Family & Lifestyle', icon: Users, fields: ['familyType', 'diet', 'aboutMe'] },
];

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

const HABIT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'occasionally', label: 'Occasionally' },
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

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir'
];

export function ProfileCompletionPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [updateProfile] = useUpdateProfileMutation();

  const [formData, setFormData] = useState<ProfileCreateRequest>({
    firstName: '',
    lastName: '',
    gender: undefined,
    dateOfBirth: '',
    height: undefined,
    weight: undefined,
    bodyType: undefined,
    complexion: undefined,
    community: undefined,
    origin: undefined, // Keep for backward compatibility
    accountCreatedBy: undefined,
    caste: undefined,
    subCaste: '',
    gothra: '',
    motherTongue: '',
    education: undefined,
    educationDetail: '',
    college: '',
    occupation: undefined,
    occupationDetail: '',
    income: undefined,
    company: '',
    city: '',
    state: '',
    country: 'India',
    familyType: undefined,
    diet: undefined,
    fatherName: '' as any,
    fatherOccupation: '',
    fatherAlive: undefined,
    fatherEmploymentStatus: undefined,
    motherName: '',
    motherOccupation: '',
    motherAlive: undefined,
    motherEmploymentStatus: undefined,
    siblings: undefined,
    smoking: undefined,
    drinking: undefined,
    hobbies: [],
    aboutMe: '',
    maritalStatus: 'never_married',
    religion: 'hindu',
  });

  const updateField = (field: keyof ProfileCreateRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Re-validate dateOfBirth when gender or dateOfBirth changes
  useEffect(() => {
    if (formData.dateOfBirth && formData.gender) {
      const isValid = validateAge(formData.dateOfBirth, formData.gender);
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (isValid) {
          delete newErrors.dateOfBirth;
        } else {
          if (formData.gender === 'male') {
            newErrors.dateOfBirth = 'Age must be greater than 21 years for males';
          } else {
            newErrors.dateOfBirth = 'Age must be 18 years or above for females';
          }
        }
        return newErrors;
      });
    }
  }, [formData.dateOfBirth, formData.gender]);

  // Re-validate height when it changes
  useEffect(() => {
    if (formData.height !== undefined && formData.height !== null) {
      if (formData.height < 140 || formData.height > 999) {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          newErrors.height = 'Height must be between 140 and 999 cm';
          return newErrors;
        });
      } else {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors.height;
          return newErrors;
        });
      }
    }
  }, [formData.height]);

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
    // Boys: > 21 (strictly greater than 21), Girls: >= 18
    return formData.gender === 'male' ? 21 : 18;
  };

  const getMaxDate = (): string => {
    const minAge = getMinAge();
    // For males, we need to ensure age is > 21, so max date should be 21 years + 1 day ago
    if (formData.gender === 'male') {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 21);
      date.setDate(date.getDate() - 1); // One day before 21st birthday
      return date.toISOString().split('T')[0];
    }
    return new Date(new Date().setFullYear(new Date().getFullYear() - minAge)).toISOString().split('T')[0];
  };

  const validateAge = (dateOfBirth: string, gender?: string): boolean => {
    if (!dateOfBirth) return false;
    const age = calculateAge(dateOfBirth);
    if (age === null) return false;
    
    // Use provided gender or formData.gender
    const currentGender = gender || formData.gender;
    
    // For males: age must be > 21 (strictly greater), for females: age >= 18
    if (currentGender === 'male') {
      return age > 21 && age <= 100;
    } else if (currentGender === 'female') {
      return age >= 18 && age <= 100;
    }
    
    // If gender not set yet, return true (will validate later)
    return true;
  };

  const canProceed = () => {
    const step = STEPS.find((s) => s.id === currentStep);
    if (!step) return false;

    // Check required fields for each step
    if (currentStep === 1) {
      return !!(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.gender &&
        formData.dateOfBirth &&
        validateAge(formData.dateOfBirth) &&
        formData.height &&
        formData.height >= 140 &&
        formData.height <= 999 &&
        formData.community &&
        formData.caste &&
        formData.accountCreatedBy
      );
    }
    
    if (currentStep === 2) {
      return !!(
        formData.education &&
        formData.occupation &&
        formData.income &&
        formData.income > 0
      );
    }
    
    if (currentStep === 3) {
      return !!(
        formData.city &&
        formData.state
      );
    }
    
    if (currentStep === 4) {
      // Step 4: aboutMe is required
      return !!(
        formData.aboutMe?.trim() &&
        formData.aboutMe.trim().length > 0
      );
    }

    return step.fields.every((field) => {
      const value = formData[field as keyof ProfileCreateRequest];
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length && canProceed()) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else {
      // Show validation errors
      const step = STEPS.find((s) => s.id === currentStep);
      if (step) {
        const newErrors: Record<string, string> = {};
        step.fields.forEach((field) => {
          const value = formData[field as keyof ProfileCreateRequest];
          if (!value || value === '' || value === null || value === undefined) {
            newErrors[field] = 'This field is required';
          }
        });
        
        // Additional validations
        if (currentStep === 1) {
          if (formData.height && (formData.height < 140 || formData.height > 999)) {
            newErrors.height = 'Height must be between 140 and 999 cm';
          }
          if (formData.dateOfBirth) {
            if (!formData.gender) {
              newErrors.dateOfBirth = 'Please select gender first';
            } else if (!validateAge(formData.dateOfBirth, formData.gender)) {
              if (formData.gender === 'male') {
                newErrors.dateOfBirth = 'Age must be greater than 21 years for males';
              } else {
                newErrors.dateOfBirth = 'Age must be 18 years or above for females';
              }
            }
          }
        }
        if (currentStep === 2) {
          if (formData.income && formData.income <= 0) {
            newErrors.income = 'Income must be greater than 0';
          }
        }
        setErrors(newErrors);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateAllSteps = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Step 1 validation
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (formData.gender && !validateAge(formData.dateOfBirth, formData.gender)) {
      if (formData.gender === 'male') {
        newErrors.dateOfBirth = 'Age must be greater than 21 years for males';
      } else {
        newErrors.dateOfBirth = 'Age must be 18 years or above for females';
      }
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
    
    // Step 2 validation
    if (!formData.education) {
      newErrors.education = 'Education is required';
    }
    if (!formData.occupation) {
      newErrors.occupation = 'Occupation is required';
    }
    if (!formData.income || formData.income <= 0) {
      newErrors.income = 'Income must be greater than 0';
    }
    
    // Step 3 validation
    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    // Step 4 validation
    if (!formData.aboutMe?.trim() || formData.aboutMe.trim().length === 0) {
      newErrors.aboutMe = 'About Me is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate all steps before submitting
    if (!validateAllSteps()) {
      dispatch(addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields correctly',
      }));
      // Navigate to first step with errors
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateProfile(formData).unwrap();
      
      if (result.success && result.data) {
        dispatch(updateUser({ isProfileComplete: true }));
        dispatch(addToast({
          type: 'success',
          title: 'Profile Completed!',
          message: 'Your profile has been created successfully',
        }));
        navigate('/dashboard');
      }
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to save profile. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate progress based on actual form completion, not just step number
  const calculateProgress = (): number => {
    if (currentStep === 1 && !formData.firstName && !formData.lastName && !formData.gender) {
      return 0; // No data entered yet
    }
    return (currentStep / STEPS.length) * 100;
  };
  
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header for Profile Completion */}
      <div className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-script text-2xl text-primary">PahadiMatch</span>
          </div>
        </div>
      </div>

      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-text mb-2">
            Complete Your Profile
          </h1>
          <p className="text-text-secondary">
            Help us find your perfect match by completing your profile
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-text-secondary">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-4 scrollbar-hide">
          {STEPS.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0
                      ${isActive 
                        ? 'bg-primary text-white shadow-lg scale-110' 
                        : isCompleted
                          ? 'bg-success text-white'
                          : 'bg-champagne text-text-muted'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm mt-2 text-center px-1 ${isActive ? 'font-semibold text-primary' : 'text-text-muted'}`}>
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 sm:mx-2 min-w-[20px] ${isCompleted ? 'bg-success' : 'bg-border'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const currentStepData = STEPS.find((s) => s.id === currentStep);
                const IconComponent = currentStepData?.icon;
                return IconComponent ? (
                  <IconComponent className="w-5 h-5 text-primary" />
                ) : null;
              })()}
              {STEPS.find((s) => s.id === currentStep)?.title}
            </CardTitle>
            <CardDescription>
              Please fill in all the required fields to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="First Name"
                          value={formData.firstName || ''}
                          onChange={(e) => updateField('firstName', e.target.value.trim())}
                          placeholder="Enter your first name"
                          required
                          error={errors.firstName}
                        />
                      </div>
                      <div>
                        <Input
                          label="Last Name"
                          value={formData.lastName || ''}
                          onChange={(e) => updateField('lastName', e.target.value.trim())}
                          placeholder="Enter your last name"
                          required
                          error={errors.lastName}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Gender <span className="text-error">*</span>
                        </label>
                        <Select
                          value={formData.gender || ''}
                          onValueChange={(val) => updateField('gender', val)}
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
                        placeholder="Choose your birth date"
                        error={errors.dateOfBirth}
                      />
                        {errors.dateOfBirth && (
                          <p className="text-xs text-error mt-1">{errors.dateOfBirth}</p>
                        )}
                        {formData.dateOfBirth && calculateAge(formData.dateOfBirth) !== null && (
                          <p className={`text-xs mt-1 ${errors.dateOfBirth ? 'text-error' : 'text-text-muted'}`}>
                            Age: {calculateAge(formData.dateOfBirth)} years
                            {formData.gender && !errors.dateOfBirth && (
                              <span className="ml-2">
                                {formData.gender === 'male' 
                                  ? (calculateAge(formData.dateOfBirth)! > 21 ? '✓ Valid' : '') 
                                  : (calculateAge(formData.dateOfBirth)! >= 18 ? '✓ Valid' : '')}
                              </span>
                            )}
                          </p>
                        )}
                        {formData.gender && !formData.dateOfBirth && (
                          <p className="text-xs text-text-muted mt-1">
                            {formData.gender === 'male' 
                              ? 'Age must be greater than 21 years' 
                              : 'Age must be 18 years or above'}
                          </p>
                        )}
                      </div>
                    </div>

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
                        required
                        error={errors.height}
                      />
                      {formData.height && !errors.height && formData.height >= 140 && formData.height <= 999 && (
                        <p className="text-xs text-text-muted mt-1">✓ Valid</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Community <span className="text-error">*</span>
                      </label>
                      <Select
                        value={formData.community || formData.origin || ''}
                        onValueChange={(val) => {
                          updateField('community', val);
                          updateField('origin', val); // Also update origin for backward compatibility
                        }}
                      >
                        <SelectTrigger className={errors.community ? 'border-error' : ''}>
                          <SelectValue placeholder="Select community" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMUNITY_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
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
                        Caste <span className="text-error">*</span>
                      </label>
                      <Select
                        value={formData.caste || ''}
                        onValueChange={(val) => updateField('caste', val || undefined)}
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

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Account Created By <span className="text-error">*</span>
                      </label>
                      <Select
                        value={formData.accountCreatedBy || ''}
                        onValueChange={(val) => updateField('accountCreatedBy', val || undefined)}
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
                  </>
                )}

                {/* Step 2: Education & Career */}
                {currentStep === 2 && (
                  <>
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
                      onChange={(e) => updateField('educationDetail', e.target.value)}
                      placeholder="e.g., B.Tech in Computer Science (optional)"
                    />

                    <Input
                      label="College/University"
                      value={formData.college || ''}
                      onChange={(e) => updateField('college', e.target.value)}
                      placeholder="Name of your college (optional)"
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
                      onChange={(e) => updateField('occupationDetail', e.target.value)}
                      placeholder="e.g., Software Engineer (optional)"
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
                        required
                      />
                      {errors.income && (
                        <p className="text-xs text-error mt-1">{errors.income}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <>
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
                      required
                      error={errors.city}
                    />

                    <Input
                      label="Country"
                      value={formData.country || 'India'}
                      onChange={(e) => updateField('country', e.target.value)}
                      disabled
                    />
                  </>
                )}

                {/* Step 4: Family & Lifestyle */}
                {currentStep === 4 && (
                  <>
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
                          onValueChange={(val) => updateField('smoking', val || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select (optional)" />
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
                          onValueChange={(val) => updateField('drinking', val || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select (optional)" />
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

                    <div className="space-y-4 p-4 border border-border rounded-lg">
                      <h3 className="text-sm font-semibold text-text">Father's Details</h3>
                      <Input
                        label="Father's Name"
                        value={formData.fatherName || ''}
                        onChange={(e) => updateField('fatherName' as keyof ProfileCreateRequest, e.target.value)}
                        placeholder="Father's name (optional)"
                      />
                      <Input
                        label="Father's Occupation"
                        value={formData.fatherOccupation || ''}
                        onChange={(e) => updateField('fatherOccupation', e.target.value)}
                        placeholder="Father's profession (optional)"
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
                        value={formData.motherName || ''}
                        onChange={(e) => updateField('motherName' as keyof ProfileCreateRequest, e.target.value)}
                        placeholder="Mother's name (optional)"
                      />
                      <Input
                        label="Mother's Occupation"
                        value={formData.motherOccupation || ''}
                        onChange={(e) => updateField('motherOccupation', e.target.value)}
                        placeholder="Mother's profession (optional)"
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
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
          )}
          {currentStep === 1 && <div />}

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Next Step
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              isLoading={isSubmitting}
              rightIcon={<Heart className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Complete Profile
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

