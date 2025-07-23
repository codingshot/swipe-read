import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewsItem, SwipeAction } from '@/hooks/useNewsData';
import { ReadStoriesPopup } from './ReadStoriesPopup';
import { Feed } from './FeedSelector';

interface NavigationFeaturesProps {
  readArticles: NewsItem[];
  swipeActions: SwipeAction[];
  feeds: Feed[];
  currentFeed: string;
  onUpdateSwipeAction: (itemId: string, newAction: 'like' | 'dismiss' | 'bookmark') => void;
  onViewSavedStories: () => void;
  onSwitchToFeed: (feedId: string) => void;
  onMarkAsUnread: (itemId: string) => void;
  onMarkMultipleAsUnread: (itemIds: string[]) => void;
  savedCount: number;
  className?: string;
  renderAsHistorySection?: boolean;
  dailyStats?: {
    todayRead: number;
    todayLiked: number;
    todayBookmarked: number;
    dailyGoal: number;
  };
}

export const NavigationFeatures = ({ 
  readArticles,
  swipeActions,
  feeds,
  currentFeed,
  onUpdateSwipeAction,
  onViewSavedStories,
  onSwitchToFeed,
  onMarkAsUnread,
  onMarkMultipleAsUnread,
  savedCount,
  className,
  renderAsHistorySection = false,
  dailyStats
}: NavigationFeaturesProps) => {
  const readCount = readArticles.length;
  
  // Render as History section for "All caught up" page
  if (renderAsHistorySection && dailyStats) {
    return (
      <div className="space-y-2">
        <ReadStoriesPopup 
          readArticles={readArticles}
          swipeActions={swipeActions}
          feeds={feeds}
          currentFeed={currentFeed}
          onUpdateSwipeAction={onUpdateSwipeAction}
          onSwitchToFeed={onSwitchToFeed}
          onMarkAsUnread={onMarkAsUnread}
          onMarkMultipleAsUnread={onMarkMultipleAsUnread}
          trigger={
            <button className="w-full text-left">
              <div className="text-sm font-sans font-bold uppercase tracking-wide cursor-pointer hover:text-primary transition-colors">
                HISTORY
              </div>
            </button>
          }
        />
        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="text-left">
            <span className="font-sans font-medium">READ:</span>
            <span className="font-bold ml-1">{dailyStats.todayRead}</span>
          </div>
          <div className="text-right">
            <span className="font-sans font-medium">LIKED:</span>
            <span className="font-bold ml-1">{dailyStats.todayLiked}</span>
          </div>
          <div className="text-left">
            <span className="font-sans font-medium">SAVED:</span>
            <span className="font-bold ml-1">{dailyStats.todayBookmarked}</span>
          </div>
          <div className="text-right">
            <span className="font-sans font-medium">GOAL:</span>
            <span className="font-bold ml-1">{dailyStats.dailyGoal}</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "fixed left-1 sm:left-2 bottom-24 sm:bottom-20 z-30 flex flex-col gap-2 sm:gap-3",
      className
    )}>
      {/* Read Stories Button */}
        <ReadStoriesPopup 
          readArticles={readArticles}
          swipeActions={swipeActions}
          feeds={feeds}
          currentFeed={currentFeed}
          onUpdateSwipeAction={onUpdateSwipeAction}
          onSwitchToFeed={onSwitchToFeed}
          onMarkAsUnread={onMarkAsUnread}
          onMarkMultipleAsUnread={onMarkMultipleAsUnread}
          trigger={
          <div className="relative group">
            <Button
              variant="newspaper"
              size="sm"
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
        }
      />

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