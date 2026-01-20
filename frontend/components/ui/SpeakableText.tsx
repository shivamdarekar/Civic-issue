"use client";

import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useSpeechSynthesis } from '@/lib/useSpeechSynthesis';
import { useLanguage } from '@/lib/language-context';

type Language = 'en' | 'hi' | 'gu';

interface SpeakableTextProps {
  children: React.ReactNode;
  text?: string; // Optional override if children is complex
  language?: Language;
  className?: string;
  showIcon?: boolean;
  triggerOnHover?: boolean;
}

export function SpeakableText({
  children,
  text,
  language,
  className = '',
  showIcon = false,
  triggerOnHover = true,
}: SpeakableTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { speak, cancel, isSpeaking, isSupported } = useSpeechSynthesis();
  const { language: contextLanguage } = useLanguage();

  const speakText = () => {
    // Use provided text, or extract from children if it's a string
    const textToSpeak = text || (typeof children === 'string' ? children : '');
    
    if (textToSpeak) {
      speak(textToSpeak, language || (contextLanguage as Language));
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (triggerOnHover) {
      speakText();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (triggerOnHover) {
      cancel();
    }
  };

  const handleClick = () => {
    if (!triggerOnHover) {
      if (isSpeaking) {
        cancel();
      } else {
        speakText();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      speakText();
    }
  };

  if (!isSupported) {
    // If speech synthesis is not supported, just render children normally
    return <>{children}</>;
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1
        cursor-pointer
        border-b border-dotted border-blue-400
        hover:border-blue-600
        transition-colors
        ${isSpeaking ? 'text-blue-600 font-medium' : ''}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`Click to hear: ${text || children}`}
    >
      {children}
      {showIcon && (isHovered || isSpeaking) && (
        <Volume2 
          className={`w-3 h-3 ${isSpeaking ? 'text-blue-600 animate-pulse' : 'text-gray-500'}`} 
        />
      )}
    </span>
  );
}