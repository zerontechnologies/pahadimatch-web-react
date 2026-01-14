import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUpdateProfileMutation } from '@/store/api/profileApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { updateUser } from '@/store/slices/authSlice';
import type { ProfileCreateRequest } from '@/types';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: User, fields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'height', 'origin'] },
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

const ORIGIN_OPTIONS = [
  { value: 'garhwali', label: 'Garhwali' },
  { value: 'kumaoni', label: 'Kumaoni' },
  { value: 'jonsari', label: 'Jonsari' },
  { value: 'other', label: 'Other' },
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
    origin: undefined,
    education: undefined,
    occupation: undefined,
    income: undefined,
    company: '',
    city: '',
    state: '',
    country: 'India',
    familyType: undefined,
    diet: undefined,
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

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18 && age <= 100 ? age : null;
  };

  const canProceed = () => {
    const step = STEPS.find((s) => s.id === currentStep);
    if (!step) return false;

    // Check required fields for each step
    if (currentStep === 1) {
      const age = formData.dateOfBirth ? calculateAge(formData.dateOfBirth) : null;
      return !!(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.gender &&
        formData.dateOfBirth &&
        age !== null &&
        formData.height &&
        formData.height >= 140 &&
        formData.height <= 210
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
      // Step 4 fields are optional, so always allow proceed
      return true;
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
          if (formData.height && (formData.height < 140 || formData.height > 210)) {
            newErrors.height = 'Height must be between 140 and 210 cm';
          }
          if (formData.dateOfBirth && calculateAge(formData.dateOfBirth) === null) {
            newErrors.dateOfBirth = 'Age must be between 18 and 100 years';
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

  const handleSubmit = async () => {
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

  const progress = (currentStep / STEPS.length) * 100;

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
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Date of Birth <span className="text-error">*</span>
                        </label>
                        <Input
                          type="date"
                          value={formData.dateOfBirth || ''}
                          onChange={(e) => updateField('dateOfBirth', e.target.value)}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
                          required
                        />
                        {errors.dateOfBirth && (
                          <p className="text-xs text-error mt-1">{errors.dateOfBirth}</p>
                        )}
                        {formData.dateOfBirth && !errors.dateOfBirth && calculateAge(formData.dateOfBirth) !== null && (
                          <p className="text-xs text-text-muted mt-1">
                            Age: {calculateAge(formData.dateOfBirth)} years
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
                          updateField('height', val ? parseInt(val) : undefined);
                        }}
                        placeholder="e.g., 175"
                        min={140}
                        max={210}
                        required
                      />
                      {errors.height && (
                        <p className="text-xs text-error mt-1">{errors.height}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Origin
                      </label>
                      <Select
                        value={formData.origin || ''}
                        onValueChange={(val) => updateField('origin', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select origin (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {ORIGIN_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      label="Company/Organization"
                      value={formData.company || ''}
                      onChange={(e) => updateField('company', e.target.value.trim())}
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

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        About Me
                      </label>
                      <textarea
                        value={formData.aboutMe || ''}
                        onChange={(e) => updateField('aboutMe', e.target.value)}
                        placeholder="Tell us about yourself, your interests, and what you're looking for..."
                        className="w-full min-h-[120px] px-4 py-2 rounded-lg border border-border bg-surface text-base focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary resize-none"
                        maxLength={500}
                      />
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
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Previous
          </Button>

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

