import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationFeaturesProps {
  readCount: number;
  savedCount: number;
  onViewReadStories: () => void;
  onViewSavedStories: () => void;
  className?: string;
}

export const NavigationFeatures = ({ 
  readCount,
  savedCount,
  onViewReadStories,
  onViewSavedStories,
  className 
}: NavigationFeaturesProps) => {
  return (
    <div className={cn(
      "fixed left-1 sm:left-2 bottom-24 sm:bottom-20 z-30 flex flex-col gap-2 sm:gap-3",
      className
    )}>
      {/* Read Stories Button */}
      <div className="relative group">
        <Button
          variant="newspaper"
          size="sm"
          onClick={onViewReadStories}
          className="w-12 h-12 p-0 relative"
          disabled={readCount === 0}
        >
          <History className="w-5 h-5" />
          {readCount > 0 && (
            <Badge 
              variant="outline" 
              className="absolute -top-2 -right-2 text-xs font-sans font-bold border-2 border-border bg-background px-1 py-0 h-auto min-w-[1.25rem]"
            >
              {readCount > 99 ? '99+' : readCount}
            </Badge>
          )}
        </Button>
        
        {/* Tooltip */}
        <div className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-background border-2 border-border p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-elevated">
          <div className="text-sm font-sans font-bold uppercase tracking-wide">READ STORIES</div>
          <div className="text-xs text-muted-foreground mt-1">View previously read articles</div>
          <div className="text-xs text-muted-foreground font-bold">{readCount} articles</div>
        </div>
      </div>

      {/* Saved for Later Button */}
      <div className="relative group">
        <Button
          variant="newspaper"
          size="sm"
          onClick={onViewSavedStories}
          className="w-12 h-12 p-0 relative"
          disabled={savedCount === 0}
        >
          <BookmarkCheck className="w-5 h-5" />
          {savedCount > 0 && (
            <Badge 
              variant="outline" 
              className="absolute -top-2 -right-2 text-xs font-sans font-bold border-2 border-border bg-background px-1 py-0 h-auto min-w-[1.25rem]"
            >
              {savedCount > 99 ? '99+' : savedCount}
            </Badge>
          )}
        </Button>
        
        {/* Tooltip */}
        <div className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-background border-2 border-border p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-elevated">
          <div className="text-sm font-sans font-bold uppercase tracking-wide">SAVED STORIES</div>
          <div className="text-xs text-muted-foreground mt-1">Articles saved for later</div>
          <div className="text-xs text-muted-foreground font-bold">{savedCount} articles</div>
        </div>
      </div>
    </div>
  );
};