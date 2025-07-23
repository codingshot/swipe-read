import { useState, useEffect } from 'react';
import { SwipeCard } from './SwipeCard';
import { ReadModeHeader } from './ReadModeHeader';
import { SwipeActions } from './SwipeActions';
import { useNewsData } from '@/hooks/useNewsData';
import { useSpeech } from '@/hooks/useSpeech';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Coffee, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ReadMode = () => {
  const {
    articles,
    loading,
    error,
    currentIndex,
    unreadArticles,
    dailyStats,
    timeFilter,
    handleSwipe,
    handleBookmark,
    undoLastAction,
    shareArticle,
    setCurrentIndex,
    changeTimeFilter,
    canUndo
  } = useNewsData();

  const { speak } = useSpeech();
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);

  const currentArticle = unreadArticles[currentIndex];
  const isAllCaughtUp = !currentArticle || currentIndex >= unreadArticles.length;

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && !isAllCaughtUp) {
      const interval = setInterval(() => {
        if (currentIndex < unreadArticles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsAutoPlay(false);
        }
      }, 5000); // 5 seconds per article

      setAutoPlayInterval(interval);
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isAutoPlay, currentIndex, unreadArticles.length, isAllCaughtUp, setCurrentIndex]);

  const handleToggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const handleLike = () => {
    if (currentArticle) {
      handleSwipe('right', currentArticle);
    }
  };

  const handleDismiss = () => {
    if (currentArticle) {
      handleSwipe('left', currentArticle);
    }
  };

  const handleBookmarkAction = () => {
    if (currentArticle) {
      handleBookmark(currentArticle);
    }
  };

  const handleShare = (article: typeof currentArticle) => {
    if (article) {
      shareArticle(article);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin">
            <RefreshCw className="w-8 h-8 mx-auto text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Loading fresh articles...</h2>
            <p className="text-muted-foreground text-sm">
              Finding the latest news from the past 24 hours
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Failed to load articles</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Button onClick={handleRefresh} className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (isAllCaughtUp) {
    return (
      <div className="min-h-screen bg-background">
        <ReadModeHeader
          currentIndex={unreadArticles.length}
          totalArticles={unreadArticles.length}
          todayRead={dailyStats.todayRead}
          dailyGoal={dailyStats.dailyGoal}
          isAutoPlay={false}
          timeFilter={timeFilter}
          onToggleAutoPlay={() => {}}
          onTimeFilterChange={changeTimeFilter}
          onOpenSettings={() => {}}
        />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6 bg-gradient-card">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-like flex items-center justify-center">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">All caught up! 🎉</h2>
              <p className="text-muted-foreground">
                You've read all the latest articles from the past 24 hours.
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-medium">Today's Progress</div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Articles read:</span>
                  <span className="font-medium">{dailyStats.todayRead}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Articles liked:</span>
                  <span className="font-medium">{dailyStats.todayLiked}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Articles bookmarked:</span>
                  <span className="font-medium">{dailyStats.todayBookmarked}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleRefresh} 
                className="w-full bg-gradient-primary text-white border-0"
              >
                Check for new articles
              </Button>
              <p className="text-xs text-muted-foreground">
                New articles appear throughout the day
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadModeHeader
        currentIndex={currentIndex}
        totalArticles={unreadArticles.length}
        todayRead={dailyStats.todayRead}
        dailyGoal={dailyStats.dailyGoal}
        isAutoPlay={isAutoPlay}
        timeFilter={timeFilter}
        onToggleAutoPlay={handleToggleAutoPlay}
        onTimeFilterChange={changeTimeFilter}
        onOpenSettings={() => {}}
      />
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-2 sm:p-4 relative">
        {/* Demo mode indicator */}
        {timeFilter === 'demo' && (
          <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-40">
            <Badge variant="secondary" className="bg-foreground text-background border-2 border-border font-sans font-bold uppercase tracking-wide">
              <Zap className="w-3 h-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
        )}
        {/* Card stack effect - show next cards behind current */}
        <div className="relative w-full max-w-sm">
          {unreadArticles.slice(currentIndex, currentIndex + 3).map((article, index) => (
            <SwipeCard
              key={article.id}
              item={article}
              onSwipe={handleSwipe}
              onShare={handleShare}
              onSpeak={speak}
              className={cn(
                "absolute transition-all duration-300 newspaper-enter",
                index === 0 ? "z-30" : index === 1 ? "z-20" : "z-10"
              )}
              style={{
                transform: `translateY(${index * 6}px) scale(${1 - index * 0.03})`,
                opacity: 1 - index * 0.15
              }}
            />
          ))}
        </div>
      </div>

      <SwipeActions
        onLike={handleLike}
        onDismiss={handleDismiss}
        onUndo={undoLastAction}
        onBookmark={handleBookmarkAction}
        canUndo={canUndo}
        className="fixed bottom-8 left-0 right-0"
      />
    </div>
  );
};