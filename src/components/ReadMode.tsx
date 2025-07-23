import { useState, useEffect } from 'react';
import { SwipeCard } from './SwipeCard';
import { ReadModeHeader } from './ReadModeHeader';
import { SwipeActions } from './SwipeActions';
import { VerticalProgress } from './VerticalProgress';
import { ComingSoonFeatures } from './ComingSoonFeatures';
import { NavigationFeatures } from './NavigationFeatures';
import { PlayModeTimer } from './PlayModeTimer';
import { SettingsPopup } from './SettingsPopup';
import { useNewsData } from '@/hooks/useNewsData';
import { useFeedData } from '@/hooks/useFeedData';
import { useSpeech } from '@/hooks/useSpeech';
import { calculateReadingTime } from '@/hooks/useTypingAnimation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Coffee, Zap, Archive, Calendar, Clock, Filter, TrendingUp } from 'lucide-react';
import { MultiFeedSelector } from './MultiFeedSelector';
import { cn } from '@/lib/utils';

export const ReadMode = () => {
  // Feed management
  const {
    feeds,
    selectedFeeds,
    changeFeeds,
    getSelectedFeedUrls,
    getCurrentFeedUrl,
    loading: feedsLoading
  } = useFeedData();

  const {
    articles,
    loading,
    loadingMessage,
    error,
    currentIndex,
    unreadArticles,
    dailyStats,
    timeFilter,
    dailyGoal,
    readArticles,
    savedForLaterArticles,
    swipeActions,
    handleSwipe,
    handleBookmark,
    saveForLater,
    undoLastAction,
    shareArticle,
    setCurrentIndex,
    changeTimeFilter,
    changeDailyGoal,
    canUndo,
    updateSwipeAction
  } = useNewsData('day', getCurrentFeedUrl(), selectedFeeds[0] || 'multi', getSelectedFeedUrls().length > 1 ? 'Multi-Feed' : feeds.find(f => f.id === selectedFeeds[0])?.name);

  const { speak, stop, isSpeaking } = useSpeech();
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [autoRead, setAutoRead] = useState(false);

  const currentArticle = unreadArticles[currentIndex];
  const isAllCaughtUp = !currentArticle || currentIndex >= unreadArticles.length;

  // Auto-play functionality with reading time calculation
  useEffect(() => {
    if (isAutoPlay && !isAllCaughtUp && currentArticle) {
      const readingTime = calculateReadingTime(currentArticle.description, currentArticle.title);
      const autoPlayDelay = Math.max(5000, readingTime * 1000); // Minimum 5 seconds or calculated reading time
      
      // Start auto-read if enabled
      if (autoRead) {
        const textToSpeak = currentArticle.title + '. ' + currentArticle.description;
        speak(textToSpeak);
      }
      
      const interval = setInterval(() => {
        // Stop speaking when moving to next card
        if (isSpeaking) {
          stop();
        }
        
        if (currentIndex < unreadArticles.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsAutoPlay(false);
          setAutoRead(false);
        }
      }, autoPlayDelay);

      setAutoPlayInterval(interval);
      return () => {
        clearInterval(interval);
        // Stop speaking when auto-play stops
        if (isSpeaking) {
          stop();
        }
      };
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isAutoPlay, currentIndex, unreadArticles.length, isAllCaughtUp, setCurrentIndex, currentArticle, autoRead, speak, stop, isSpeaking]);

  // Get current auto-play delay for timer display
  const getCurrentAutoPlayDelay = () => {
    if (!currentArticle) return 5000;
    const readingTime = calculateReadingTime(currentArticle.description, currentArticle.title);
    return Math.max(5000, readingTime * 1000);
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

  // Keyboard shortcuts with animations
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          // Toggle card flip (assumes current card is the first one)
          const currentCard = document.querySelector('[data-card-index="0"]');
          if (currentCard) {
            (currentCard as HTMLElement).click();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          // Add animation trigger before handling dismiss
          const leftCard = document.querySelector('[data-card-index="0"]');
          if (leftCard && currentArticle) {
            // Trigger swipe animation
            const cardElement = leftCard as HTMLElement;
            cardElement.style.transform = 'translateX(-100px) rotate(-15deg)';
            cardElement.style.transition = 'transform 0.3s ease-out';
            
            setTimeout(() => {
              handleDismiss();
            }, 150);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          // Add animation trigger before handling like
          const rightCard = document.querySelector('[data-card-index="0"]');
          if (rightCard && currentArticle) {
            // Trigger swipe animation
            const cardElement = rightCard as HTMLElement;
            cardElement.style.transform = 'translateX(100px) rotate(15deg)';
            cardElement.style.transition = 'transform 0.3s ease-out';
            
            setTimeout(() => {
              handleLike();
            }, 150);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleLike, handleDismiss, currentArticle]);

  const handleToggleAutoPlay = () => {
    const newAutoPlay = !isAutoPlay;
    setIsAutoPlay(newAutoPlay);
    
    // Reset auto-read when toggling auto-play
    if (!newAutoPlay) {
      setAutoRead(false);
      if (isSpeaking) {
        stop();
      }
    }
  };

  const handleToggleAutoRead = () => {
    setAutoRead(!autoRead);
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

  const handleSwitchToFeed = (feedId: string) => {
    changeFeeds([feedId]);
  };

  const handleFeedChange = (feedIds: string[]) => {
    changeFeeds(feedIds);
  };

  const handleSwitchToSingleFeed = (feedId: string) => {
    changeFeeds([feedId]);
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
            <p className="text-muted-foreground text-sm animate-pulse">
              {loadingMessage}
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
    // Group read articles by selected feeds for display
    const feedStats = selectedFeeds.map(feedId => {
      const feed = feeds.find(f => f.id === feedId);
      // For now, we'll show the total articles read divided by number of feeds
      // In a real implementation, you'd track which feed each article came from
      const articlesPerFeed = Math.floor(readArticles.length / selectedFeeds.length);
      return {
        feedName: feed?.name || 'Unknown Feed',
        articleCount: articlesPerFeed
      };
    }).filter(stat => stat.articleCount > 0);

    return (
      <div className="min-h-screen bg-background">
        <ReadModeHeader
          currentIndex={unreadArticles.length}
          totalArticles={unreadArticles.length}
          todayRead={dailyStats.todayRead}
          dailyGoal={dailyStats.dailyGoal}
          isAutoPlay={false}
          timeFilter={timeFilter}
          feeds={feeds}
          selectedFeeds={selectedFeeds}
          onToggleAutoPlay={() => {}}
          onTimeFilterChange={changeTimeFilter}
          onFeedChange={handleFeedChange}
          onOpenSettings={() => setShowSettings(true)}
        />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] p-3 sm:p-4">
          <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-4 sm:space-y-6 swipe-card">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border-2 border-foreground bg-background flex items-center justify-center">
              <Coffee className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" />
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase tracking-wide">ALL CAUGHT UP!</h2>
              <p className="font-body text-muted-foreground text-sm sm:text-base">
                You've read all the latest articles from the selected time period.
              </p>
              
              {/* Articles read by feed */}
              {feedStats.length > 0 && (
                <div className="border-2 border-border p-3 sm:p-4 space-y-3 bg-muted/20">
                  <div className="text-sm font-sans font-bold uppercase tracking-wide flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    ARTICLES READ BY FEED
                  </div>
                  <div className="space-y-2">
                    {feedStats.map((stat, index) => (
                      <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="font-sans font-medium text-left truncate flex-1">
                          {stat.feedName}:
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs border-border">
                          ~{stat.articleCount} article{stat.articleCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Today's stats */}
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
            
            {/* Multi-feed selector for changing feeds */}
            <div className="space-y-3">
              <div className="border-t-2 border-border pt-4">
                <div className="text-sm font-sans font-bold uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Archive className="w-4 h-4" />
                  CHANGE FEEDS
                </div>
                <MultiFeedSelector
                  feeds={feeds}
                  selectedFeeds={selectedFeeds}
                  onFeedChange={handleFeedChange}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Time period selector */}
            <div className="space-y-3">
              <div className="border-t-2 border-border pt-4">
                <div className="text-sm font-sans font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
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
      {/* Play Mode Timer - Shows at top when auto-play is active */}
      <PlayModeTimer 
        isPlaying={isAutoPlay}
        duration={getCurrentAutoPlayDelay()}
        onComplete={() => {
          if (currentIndex < unreadArticles.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            setIsAutoPlay(false);
          }
        }}
        key={`${currentIndex}-${isAutoPlay}`} // Reset timer when article changes or auto-play toggles
      />

      <ReadModeHeader
        currentIndex={currentIndex}
        totalArticles={unreadArticles.length}
        todayRead={dailyStats.todayRead}
        dailyGoal={dailyStats.dailyGoal}
        isAutoPlay={isAutoPlay}
        autoRead={autoRead}
        timeFilter={timeFilter}
        feeds={feeds}
        selectedFeeds={selectedFeeds}
        onToggleAutoPlay={handleToggleAutoPlay}
        onToggleAutoRead={handleToggleAutoRead}
        onTimeFilterChange={changeTimeFilter}
        onFeedChange={handleFeedChange}
        onOpenSettings={() => setShowSettings(true)}
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
        readArticles={readArticles}
        swipeActions={swipeActions}
        feeds={feeds}
        currentFeed={selectedFeeds[0] || ''}
        onUpdateSwipeAction={updateSwipeAction}
        onViewSavedStories={handleViewSavedStories}
        onSwitchToFeed={handleSwitchToFeed}
        savedCount={savedForLaterArticles.length}
      />

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-300px)] sm:min-h-[calc(100vh-260px)] p-4 sm:p-8 relative px-16 sm:px-20 pb-32 sm:pb-24">
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
            {unreadArticles.slice(currentIndex, currentIndex + 3).map((article, index) => {
              // Simple approach: use first selected feed as default for display
              // In a real implementation, you'd track which feed each article came from
              const displayFeed = feeds.find(feed => selectedFeeds.includes(feed.id));
              
              return (
                <SwipeCard
                  key={article.id}
                  item={article}
                  feedName={displayFeed?.name}
                  feedId={displayFeed?.id}
                  onSwipe={handleSwipe}
                  onShare={handleShare}
                  onSpeak={speak}
                  onSaveForLater={handleSaveForLater}
                  onSwitchToFeed={handleSwitchToSingleFeed}
                  data-card-index={index}
                  className={cn(
                    "absolute inset-0 transition-all duration-300 newspaper-enter",
                    index === 0 ? "z-30" : index === 1 ? "z-20" : "z-10"
                  )}
                  style={{
                    transform: `translateY(${index * 4}px) scale(${1 - index * 0.02})`,
                    opacity: 1 - index * 0.1
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Swipe Actions - Now always visible */}
      <SwipeActions
        onLike={handleLike}
        onDismiss={handleDismiss}
        onUndo={undoLastAction}
        canUndo={canUndo}
        className="fixed bottom-6 sm:bottom-8 left-0 right-0 z-50 pointer-events-auto"
      />

      {/* Settings Popup */}
      <SettingsPopup
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        feeds={feeds}
        currentFeed={selectedFeeds[0] || ''}
        onFeedChange={(feedId) => changeFeeds([feedId])}
        timeFilter={timeFilter}
        onTimeFilterChange={changeTimeFilter}
        dailyGoal={dailyGoal}
        onDailyGoalChange={changeDailyGoal}
      />
    </div>
  );
};