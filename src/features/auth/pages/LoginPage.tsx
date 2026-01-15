import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { PhoneInput } from '../components/PhoneInput';
import { Button } from '@/components/ui/button';
import { useSendOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { isValidPhone } from '@/lib/utils';

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [sendOtp, { isLoading }] = useSendOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidPhone(phone)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      const result = await sendOtp({ phone, purpose: 'login' }).unwrap();
      
      if (result.success) {
        dispatch(addToast({
          type: 'success',
          title: 'OTP Sent',
          message: 'Please check your phone for the verification code',
        }));
        navigate('/verify-otp', { state: { phone, purpose: 'login' } });
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to send OTP. Please try again.';
      
      // If user not registered, redirect to signup
      if (err?.data?.error?.code === 'NOT_FOUND' || errorMessage.includes('not registered')) {
        dispatch(addToast({
          type: 'info',
          title: 'New User',
          message: 'Please sign up first to continue',
        }));
        navigate('/signup', { state: { phone } });
        return;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your phone number to continue your journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Continue Button */}
        <div className="pt-1">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Continue
          </Button>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-start gap-3 p-4 rounded-xl bg-success/5 border border-success/20 mt-2"
        >
          <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary leading-relaxed">
            Your data is protected with bank-grade encryption. We never share your information.
          </p>
        </motion.div>

        {/* Signup Link */}
        <div className="text-center pt-4">
          <p className="text-sm sm:text-base text-text-secondary">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-primary font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-1 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

