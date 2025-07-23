import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Filter, TrendingUp, PlayCircle, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadModeHeaderProps {
  currentIndex: number;
  totalArticles: number;
  todayRead: number;
  dailyGoal: number;
  isAutoPlay: boolean;
  onToggleAutoPlay: () => void;
  onOpenSettings: () => void;
  onOpenFilters: () => void;
  className?: string;
}

export const ReadModeHeader = ({
  currentIndex,
  totalArticles,
  todayRead,
  dailyGoal,
  isAutoPlay,
  onToggleAutoPlay,
  onOpenSettings,
  onOpenFilters,
  className
}: ReadModeHeaderProps) => {
  const progressPercentage = totalArticles > 0 ? ((currentIndex + 1) / totalArticles) * 100 : 0;
  const dailyProgressPercentage = (todayRead / dailyGoal) * 100;
  const isAllCaughtUp = currentIndex >= totalArticles - 1;

  return (
    <div className={cn("w-full bg-card/80 backdrop-blur-md border-b border-border/50", className)}>
      <div className="max-w-sm mx-auto px-4 py-3">
        {/* Top row - Title and actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              READ MODE
            </h1>
            {isAllCaughtUp && (
              <Badge variant="secondary" className="text-xs bg-gradient-like text-white border-0">
                All caught up! 🎉
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAutoPlay}
              className="h-8 w-8 p-0"
            >
              {isAutoPlay ? (
                <PauseCircle className="w-4 h-4" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenFilters}
              className="h-8 w-8 p-0"
            >
              <Filter className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSettings}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="space-y-2">
          {/* Article progress */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="min-w-0 flex-1">
              Article {Math.min(currentIndex + 1, totalArticles)} of {totalArticles}
            </span>
            <span className="font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-1.5 bg-muted/50"
          />

          {/* Daily reading goal */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
            <TrendingUp className="w-3 h-3" />
            <span className="min-w-0 flex-1">
              Daily goal: {todayRead}/{dailyGoal} articles
            </span>
            <span className="font-medium">
              {Math.round(dailyProgressPercentage)}%
            </span>
          </div>
          <Progress 
            value={dailyProgressPercentage} 
            className="h-1.5 bg-muted/50"
          />
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="outline" className="text-xs">
            🔥 {todayRead} today
          </Badge>
          {dailyProgressPercentage >= 100 && (
            <Badge variant="secondary" className="text-xs bg-gradient-like text-white border-0">
              Goal achieved!
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};