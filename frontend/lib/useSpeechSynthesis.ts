import { useState, useEffect, useCallback, useRef } from 'react';

type Language = 'en' | 'hi' | 'gu';

interface UseSpeechSynthesisOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string, language?: Language) => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
}

const LANGUAGE_CODES: Record<Language, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  gu: 'gu-IN',
};

export function useSpeechSynthesis(
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn {
  const { rate = 1, pitch = 1, volume = 1 } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const cancel = useCallback(() => {
    if (isSupported && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const speak = useCallback(
    (text: string, language: Language = 'en') => {
      if (!isSupported || !text.trim()) {
        return;
      }

      // Cancel any ongoing speech
      cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUAGE_CODES[language] || 'en-US';
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Get all available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try multiple voice selection strategies
      let selectedVoice = null;
      
      // Strategy 1: Exact language code match (e.g., "hi-IN")
      selectedVoice = voices.find(voice => 
        voice.lang === LANGUAGE_CODES[language]
      );
      
      // Strategy 2: Language prefix match (e.g., "hi")
      if (!selectedVoice) {
        const langPrefix = LANGUAGE_CODES[language].split('-')[0];
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith(langPrefix)
        );
      }
      
      // Strategy 3: For Hindi - try multiple variants
      if (!selectedVoice && language === 'hi') {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('hi') || 
          voice.name.toLowerCase().includes('hindi')
        );
      }
      
      // Strategy 4: For Gujarati - try multiple variants
      if (!selectedVoice && language === 'gu') {
        selectedVoice = voices.find(voice => 
          voice.lang.includes('gu') || 
          voice.name.toLowerCase().includes('gujarati')
        );
      }
      
      // Strategy 5: Use any Indian English voice as fallback for hi/gu
      if (!selectedVoice && (language === 'hi' || language === 'gu')) {
        selectedVoice = voices.find(voice => 
          voice.lang === 'en-IN'
        );
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log(`🔊 TTS: Using voice "${selectedVoice.name}" (${selectedVoice.lang}) for language "${language}"`);
      } else {
        console.warn(`⚠️ TTS: No ${language} voice found. Available voices:`, voices.map(v => `${v.name} (${v.lang})`));
        console.warn(`⚠️ TTS: Will use default system voice`);
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (event) => {
        // console.error('🔊 TTS Error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, pitch, volume, cancel]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
  };
}
