import { Button } from '@/components/ui/button';
import { Heart, X, RotateCcw, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeActionsProps {
  onLike: () => void;
  onDismiss: () => void;
  onUndo: () => void;
  onBookmark: () => void;
  canUndo: boolean;
  className?: string;
}

export const SwipeActions = ({
  onLike,
  onDismiss,
  onUndo,
  onBookmark,
  canUndo,
  className
}: SwipeActionsProps) => {
  return (
    <div className={cn(
      "flex items-center justify-center gap-2 sm:gap-4 py-4 sm:py-6 px-4",
      className
    )}>
      {/* All buttons same size - square design */}
      
      {/* Undo button */}
      <Button
        variant="newspaper"
        size="lg"
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          "h-12 w-12 sm:h-14 sm:w-14 transition-all duration-200 flex-shrink-0 p-0",
          canUndo 
            ? "hover:scale-110 hover:shadow-elevated active:animate-press" 
            : "opacity-50 cursor-not-allowed"
        )}
      >
        <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* Dismiss button */}
      <Button
        variant="newspaper"
        size="lg"
        onClick={onDismiss}
        className="h-12 w-12 sm:h-14 sm:w-14 border-destructive text-destructive hover:bg-destructive hover:text-white hover:scale-110 transition-all duration-200 hover:shadow-elevated active:animate-press flex-shrink-0 p-0"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* Bookmark button */}
      <Button
        variant="newspaper"
        size="lg"
        onClick={onBookmark}
        className="h-12 w-12 sm:h-14 sm:w-14 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200 hover:shadow-elevated active:animate-press flex-shrink-0 p-0"
      >
        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>

      {/* Like button */}
      <Button
        variant="newspaper"
        size="lg"
        onClick={onLike}
        className="h-12 w-12 sm:h-14 sm:w-14 border-success text-success hover:bg-success hover:text-white hover:scale-110 transition-all duration-200 hover:shadow-elevated active:animate-press flex-shrink-0 p-0"
      >
        <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
      </Button>
    </div>
  );
};