import { useState, useEffect } from 'react';

interface UseTypingAnimationProps {
  text: string;
  speed?: number;
  delay?: number;
}

export const useTypingAnimation = ({ 
  text, 
  speed = 25, 
  delay = 0 
}: UseTypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    
    const startTimeout = setTimeout(() => {
      let index = 0;
      
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(typeInterval);
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay]);

  return { displayedText, isComplete };
};

// Calculate reading time based on word count (average 200 words per minute)
export const calculateReadingTime = (text: string, titleText: string = ''): number => {
  const combinedText = titleText + ' ' + text;
  const wordCount = combinedText.split(/\s+/).length;
  const readingTimeMinutes = wordCount / 200; // 200 words per minute average
  return Math.max(3, Math.ceil(readingTimeMinutes * 60)); // Minimum 3 seconds, convert to seconds
};