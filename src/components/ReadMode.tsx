import { useState, useEffect } from 'react';
import { SwipeCard } from './SwipeCard';
import { ReadModeHeader } from './ReadModeHeader';
import { SwipeActions } from './SwipeActions';
import { VerticalProgress } from './VerticalProgress';
import { ComingSoonFeatures } from './ComingSoonFeatures';
import { NavigationFeatures } from './NavigationFeatures';
import { useNewsData } from '@/hooks/useNewsData';
import { useSpeech } from '@/hooks/useSpeech';
import { calculateReadingTime } from '@/hooks/useTypingAnimation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Coffee, Zap, Archive, Calendar, Clock, Filter } from 'lucide-react';
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
    readArticles,
    savedForLaterArticles,
    handleSwipe,
    handleBookmark,
    saveForLater,
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

  // Auto-play functionality with reading time calculation
  useEffect(() => {
    if (isAutoPlay && !isAllCaughtUp && currentArticle) {
      const readingTime = calculateReadingTime(currentArticle.description, currentArticle.title);
      const autoPlayDelay = Math.max(5000, readingTime * 1000); // Minimum 5 seconds or calculated reading time
      
      const interval = setInterval(() => {
        if (currentIndex < unreadArticles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsAutoPlay(false);
        }
      }, autoPlayDelay);

      setAutoPlayInterval(interval);
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isAutoPlay, currentIndex, unreadArticles.length, isAllCaughtUp, setCurrentIndex, currentArticle]);

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

  const handleSaveForLater = (article: typeof currentArticle) => {
    if (article) {
      saveForLater(article);
    }
  };

  const handleViewReadStories = () => {
    // TODO: Implement read stories view
    console.log('View read stories:', readArticles);
  };

  const handleViewSavedStories = () => {
    // TODO: Implement saved stories view  
    console.log('View saved stories:', savedForLaterArticles);
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
        
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-3 sm:p-4">
          <Card className="max-w-sm w-full p-6 sm:p-8 text-center space-y-4 sm:space-y-6 swipe-card">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-2 border-foreground bg-background flex items-center justify-center">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
            </div>
            
            <div className="space-y-3">
              <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase tracking-wide">ALL CAUGHT UP!</h2>
              <p className="font-body text-muted-foreground text-sm sm:text-base">
                You've read all the latest articles from the selected time period.
              </p>
              
              <div className="border-2 border-border p-3 sm:p-4 space-y-2 bg-muted/20">
                <div className="text-sm font-sans font-bold uppercase tracking-wide">TODAY'S EDITION</div>
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
            </div>
            
            {/* Old articles section */}
            <div className="space-y-3">
              <div className="border-t-2 border-border pt-4">
                <div className="text-sm font-sans font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  READ OLDER STORIES
                </div>
                <Select value="" onValueChange={changeTimeFilter}>
                  <SelectTrigger className="w-full border-2 border-border bg-background font-sans font-bold h-10">
                    <div className="flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Calendar className="w-4 h-4" />
                      <SelectValue placeholder="CHOOSE TIME PERIOD" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-2 border-border bg-background z-50">
                    <SelectItem value="week" className="font-sans font-bold uppercase">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        THIS WEEK
                      </div>
                    </SelectItem>
                    <SelectItem value="month" className="font-sans font-bold uppercase">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        THIS MONTH
                      </div>
                    </SelectItem>
                    <SelectItem value="before" className="font-sans font-bold uppercase">
                      <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        OLDER ARTICLES
                      </div>
                    </SelectItem>
                    <SelectItem value="all" className="font-sans font-bold uppercase">
                      <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3" />
                        ALL TIME
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleRefresh} 
                variant="newspaper"
                className="w-full"
              >
                CHECK FOR NEW STORIES
              </Button>
              <p className="text-xs text-muted-foreground font-sans">
                Fresh articles appear throughout the day
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
      
      {/* Vertical Progress on Left */}
      <VerticalProgress
        currentIndex={currentIndex}
        totalArticles={unreadArticles.length}
        todayRead={dailyStats.todayRead}
        dailyGoal={dailyStats.dailyGoal}
      />

      {/* Coming Soon Features on Right */}
      <ComingSoonFeatures />

      {/* Navigation Features on Left Bottom */}
      <NavigationFeatures
        readCount={readArticles.length}
        savedCount={savedForLaterArticles.length}
        onViewReadStories={handleViewReadStories}
        onViewSavedStories={handleViewSavedStories}
      />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-280px)] sm:min-h-[calc(100vh-240px)] p-4 sm:p-6 relative px-16 sm:px-20">
        {/* Demo mode indicator */}
        {timeFilter === 'demo' && (
          <div className="absolute top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-40">
            <Badge variant="secondary" className="bg-foreground text-background border-2 border-border font-sans font-bold uppercase tracking-wide text-xs">
              <Zap className="w-3 h-3 mr-1" />
              DEMO MODE
            </Badge>
          </div>
        )}
        
        {/* Centered card container */}
        <div className="relative w-full max-w-sm mx-auto flex items-center justify-center">
          <div className="relative w-full h-[500px] sm:h-[600px]">
            {unreadArticles.slice(currentIndex, currentIndex + 3).map((article, index) => (
              <SwipeCard
                key={article.id}
                item={article}
                onSwipe={handleSwipe}
                onShare={handleShare}
                onSpeak={speak}
                onSaveForLater={handleSaveForLater}
                className={cn(
                  "absolute inset-0 transition-all duration-300 newspaper-enter",
                  index === 0 ? "z-30" : index === 1 ? "z-20" : "z-10"
                )}
                style={{
                  transform: `translateY(${index * 4}px) scale(${1 - index * 0.02})`,
                  opacity: 1 - index * 0.1
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <SwipeActions
        onLike={handleLike}
        onDismiss={handleDismiss}
        onUndo={undoLastAction}
        onBookmark={handleBookmarkAction}
        canUndo={canUndo}
        className="fixed bottom-6 sm:bottom-8 left-0 right-0 z-50 pointer-events-auto"
      />
    </div>
  );
};