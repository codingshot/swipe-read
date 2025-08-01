import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Filter, TrendingUp, PlayCircle, PauseCircle, Calendar, Clock, Zap, Newspaper, Volume2, VolumeX, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimeFilter } from '@/hooks/useNewsData';
import { MultiFeedSelector, Feed } from './MultiFeedSelector';

interface ReadModeHeaderProps {
  currentIndex: number;
  totalArticles: number;
  todayRead: number;
  dailyGoal: number;
  isAutoPlay: boolean;
  autoRead?: boolean;
  timeFilter: TimeFilter;
  feeds: Feed[];
  selectedFeeds: string[];
  onToggleAutoPlay: () => void;
  onToggleAutoRead?: () => void;
  onTimeFilterChange: (filter: TimeFilter) => void;
  onFeedChange: (feedIds: string[]) => void;
  onOpenSettings: () => void;
  onOpenProfile?: () => void;
  className?: string;
}

export const ReadModeHeader = ({
  currentIndex,
  totalArticles,
  todayRead,
  dailyGoal,
  isAutoPlay,
  autoRead = false,
  timeFilter,
  feeds,
  selectedFeeds,
  onToggleAutoPlay,
  onToggleAutoRead,
  onTimeFilterChange,
  onFeedChange,
  onOpenSettings,
  onOpenProfile,
  className
}: ReadModeHeaderProps) => {
  const progressPercentage = totalArticles > 0 ? ((currentIndex + 1) / totalArticles) * 100 : 0;
  const dailyProgressPercentage = (todayRead / dailyGoal) * 100;
  const isAllCaughtUp = currentIndex >= totalArticles - 1;

  const getFilterIcon = (filter: TimeFilter) => {
    switch (filter) {
      case 'day': return <Clock className="w-3 h-3" />;
      case 'week': return <Calendar className="w-3 h-3" />;
      case 'month': return <Calendar className="w-3 h-3" />;
      case 'before': return <Filter className="w-3 h-3" />;
      case 'demo': return <Zap className="w-3 h-3" />;
      default: return <Filter className="w-3 h-3" />;
    }
  };

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'day': return 'Today';
      case 'week': return 'Week';
      case 'month': return 'Month';
      case 'before': return 'Before';
      case 'all': return 'All';
      case 'demo': return 'Demo';
      default: return filter;
    }
  };

  return (
    <div className={cn("w-full bg-background border-b-2 border-border shadow-card", className)}>
      <div className="container max-w-full sm:max-w-sm mx-auto px-3 sm:px-4 py-2 sm:py-3">
        {/* Newspaper masthead */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          
          {/* Multi Feed Selector */}
          <div className="flex-1 max-w-32 sm:max-w-40 mx-2">
            <MultiFeedSelector
              feeds={feeds}
              selectedFeeds={selectedFeeds}
              onFeedChange={onFeedChange}
              className="text-xs"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="newspaper"
              size="sm"
              onClick={onToggleAutoPlay}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-xs"
            >
              {isAutoPlay ? (
                <PauseCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>

            {/* Audio toggle - only visible in auto-play mode */}
            {isAutoPlay && onToggleAutoRead && (
              <Button
                variant="newspaper"
                size="sm"
                onClick={onToggleAutoRead}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-xs"
                title={autoRead ? "Turn off auto-read" : "Turn on auto-read"}
              >
                {autoRead ? (
                  <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>
            )}
            
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger className="h-6 w-16 sm:h-8 sm:w-20 border-2 border-border bg-background text-xs">
                <div className="flex items-center gap-1">
                  {getFilterIcon(timeFilter)}
                  <span className="hidden sm:inline text-xs font-sans font-bold uppercase truncate">
                    {getFilterLabel(timeFilter).length > 6 ? 
                      `${getFilterLabel(timeFilter).slice(0, 3)}...${getFilterLabel(timeFilter).slice(-2)}` : 
                      getFilterLabel(timeFilter)
                    }
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="border-2 border-border">
                <SelectItem value="day" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    TODAY
                  </div>
                </SelectItem>
                <SelectItem value="week" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    THIS WEEK
                  </div>
                </SelectItem>
                <SelectItem value="month" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    THIS MONTH
                  </div>
                </SelectItem>
                <SelectItem value="before" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3 h-3" />
                    OLDER
                  </div>
                </SelectItem>
                <SelectItem value="all" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3 h-3" />
                    ALL TIME
                  </div>
                </SelectItem>
                <SelectItem value="demo" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    DEMO MODE
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {onOpenProfile && (
              <Button
                variant="newspaper"
                size="sm"
                onClick={onOpenProfile}
                className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                title="My Profile"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            )}
            
            <Button
              variant="newspaper"
              size="sm"
              onClick={onOpenSettings}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};