import { cn } from '@/lib/utils';
interface VerticalProgressProps {
  currentIndex: number;
  totalArticles: number;
  readArticles: number; // Changed from todayRead to readArticles for current query
  className?: string;
}
export const VerticalProgress = ({
  currentIndex,
  totalArticles,
  readArticles,
  className
}: VerticalProgressProps) => {
  const progressPercentage = totalArticles > 0 ? (currentIndex + 1) / totalArticles * 100 : 0;
  const readProgressPercentage = totalArticles > 0 ? readArticles / totalArticles * 100 : 0;
  return <div className={cn("fixed left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-30 flex flex-col items-center gap-2 sm:gap-4", className)}>
      {/* Article Progress */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-2 h-32 bg-border border-2 border-foreground relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-foreground transition-all duration-500" style={{
          height: `${progressPercentage}%`
        }} />
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-background/80 px-1 rounded border">
          {currentIndex + 1}/{totalArticles}
        </div>
      </div>

      {/* Query Progress */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-2 h-24 bg-border border-2 border-foreground relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-success transition-all duration-500" style={{
          height: `${Math.min(readProgressPercentage, 100)}%`
        }} />
        </div>
        
      </div>
    </div>;
};