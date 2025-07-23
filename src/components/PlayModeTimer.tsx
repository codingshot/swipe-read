import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PlayModeTimerProps {
  isPlaying: boolean;
  duration: number; // in milliseconds
  onComplete: () => void;
  className?: string;
}

export const PlayModeTimer = ({ isPlaying, duration, onComplete, className }: PlayModeTimerProps) => {
  const [progress, setProgress] = useState(100);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      setProgress(100);
      setStartTime(null);
      return;
    }

    const start = Date.now();
    setStartTime(start);
    setProgress(100);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, duration - elapsed);
      const newProgress = (remaining / duration) * 100;
      
      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(interval);
        onComplete();
      }
    }, 50); // Update every 50ms for smooth animation

    return () => clearInterval(interval);
  }, [isPlaying, duration, onComplete]);

  if (!isPlaying) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 h-1 bg-muted/20",
      className
    )}>
      <div 
        className="h-full bg-primary transition-all duration-75 ease-linear"
        style={{ 
          width: `${progress}%`,
          transition: progress === 100 ? 'none' : 'width 0.075s linear'
        }}
      />
      
      {/* Optional pulse effect when time is running out */}
      {progress < 20 && (
        <div className="absolute inset-0 bg-destructive animate-pulse opacity-60" />
      )}
    </div>
  );
};