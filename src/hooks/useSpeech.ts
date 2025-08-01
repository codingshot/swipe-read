import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  // Load available voices and selected voice from localStorage
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Load saved voice preference
      const savedVoiceId = localStorage.getItem('selected_voice_id');
      if (savedVoiceId && voices.find(v => v.voiceURI === savedVoiceId)) {
        setSelectedVoiceId(savedVoiceId);
      } else if (voices.length > 0) {
        // Set default voice if none saved or saved voice not available
        const defaultVoice = voices.find(voice => 
          voice.name.includes('Samantha') || 
          voice.name.includes('Karen') ||    
          voice.name.includes('Zira') ||     
          voice.name.includes('Natural') || 
          voice.name.includes('Neural') ||
          voice.name.includes('Premium') ||
          voice.name.includes('Enhanced') ||
          (voice.lang.startsWith('en') && voice.localService)
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (defaultVoice) {
          setSelectedVoiceId(defaultVoice.voiceURI);
        }
      }
    };

    loadVoices();
    
    // Voices might not be loaded immediately
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Text-to-speech not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive",
      });
      return;
    }

    // Stop any current speech first
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    currentUtterance.current = null;

    // Clean text for speech: remove URLs and HTML entities
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs starting with http:// or https://
      .replace(/&[#\w]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

    if (!cleanText) {
      toast({
        title: "Nothing to read",
        description: "No readable text found",
        variant: "destructive",
      });
      return;
    }

    // Wait for voices to be loaded before creating utterance
    const startSpeech = () => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      currentUtterance.current = utterance;

      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to use selected voice or find a preferred voice
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(voice => voice.voiceURI === selectedVoiceId);
      
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices.find(voice => 
          voice.name.includes('Samantha') || 
          voice.name.includes('Karen') ||    
          voice.name.includes('Zira') ||     
          voice.name.includes('Natural') || 
          voice.name.includes('Neural') ||
          voice.name.includes('Premium') ||
          voice.name.includes('Enhanced') ||
          (voice.lang.startsWith('en') && voice.localService)
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
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
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtterance.current = null;
        
        // Try again with default voice if error occurred
        if (selectedVoice && voices.length > 0) {
          const defaultVoice = voices[0];
          const retryUtterance = new SpeechSynthesisUtterance(cleanText);
          retryUtterance.voice = defaultVoice;
          retryUtterance.rate = 0.9;
          retryUtterance.pitch = 1;
          retryUtterance.volume = 1;
          
          retryUtterance.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
          };
          
          retryUtterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            currentUtterance.current = null;
          };
          
          retryUtterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            currentUtterance.current = null;
          };
          
          currentUtterance.current = retryUtterance;
          window.speechSynthesis.speak(retryUtterance);
          return;
        }
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      if (currentUtterance.current === utterance) {
        window.speechSynthesis.speak(utterance);
      }
    };

    // If voices are available, start immediately, otherwise wait
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setTimeout(startSpeech, 100);
    } else {
      // Wait for voices to load
      const voicesChangedHandler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
        setTimeout(startSpeech, 100);
      };
      window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
      
      // Fallback timeout
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
        startSpeech();
      }, 2000);
    }
  }, [toast, selectedVoiceId]);

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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    currentUtterance.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    }
  }, [isSpeaking, isPaused, pause, resume]);

  const changeVoice = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    localStorage.setItem('selected_voice_id', voiceId);
  };

  const getSelectedVoice = () => {
    return availableVoices.find(voice => voice.voiceURI === selectedVoiceId);
  };

  return {
    isSpeaking,
    isPaused,
    availableVoices,
    selectedVoiceId,
    selectedVoice: getSelectedVoice(),
    speak,
    pause,
    resume,
    stop,
    toggle,
    changeVoice
  };
};