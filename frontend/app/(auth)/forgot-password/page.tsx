"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, Lock, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { usePasswordReset } from "@/hooks/usePasswordReset";
import OtpInput from "@/components/OtpInput";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

  // Form state
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Step 1: Email Submission
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!emailInput || !emailInput.includes("@")) {
      setFormError(t("forgot.password.error.invalid.email") || "Please enter a valid email address");
      return;
    }

    const result = await requestOtp(emailInput);
    if (!result.success && result.message) {
      setFormError(result.message);
    }
  };

  // Step 2: OTP Verification
  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (otpInput.length !== 6) {
      setFormError(t("forgot.password.error.invalid.otp") || "Please enter a valid 6-digit OTP");
      return;
    }

    const result = await verifyOtpCode(otpInput);
    if (!result.success && result.message) {
      setFormError(result.message);
      setOtpInput(""); // Clear OTP on error
    }
  };

  // Step 3: Password Reset
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    // Validate password match
    if (newPassword !== confirmPassword) {
      setFormError(t("forgot.password.error.password.mismatch") || "Passwords do not match");
      return;
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setFormError(t("forgot.password.error.password.weak") || "Password must be at least 8 characters");
      return;
    }

    const result = await resetPasswordWithOtp(newPassword);
    if (!result.success && result.message) {
      setFormError(result.message);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    setOtpInput("");
    setFormError(null);
    clearError();
    await resendOtp();
  };

  // Navigate back to login
  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-xl border-2 border-blue-200">
                <Image
                  src="/VMC.webp"
                  alt="VMC Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {t("forgot.password.title") || "Reset Password"}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {step === 1 && (t("forgot.password.description") || "Enter your email to receive an OTP")}
              {step === 2 && (t("forgot.password.otp.description") || "Enter the OTP sent to your email")}
              {step === 3 && (t("forgot.password.new.password.description") || "Create a new secure password")}
              {step === 4 && (t("forgot.password.success.description") || "Your password has been reset successfully")}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            {/* Step numbers and connecting lines */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center justify-center">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all shadow-sm ${
                    step >= 1
                      ? "bg-blue-600 text-white ring-2 ring-blue-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  1
                </div>
              </div>
              
              <div className={`w-20 md:w-24 h-1 mx-2 md:mx-3 transition-all rounded-full ${
                step > 1 ? "bg-blue-600" : "bg-gray-300"
              }`} />
              
              <div className="flex items-center justify-center">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all shadow-sm ${
                    step >= 2
                      ? "bg-blue-600 text-white ring-2 ring-blue-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  2
                </div>
              </div>
              
              <div className={`w-20 md:w-24 h-1 mx-2 md:mx-3 transition-all rounded-full ${
                step > 2 ? "bg-blue-600" : "bg-gray-300"
              }`} />
              
              <div className="flex items-center justify-center">
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all shadow-sm ${
                    step >= 3
                      ? "bg-blue-600 text-white ring-2 ring-blue-200"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  3
                </div>
              </div>
            </div>
            
            {/* Step labels */}
            <div className="flex items-center justify-center">
              <span className="text-xs md:text-sm text-gray-600 font-medium w-10 md:w-12 text-center">
                {t("forgot.password.step.email") || "Email"}
              </span>
              
              <div className="w-20 md:w-24 mx-2 md:mx-3" />
              
              <span className="text-xs md:text-sm text-gray-600 font-medium w-10 md:w-12 text-center">
                {t("forgot.password.step.otp") || "OTP"}
              </span>
              
              <div className="w-20 md:w-24 mx-2 md:mx-3" />
              
              <span className="text-xs md:text-sm text-gray-600 font-medium w-10 md:w-12 text-center">
                {t("forgot.password.step.password") || "Password"}
              </span>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg">
            {/* Error Display */}
            {(error || formError) && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error || formError}</p>
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("forgot.password.email.label") || "Email Address"}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("forgot.password.email.placeholder") || "engineer@vmc.gov.in"}
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="bg-white border-gray-300 text-gray-800"
                    required
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (t("forgot.password.sending") || "Sending...") : (t("forgot.password.send.otp") || "Send OTP")}
                </Button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors pt-4 border-t border-gray-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("forgot.password.back.to.login") || "Back to Login"}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <KeyRound className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      {t("forgot.password.otp.sent") || "We've sent a 6-digit code to"}
                    </p>
                    <p className="font-semibold text-gray-800 mt-1">{email}</p>
                  </div>

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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  disabled={loading || otpInput.length !== 6}
                >
                  {loading ? (t("forgot.password.verifying") || "Verifying...") : (t("forgot.password.verify.otp") || "Verify OTP")}
                </Button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="flex-1 text-sm text-blue-600 hover:text-blue-700 py-2 transition-colors"
                    disabled={loading}
                  >
                    {t("forgot.password.resend.otp") || "Resend OTP"}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="flex-1 text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                    disabled={loading}
                  >
                    {t("forgot.password.change.email") || "Change Email"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {t("forgot.password.new.password") || "New Password"}
                    </label>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("forgot.password.new.password.placeholder") || "Enter new password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white border-gray-300 text-gray-800"
                      required
                      autoFocus
                      disabled={loading}
                      minLength={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {t("forgot.password.confirm.password") || "Confirm Password"}
                    </label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("forgot.password.confirm.password.placeholder") || "Re-enter new password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white border-gray-300 text-gray-800"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-gray-300 bg-white text-blue-600"
                    />
                    {t("forgot.password.show.password") || "Show password"}
                  </label>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium mb-1">{t("forgot.password.requirements") || "Password must contain:"}</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>{t("forgot.password.requirement.length") || "At least 8 characters"}</li>
                      <li>{t("forgot.password.requirement.mix") || "Mix of letters and numbers"}</li>
                    </ul>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  disabled={loading}
                >
                  {loading ? (t("forgot.password.resetting") || "Resetting...") : (t("forgot.password.reset.button") || "Reset Password")}
                </Button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-6">
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {t("forgot.password.success") || "Password Reset Successful!"}
                  </h2>
                  <p className="text-gray-600">
                    {t("forgot.password.success.message") || "Your password has been reset successfully. You can now log in with your new password."}
                  </p>
                </div>

                <Button
                  onClick={handleBackToLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                >
                  {t("forgot.password.go.to.login") || "Go to Login"}
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
