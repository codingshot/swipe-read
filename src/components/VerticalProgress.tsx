import { cn } from '@/lib/utils';

interface VerticalProgressProps {
  currentIndex: number;
  totalArticles: number;
  todayRead: number;
  dailyGoal: number;
  className?: string;
}

export const VerticalProgress = ({
  currentIndex,
  totalArticles,
  todayRead,
  dailyGoal,
  className
}: VerticalProgressProps) => {
  const progressPercentage = totalArticles > 0 ? ((currentIndex + 1) / totalArticles) * 100 : 0;
  const dailyProgressPercentage = (todayRead / dailyGoal) * 100;

  return (
    <div className={cn(
      "fixed left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-30 flex flex-col items-center gap-2 sm:gap-4",
      className
    )}>
      {/* Article Progress */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-2 h-32 bg-border border-2 border-foreground relative overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-foreground transition-all duration-500"
            style={{ height: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-xs font-sans font-bold text-center leading-tight transform -rotate-90 origin-center whitespace-nowrap">
          <div className="text-muted-foreground">
            {Math.min(currentIndex + 1, totalArticles)}/{totalArticles} READ
          </div>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-2 h-24 bg-border border-2 border-foreground relative overflow-hidden">
          <div 
            className="absolute bottom-0 left-0 right-0 bg-success transition-all duration-500"
            style={{ height: `${Math.min(dailyProgressPercentage, 100)}%` }}
          />
        </div>
        <div className="text-xs font-sans font-bold text-center leading-tight transform -rotate-90 origin-center whitespace-nowrap">
          <div className="text-muted-foreground">
            {todayRead}/{dailyGoal} DAILY
          </div>
        </div>
      </div>

      {/* Goal indicator */}
      {dailyProgressPercentage >= 100 && (
        <div className="text-success animate-bounce">
          🎯
        </div>
      )}
    </div>
  );
};