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
      "flex items-center justify-center gap-4 py-6",
      className
    )}>
      {/* Undo button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          "h-12 w-12 rounded-full border-2 transition-all duration-200",
          canUndo 
            ? "hover:scale-110 hover:shadow-glow" 
            : "opacity-50 cursor-not-allowed"
        )}
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      {/* Dismiss button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onDismiss}
        className="h-16 w-16 rounded-full border-2 border-destructive/30 text-destructive hover:bg-gradient-dismiss hover:text-white hover:border-transparent hover:scale-110 transition-all duration-200 hover:shadow-glow"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Bookmark button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onBookmark}
        className="h-12 w-12 rounded-full border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-200 hover:shadow-glow"
      >
        <Bookmark className="w-5 h-5" />
      </Button>

      {/* Like button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onLike}
        className="h-16 w-16 rounded-full border-2 border-success/30 text-success hover:bg-gradient-like hover:text-white hover:border-transparent hover:scale-110 transition-all duration-200 hover:shadow-glow"
      >
        <Heart className="w-6 h-6" />
      </Button>
    </div>
  );
};