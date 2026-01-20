/**
 * usePasswordReset Hook
 * Manages the 3-step password reset flow state and API interactions
 */

import { useState } from 'react';
import { requestPasswordResetOtp, verifyOtp, resetPassword } from '@/lib/api-client';

export type ResetStep = 1 | 2 | 3 | 4; // 1: Email, 2: OTP, 3: Password, 4: Success

export interface UsePasswordResetReturn {
  step: ResetStep;
  email: string;
  loading: boolean;
  error: string | null;
  requestOtp: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOtpCode: (otpCode: string) => Promise<{ success: boolean; message?: string }>;
  resetPasswordWithOtp: (newPassword: string) => Promise<{ success: boolean; message?: string }>;
  resendOtp: () => Promise<{ success: boolean; message?: string }>;
  goToStep: (step: ResetStep) => void;
  clearError: () => void;
}

export function usePasswordReset(): UsePasswordResetReturn {
  const [step, setStep] = useState<ResetStep>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Step 1: Request OTP
   */
  const requestOtp = async (userEmail: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestPasswordResetOtp(userEmail);
      
      if (response.success) {
        setEmail(userEmail);
        setStep(2);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP
   */
  const verifyOtpCode = async (otpCode: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await verifyOtp(email, otpCode);
      
      if (response.success) {
        setOtp(otpCode);
        setStep(3);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: Reset Password
   */
  const resetPasswordWithOtp = async (newPassword: string): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await resetPassword(email, otp, newPassword);
      
      if (response.success) {
        setStep(4);
        return { success: true };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP (goes back to step 1)
   */
  const resendOtp = async (): Promise<{ success: boolean; message?: string }> => {
    if (!email) {
      return { success: false, message: 'Email not found' };
    }
    
    return requestOtp(email);
  };

  /**
   * Navigate to specific step
   */
  const goToStep = (newStep: ResetStep) => {
    setStep(newStep);
    setError(null);
  };

  /**
   * Clear error message
   */
  const clearError = () => {
    setError(null);
  };

  return {
    step,
    email,
    loading,
    error,
    requestOtp,
    verifyOtpCode,
    resetPasswordWithOtp,
    resendOtp,
    goToStep,
    clearError,
  };
}
