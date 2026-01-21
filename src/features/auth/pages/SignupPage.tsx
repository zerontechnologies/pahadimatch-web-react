import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Heart } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { PhoneInput } from '../components/PhoneInput';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSendOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { isValidPhone } from '@/lib/utils';

const benefits = [
  { icon: Shield, text: 'Privacy-first approach with controlled visibility' },
  { icon: Heart, text: 'Smart matching based on preferences & values' },
];

export function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState((location.state as any)?.phone || '');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!agreed) {
      dispatch(addToast({
        type: 'warning',
        title: 'Terms Required',
        message: 'Please accept the terms and conditions to continue',
      }));
      return;
    }

    try {
      const result = await sendOtp({ phone, purpose: 'signup' }).unwrap();
      
      if (result.success) {
        dispatch(addToast({
          type: 'success',
          title: 'OTP Sent',
          message: 'Please check your phone for the verification code',
        }));
        navigate('/verify-otp', { state: { phone, purpose: 'signup' } });
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to send OTP. Please try again.';
      
      // If user already registered, redirect to login
      if (errorMessage.includes('already registered')) {
        dispatch(addToast({
          type: 'info',
          title: 'Already Registered',
          message: 'Please login to continue',
        }));
        navigate('/login', { state: { phone } });
        return;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="Begin Your Journey"
      subtitle="Join thousands of families finding their perfect match"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="flex items-start gap-3 text-sm text-text-secondary"
            >
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <benefit.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="leading-relaxed pt-0.5">{benefit.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-border my-2" />

        {/* Phone Input */}
        <div>
          <PhoneInput
            label="Mobile Number"
            value={phone}
            onChange={(val) => {
              setPhone(val);
              setError('');
            }}
            error={error}
            disabled={isLoading}
          />
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-3 pt-1">
          <div className="pt-1">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
          </div>
          <label 
            htmlFor="terms" 
            className="text-sm text-text-secondary cursor-pointer leading-relaxed flex-1"
          >
            I agree to the{' '}
            <a 
              href="/terms" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-0.5 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a 
              href="/privacy" 
              className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-0.5 transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
          </label>
        </div>

        {/* Get Started Button */}
        <div className="pt-1">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Get Started
          </Button>
        </div>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-sm sm:text-base text-text-secondary">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-1 transition-colors"
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

