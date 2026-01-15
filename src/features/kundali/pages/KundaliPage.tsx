import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Moon, 
  Save,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGetKundaliQuery, useCreateKundaliMutation } from '@/store/api/kundaliApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { Skeleton } from '@/components/ui/skeleton';
import type { CreateKundaliRequest } from '@/types';

export function KundaliPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data: kundaliData, isLoading } = useGetKundaliQuery();
  const [createKundali, { isLoading: isCreating }] = useCreateKundaliMutation();

  const kundali = kundaliData?.data;
  const [formData, setFormData] = useState<CreateKundaliRequest>({
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    latitude: 0,
    longitude: 0,
    timezone: 5.5,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (kundali) {
      setFormData({
        dateOfBirth: kundali.dateOfBirth,
        timeOfBirth: kundali.timeOfBirth,
        placeOfBirth: kundali.placeOfBirth,
        latitude: 0, // Will be fetched from place
        longitude: 0,
        timezone: 5.5, // Default IST
      });
    }
  }, [kundali]);

  const updateField = (field: keyof CreateKundaliRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePlaceChange = async (place: string) => {
    updateField('placeOfBirth', place);
    // TODO: Integrate with geocoding API to get lat/long/timezone
    // For now, using defaults
    updateField('latitude', 28.6139); // Default to Delhi
    updateField('longitude', 77.2090);
    updateField('timezone', 5.5); // IST
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.timeOfBirth) newErrors.timeOfBirth = 'Time of birth is required';
    if (!formData.placeOfBirth?.trim()) newErrors.placeOfBirth = 'Place of birth is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      dispatch(addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all required fields',
      }));
      return;
    }

    try {
      await createKundali(formData).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'Kundali Created',
        message: 'Your Kundali has been created successfully',
      }));
      navigate('/profile');
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Error',
        message: err?.data?.message || 'Failed to create Kundali. Please try again.',
      }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 py-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
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
            <Sparkles className="w-8 h-8 text-primary" />
            {kundali ? 'My Kundali' : 'Create Kundali'}
          </h1>
          <p className="text-text-secondary mt-1">
            {kundali 
              ? 'View your Kundali details and compatibility information'
              : 'Add your birth details to generate your Kundali for better match compatibility'}
          </p>
        </div>
        {kundali && (
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            leftIcon={<X className="w-4 h-4" />}
          >
            Close
          </Button>
        )}
      </div>

      {kundali ? (
        /* View Kundali */
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-primary" />
                Birth Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted">Date of Birth</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.dateOfBirth}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Time of Birth</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.timeOfBirth}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-text-muted">Place of Birth</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.placeOfBirth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Kundali Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-muted">Rashi (Moon Sign)</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.rashi}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Nakshatra</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.nakshatra}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Nadi</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.nadi}</p>
                </div>
                <div>
                  <label className="text-xs text-text-muted">Gana</label>
                  <p className="text-sm font-medium text-text mt-1">{kundali.gana}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-text-muted">Manglik Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-medium text-text">{kundali.manglikStatus}</p>
                    {kundali.manglikPercentage !== undefined && kundali.manglikPercentage > 0 && (
                      <Badge variant="warning" className="text-xs">
                        {kundali.manglikPercentage}% Manglik
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>About Kundali Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-primary-50 border border-primary-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-text">
                      Kundali Matching (Premium Feature)
                    </p>
                    <p className="text-xs text-text-secondary">
                      View detailed Kundali compatibility scores with other profiles. This includes Varna, Vasya, Tara, Yoni, Graha, Gana, Bhakoot, and Nadi matching along with Manglik compatibility analysis.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3" asChild>
                      <a href="/membership">Upgrade to Premium</a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Create Kundali Form */
        <Card>
          <CardHeader>
            <CardTitle>Birth Details</CardTitle>
            <CardDescription>
              Enter your accurate birth details to generate your Kundali
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Date of Birth <span className="text-error">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    error={errors.dateOfBirth}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Time of Birth <span className="text-error">*</span>
                  </label>
                  <Input
                    type="time"
                    value={formData.timeOfBirth}
                    onChange={(e) => updateField('timeOfBirth', e.target.value)}
                    error={errors.timeOfBirth}
                    required
                  />
                  <p className="text-xs text-text-muted mt-1">Enter time in 24-hour format (e.g., 14:30)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Place of Birth <span className="text-error">*</span>
                </label>
                <Input
                  value={formData.placeOfBirth}
                  onChange={(e) => handlePlaceChange(e.target.value)}
                  placeholder="e.g., Delhi, Mumbai, Bangalore"
                  error={errors.placeOfBirth}
                  required
                />
                <p className="text-xs text-text-muted mt-1">
                  Enter city name. We'll automatically detect coordinates and timezone.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-text mb-1">
                      Important Information
                    </p>
                    <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                      <li>Ensure birth time is accurate for precise Kundali calculation</li>
                      <li>Birth place should be the city where you were born</li>
                      <li>Kundali details cannot be changed once created</li>
                      <li>These details are used for match compatibility analysis</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isCreating}
                  rightIcon={<Save className="w-4 h-4" />}
                >
                  Create Kundali
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}

