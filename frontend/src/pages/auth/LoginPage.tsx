import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@store/hooks';
import { setAuth } from '@store/authStore';
import { authService } from '@services/authService';
import toast from 'react-hot-toast';
import { Button, Input, Card } from '@components/ui';
import { ThemeToggle } from '@components/ThemeToggle';
import { PageTransition } from '@components/PageTransition';

type LoginStep = 'phone' | 'otp';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');

  const validatePhone = (value: string): boolean => {
    if (!value) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!value.match(/^\+91[6-9]\d{9}$/)) {
      setPhoneError('Please enter a valid Indian phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateOTP = (value: string): boolean => {
    if (!value) {
      setOtpError('OTP is required');
      return false;
    }
    if (value.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleRequestOTP = async (e: FormEvent) => {
    e.preventDefault();

    if (!validatePhone(phone)) return;

    setLoading(true);
    try {
      const response = await authService.requestOTP(phone);
      setRequestId(response.requestId);
      setStep('otp');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateOTP(otp)) return;

    setLoading(true);
    try {
      const response = await authService.verifyOTP(phone, otp, requestId);
      dispatch(setAuth({ user: response.user, accessToken: response.tokens.accessToken }));
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally{
      setLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setOtpError('');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 transition-colors duration-300 relative">
        {/* Theme Toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="max-w-md w-full">
        <Card variant="elevated" padding="lg" className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
              Preṣaka
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">The Trusted Messenger</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <Input
                type="tel"
                label="Phone Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) validatePhone(e.target.value);
                }}
                placeholder="+919876543210"
                error={phoneError}
                helperText="Enter your Indian phone number with country code"
                disabled={loading}
                autoFocus
                fullWidth
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
                fullWidth
              >
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <Input
                type="text"
                label="Enter OTP"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  if (otpError) validateOTP(value);
                }}
                placeholder="123456"
                error={otpError}
                helperText={`OTP sent to ${phone}`}
                disabled={loading}
                autoFocus
                fullWidth
                className="text-center text-2xl tracking-widest font-semibold"
                leftIcon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
              />

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  fullWidth
                >
                  Verify OTP
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleChangeNumber}
                  disabled={loading}
                  fullWidth
                >
                  Change Number
                </Button>
              </div>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6 px-4">
          By continuing, you agree to our{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Privacy Policy
          </button>
        </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;

