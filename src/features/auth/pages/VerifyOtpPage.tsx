import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { OtpInput } from '../components/OtpInput';
import { Button } from '@/components/ui/button';
import { useVerifyOtpMutation, useSendOtpMutation } from '@/store/api/authApi';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import { addToast } from '@/store/slices/uiSlice';
import { formatPhone } from '@/lib/utils';
import type { OtpPurpose } from '@/types';

export function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { phone, purpose } = (location.state as { phone: string; purpose: OtpPurpose }) || {};
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [sendOtp, { isLoading: isResending }] = useSendOtpMutation();

  // Redirect if no phone
  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !isVerifying) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp.length]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setError('');

    try {
      // For signup, include dailyInterestLimit (default: 10 for free users)
      const requestData: any = { phone, otp, purpose };
      if (purpose === 'signup') {
        requestData.dailyInterestLimit = 10; // Default free plan limit
      }
      
      const result = await verifyOtp(requestData).unwrap();
      
      if (result.success && result.data) {
        dispatch(setCredentials(result.data));
        dispatch(addToast({
          type: 'success',
          title: 'Welcome!',
          message: purpose === 'signup' ? 'Account created successfully' : 'Login successful',
        }));
        
        // Navigate based on profile completion
        if (result.data.isNewUser || !result.data.isProfileComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      setOtp('');
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;

    try {
      await sendOtp({ phone, purpose }).unwrap();
      dispatch(addToast({
        type: 'success',
        title: 'OTP Resent',
        message: 'A new verification code has been sent',
      }));
      setCountdown(30);
      setCanResend(false);
      setOtp('');
      setError('');
    } catch (err: any) {
      dispatch(addToast({
        type: 'error',
        title: 'Failed',
        message: err?.data?.message || 'Could not resend OTP',
      }));
    }
  };

  if (!phone) return null;

  return (
    <AuthLayout
      title="Verify Your Number"
      subtitle={`Enter the 6-digit code sent to +91 ${formatPhone(phone)}`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change number</span>
        </button>

        {/* OTP Input */}
        <div>
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              setError('');
            }}
            error={error}
            disabled={isVerifying}
          />
        </div>

        {/* Verify Button */}
        <div className="pt-1">
          <Button
            onClick={handleVerify}
            className="w-full"
            size="lg"
            isLoading={isVerifying}
            disabled={otp.length !== 6}
            rightIcon={<CheckCircle2 className="w-5 h-5" />}
          >
            Verify & Continue
          </Button>
        </div>

        {/* Resend OTP */}
        <div className="text-center pt-2">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-200 rounded px-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-text-secondary">
              Resend OTP in{' '}
              <span className="font-semibold text-primary">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-accent-50 border border-accent-200 mt-2"
        >
          <p className="text-sm text-text-secondary text-center leading-relaxed">
            💡 <strong>Tip:</strong> Check your SMS inbox. The OTP is valid for 10 minutes.
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  );
}

