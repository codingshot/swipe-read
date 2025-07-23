import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive",
      });
      return;
    }

    // Stop any current speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance.current = utterance;

    // Configure voice settings
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Neural') ||
      voice.name.includes('Premium')
    ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtterance.current = null;
    };

    utterance.onerror = (event) => {
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtterance.current = null;
      toast({
        title: "Speech error",
        description: "Failed to read the text aloud",
        variant: "destructive",
      });
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, toast]);

  const pause = useCallback(() => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
    }
  }, [isSpeaking, isPaused]);

  const stop = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtterance.current = null;
    }
  }, [isSpeaking]);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    }
  }, [isSpeaking, isPaused, pause, resume]);

  return {
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
    toggle
  };
};