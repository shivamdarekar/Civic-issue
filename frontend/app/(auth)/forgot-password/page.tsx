"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import OtpInput from "@/components/auth/OtpInput";
import Header from "@/components/auth/Header";
import Footer from "@/components/auth/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const {
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
  } = usePasswordReset();

  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!emailInput || !emailInput.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }

    const result = await requestOtp(emailInput);
    if (!result.success && result.message) {
      setFormError(result.message);
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (otpInput.length !== 6) {
      setFormError("Please enter a valid 6-digit OTP");
      return;
    }

    const result = await verifyOtpCode(otpInput);
    if (!result.success && result.message) {
      setFormError(result.message);
      setOtpInput("");
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    const result = await resetPasswordWithOtp(newPassword);
    if (!result.success && result.message) {
      setFormError(result.message);
    }
  };

  const handleResendOtp = async () => {
    setOtpInput("");
    setFormError(null);
    clearError();
    await resendOtp();
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      <Header showBackButton backUrl="/login" />

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="max-w-2xl w-full">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-2xl border-2 border-blue-300 shadow-lg">
                <Image
                  src="/VMC.webp"
                  alt="VMC Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Reset Password
              </span>
            </h1>
            <p className="text-gray-600 text-lg">
              {step === 1 && "Enter your email to receive a verification code"}
              {step === 2 && "Enter the verification code sent to your email"}
              {step === 3 && "Create a new secure password"}
              {step === 4 && "Your password has been reset successfully"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all shadow-lg ${
                  step >= 1 ? "bg-blue-600 text-white ring-4 ring-blue-200" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > 1 ? <CheckCircle className="w-6 h-6" /> : "1"}
                </div>
              </div>
              
              <div className={`w-24 h-2 mx-4 transition-all rounded-full ${
                step > 1 ? "bg-blue-600" : "bg-gray-300"
              }`} />
              
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all shadow-lg ${
                  step >= 2 ? "bg-blue-600 text-white ring-4 ring-blue-200" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > 2 ? <CheckCircle className="w-6 h-6" /> : "2"}
                </div>
              </div>
              
              <div className={`w-24 h-2 mx-4 transition-all rounded-full ${
                step > 2 ? "bg-blue-600" : "bg-gray-300"
              }`} />
              
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all shadow-lg ${
                  step >= 3 ? "bg-blue-600 text-white ring-4 ring-blue-200" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > 3 ? <CheckCircle className="w-6 h-6" /> : "3"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <span className="text-sm text-gray-600 font-medium w-12 text-center">Email</span>
              <div className="w-24 mx-4" />
              <span className="text-sm text-gray-600 font-medium w-12 text-center">Verify</span>
              <div className="w-24 mx-4" />
              <span className="text-sm text-gray-600 font-medium w-12 text-center">Reset</span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-8 shadow-xl">
            {/* Error Display */}
            {(error || formError) && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <div className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-sm text-red-800">{error || formError}</p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Mail className="w-4 h-4" />
                    Step 1 of 3
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Enter Your Email</h3>
                  <p className="text-gray-600">We'll send a verification code to reset your password</p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="engineer@vmc.gov.in"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="h-12 bg-white/50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all rounded-xl"
                      required
                      autoFocus
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending Code...
                      </div>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>

                  <div className="text-center pt-4 border-t border-gray-200">
                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <KeyRound className="w-4 h-4" />
                    Step 2 of 3
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Enter Verification Code</h3>
                  <p className="text-gray-600 mb-2">We&apos;ve sent a 6-digit code to</p>
                  <p className="font-semibold text-blue-600">{email}</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="flex justify-center">
                    <OtpInput
                      value={otpInput}
                      onChange={setOtpInput}
                      length={6}
                      disabled={loading}
                      error={!!error || !!formError}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={loading || otpInput.length !== 6}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Verifying...
                      </div>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>

                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 py-2 transition-colors font-medium"
                      disabled={loading}
                    >
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="flex-1 text-sm text-gray-600 hover:text-gray-800 py-2 transition-colors"
                      disabled={loading}
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                    <Lock className="w-4 h-4" />
                    Step 3 of 3
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Create New Password</h3>
                  <p className="text-gray-600">Choose a strong password for your account</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        New Password
                      </label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-12 bg-white/50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all rounded-xl pr-12"
                          required
                          autoFocus
                          disabled={loading}
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Confirm Password
                      </label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 bg-white/50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white transition-all rounded-xl"
                        required
                        disabled={loading}
                        minLength={8}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <p className="text-sm font-medium text-blue-800 mb-2">Password Requirements:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          At least 8 characters
                        </li>
                        <li className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${/[A-Za-z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Mix of letters and numbers
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Resetting Password...
                      </div>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                </div>

                <Button
                  onClick={handleBackToLogin}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
