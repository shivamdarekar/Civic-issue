/**
 * OtpInput Component
 * Mobile-optimized 6-digit OTP input with auto-focus and paste support
 */

"use client";

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, digit: string) => {
    if (disabled) return;

    // Only allow single digit
    const sanitizedDigit = digit.replace(/[^0-9]/g, '').slice(0, 1);
    
    const newOtp = value.split('');
    newOtp[index] = sanitizedDigit;
    const newValue = newOtp.join('');
    
    onChange(newValue);

    // Auto-focus next input if digit entered
    if (sanitizedDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    // Handle backspace
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = value.split('');
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
    }
    
    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/[^0-9]/g, '').slice(0, length);
    
    onChange(digits);

    // Focus the next empty input or last input
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleFocus = (index: number) => {
    // Select the input content on focus for easy replacement
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex justify-center gap-2 md:gap-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-lg border-2 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            error
              ? 'border-red-300 text-red-700 focus:border-red-500 focus:ring-red-500 bg-red-50'
              : 'border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-blue-500 bg-white',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100',
            value[index] && !error && 'border-blue-400 bg-blue-50'
          )}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
