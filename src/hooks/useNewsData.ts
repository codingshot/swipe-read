import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Author {
  link: string;
  name: string;
}

interface Category {
  name: string;
}

interface Source {
  url: string;
  title: string;
}

export interface NewsItem {
  id: string;
  guid: string;
  title: string;
  description: string;
  content: string;
  link: string;
  date: string;
  author: Author[];
  category: Category[];
  source: Source;
}

export interface SwipeAction {
  itemId: string;
  action: 'like' | 'dismiss' | 'bookmark';
  timestamp: number;
  feedId?: string;
  feedName?: string;
}

export type TimeFilter = 'day' | 'week' | 'month' | 'before' | 'all' | 'demo';

const STORAGE_KEYS = {
  READ_ITEMS: 'read_mode_read_items',
  SWIPE_ACTIONS: 'read_mode_swipe_actions',
  DAILY_STATS: 'read_mode_daily_stats',
  FILTERS: 'read_mode_filters',
  TIME_FILTER: 'read_mode_time_filter',
  SAVED_FOR_LATER: 'read_mode_saved_for_later',
  DAILY_GOAL: 'read_mode_daily_goal'
};

export const useNewsData = (initialTimeFilter: TimeFilter = 'day', feedUrl?: string, currentFeedId?: string, currentFeedName?: string) => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [allArticles, setAllArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Loading articles...');
  const [error, setError] = useState<string | null>(null);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [swipeActions, setSwipeActions] = useState<SwipeAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialTimeFilter);
  const [savedForLaterItems, setSavedForLaterItems] = useState<Set<string>>(new Set());
  const [dailyGoal, setDailyGoal] = useState(20);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedReadItems = localStorage.getItem(STORAGE_KEYS.READ_ITEMS);
    const savedSwipeActions = localStorage.getItem(STORAGE_KEYS.SWIPE_ACTIONS);
    const savedTimeFilter = localStorage.getItem(STORAGE_KEYS.TIME_FILTER);
    const savedForLaterItems = localStorage.getItem(STORAGE_KEYS.SAVED_FOR_LATER);
    const savedDailyGoal = localStorage.getItem(STORAGE_KEYS.DAILY_GOAL);

    if (savedReadItems) {
      setReadItems(new Set(JSON.parse(savedReadItems)));
    }

    if (savedSwipeActions) {
      setSwipeActions(JSON.parse(savedSwipeActions));
    }

    if (savedTimeFilter) {
      setTimeFilter(savedTimeFilter as TimeFilter);
    }

    if (savedForLaterItems) {
      setSavedForLaterItems(new Set(JSON.parse(savedForLaterItems)));
    }

    if (savedDailyGoal) {
      setDailyGoal(parseInt(savedDailyGoal));
    }
  }, []);

  // Filter articles based on time period
  const filterArticlesByTime = (articlesData: NewsItem[], filter: TimeFilter): NewsItem[] => {
    if (filter === 'all' || filter === 'demo') {
      return articlesData;
    }

    const now = new Date();
    let cutoffDate: Date;

    switch (filter) {
      case 'day':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'before':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return articlesData.filter((article: NewsItem) => {
          const articleDate = new Date(article.date);
          return articleDate <= cutoffDate;
        });
      default:
        return articlesData;
    }

    return articlesData.filter((article: NewsItem) => {
      const articleDate = new Date(article.date);
      return articleDate > cutoffDate;
    });
  };

  // Get loading message for current filter
  const getLoadingMessage = (filter: TimeFilter) => {
    switch (filter) {
      case 'day':
        return 'Loading articles from the past 24 hours...';
      case 'week':
        return 'Loading articles from the past week...';
      case 'month':
        return 'Loading articles from the past month...';
      case 'before':
        return 'Loading older articles...';
      case 'all':
        return 'Loading all articles...';
      case 'demo':
        return 'Loading demo articles...';
      default:
        return 'Loading articles...';
    }
  };

  // Auto-fallback logic to find articles
  const findArticlesWithFallback = async (articlesData: NewsItem[], requestedFilter: TimeFilter) => {
    const fallbackOrder: TimeFilter[] = ['day', 'week', 'month', 'all'];
    
    // If requested filter is not in fallback order, try it first
    const filtersToTry = requestedFilter === 'demo' || requestedFilter === 'before' || requestedFilter === 'all' 
      ? [requestedFilter] 
      : [requestedFilter, ...fallbackOrder.filter(f => f !== requestedFilter)];

    for (const filter of filtersToTry) {
      setLoadingMessage(getLoadingMessage(filter));
      
      const filteredArticles = filterArticlesByTime(articlesData, filter);
      
      if (filteredArticles.length > 0) {
        if (filter !== requestedFilter) {
          // Auto-switched to a different filter
          setTimeFilter(filter);
          localStorage.setItem(STORAGE_KEYS.TIME_FILTER, filter);
          
          toast({
            title: `No articles found for ${requestedFilter}`,
            description: `Auto-switched to ${filter} filter (${filteredArticles.length} articles found)`,
          });
        }
        return { articles: filteredArticles, actualFilter: filter };
      }
      
      // Add delay to show loading message for each attempt
      if (filter !== filtersToTry[filtersToTry.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    return { articles: [], actualFilter: requestedFilter };
  };

  // Fetch articles from RSS API
  useEffect(() => {
    const fetchArticles = async () => {
      if (!feedUrl) return; // Don't fetch if no feed URL provided
      
      try {
        setLoading(true);
        setError(null);
        setLoadingMessage(getLoadingMessage(timeFilter));

        const response = await fetch(feedUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Sort by date (newest first)
        const sortedArticles = data.sort((a: NewsItem, b: NewsItem) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAllArticles(sortedArticles);

        // Apply time filter with auto-fallback
        const { articles: filteredArticles, actualFilter } = await findArticlesWithFallback(sortedArticles, timeFilter);
        setArticles(filteredArticles);
        
        // Reset current index when filter changes
        setCurrentIndex(0);

        // Show final message if no articles found anywhere
        if (filteredArticles.length === 0) {
          toast({
            title: "No articles available",
            description: "No articles found in any time period. Try checking back later.",
          });
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch articles';
        setError(errorMessage);
        toast({
          title: "Failed to load articles",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [toast, timeFilter, feedUrl, currentFeedId]);

  // Change time filter
  const changeTimeFilter = async (newFilter: TimeFilter) => {
    setTimeFilter(newFilter);
    localStorage.setItem(STORAGE_KEYS.TIME_FILTER, newFilter);
    
    setLoading(true);
    setLoadingMessage(getLoadingMessage(newFilter));
    
    // Apply filter with auto-fallback
    const { articles: filteredArticles, actualFilter } = await findArticlesWithFallback(allArticles, newFilter);
    setArticles(filteredArticles);
    setCurrentIndex(0);
    setLoading(false);

    let description = '';
    switch (actualFilter) {
      case 'day':
        description = 'Showing articles from the last 24 hours';
        break;
      case 'week':
        description = 'Showing articles from the last 7 days';
        break;
      case 'month':
        description = 'Showing articles from the last 30 days';
        break;
      case 'all':
        description = 'Showing all available articles';
        break;
      case 'demo':
        description = 'Demo mode: explore past articles';
        break;
    }

    if (actualFilter === newFilter) {
      toast({
        title: `Switched to ${newFilter} view`,
        description: `${description} (${filteredArticles.length} articles)`,
      });
    }
  };

  // Save data to localStorage
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn('Failed to save to localStorage:', err);
    }
  };

  // Mark article as read
  const markAsRead = (itemId: string) => {
    const newReadItems = new Set(readItems);
    newReadItems.add(itemId);
    setReadItems(newReadItems);
    saveToStorage(STORAGE_KEYS.READ_ITEMS, Array.from(newReadItems));
  };

  // Handle swipe action
  const handleSwipe = (direction: 'left' | 'right', item: NewsItem) => {
    const action: SwipeAction = {
      itemId: item.id,
      action: direction === 'right' ? 'like' : 'dismiss',
      timestamp: Date.now(),
      feedId: currentFeedId,
      feedName: currentFeedName
    };

    const newActions = [...swipeActions, action];
    setSwipeActions(newActions);
    saveToStorage(STORAGE_KEYS.SWIPE_ACTIONS, newActions);

    markAsRead(item.id);
    
    // Move to next article
    const unreadCount = getUnreadArticles().length;
    if (currentIndex < unreadCount - 1) {
      setCurrentIndex(currentIndex + 1);
    }

    // Show feedback
    toast({
      title: direction === 'right' ? "Article liked!" : "Article dismissed",
      description: direction === 'right' ? "Added to your favorites" : "Won't show similar content",
    });
  };

  // Handle bookmark action
  const handleBookmark = (item: NewsItem) => {
    const action: SwipeAction = {
      itemId: item.id,
      action: 'bookmark',
      timestamp: Date.now(),
      feedId: currentFeedId,
      feedName: currentFeedName
    };

    const newActions = [...swipeActions, action];
    setSwipeActions(newActions);
    saveToStorage(STORAGE_KEYS.SWIPE_ACTIONS, newActions);

    toast({
      title: "Article bookmarked!",
      description: "Saved for later reading",
    });
  };

  // Undo last action
  const undoLastAction = () => {
    if (swipeActions.length === 0) return false;

    const lastAction = swipeActions[swipeActions.length - 1];
    const newActions = swipeActions.slice(0, -1);
    setSwipeActions(newActions);
    saveToStorage(STORAGE_KEYS.SWIPE_ACTIONS, newActions);

    // Remove from read items if it was the last action
    const newReadItems = new Set(readItems);
    newReadItems.delete(lastAction.itemId);
    setReadItems(newReadItems);
    saveToStorage(STORAGE_KEYS.READ_ITEMS, Array.from(newReadItems));

    // Go back to previous article
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }

    toast({
      title: "Action undone",
      description: "Previous swipe action has been reversed",
    });

    return true;
  };

  // Get daily stats
  const getDailyStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActions = swipeActions.filter(action => {
      const actionDate = new Date(action.timestamp);
      actionDate.setHours(0, 0, 0, 0);
      return actionDate.getTime() === today.getTime();
    });

    return {
      todayRead: todayActions.length,
      todayLiked: todayActions.filter(a => a.action === 'like').length,
      todayBookmarked: todayActions.filter(a => a.action === 'bookmark').length,
      dailyGoal
    };
  };

  // Get filtered articles (unread)
  const getUnreadArticles = () => {
    return articles.filter(article => !readItems.has(article.id));
  };

  // Share article
  const shareArticle = async (item: NewsItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: item.link,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${item.title}\n\n${item.description}\n\n${item.link}`);
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Sharing failed",
          description: "Could not share this article",
          variant: "destructive",
        });
      }
    }
  };

  // Save article for later
  const saveForLater = (item: NewsItem) => {
    const newSavedItems = new Set(savedForLaterItems);
    newSavedItems.add(item.id);
    setSavedForLaterItems(newSavedItems);
    saveToStorage(STORAGE_KEYS.SAVED_FOR_LATER, Array.from(newSavedItems));

    toast({
      title: "Saved for later!",
      description: "Article saved to read later",
    });
  };

  // Get read articles
  const getReadArticles = () => {
    return allArticles.filter(article => readItems.has(article.id));
  };

  // Get saved for later articles  
  const getSavedForLaterArticles = () => {
    return allArticles.filter(article => savedForLaterItems.has(article.id) && !readItems.has(article.id));
  };

  // Change daily goal
  const changeDailyGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    localStorage.setItem(STORAGE_KEYS.DAILY_GOAL, newGoal.toString());
  };

  return {
    articles,
    allArticles,
    loading,
    loadingMessage,
    error,
    currentIndex,
    readItems,
    swipeActions,
    timeFilter,
    dailyGoal,
    unreadArticles: getUnreadArticles(),
    readArticles: getReadArticles(),
    savedForLaterArticles: getSavedForLaterArticles(),
    dailyStats: getDailyStats(),
    handleSwipe,
    handleBookmark,
    undoLastAction,
    shareArticle,
    markAsRead,
    saveForLater,
    setCurrentIndex,
    changeTimeFilter,
    changeDailyGoal,
    canUndo: swipeActions.length > 0 && currentIndex > 0,
    updateSwipeAction: (itemId: string, newAction: 'like' | 'dismiss' | 'bookmark') => {
      const existingActionIndex = swipeActions.findIndex(action => action.itemId === itemId);
      let updatedActions = [...swipeActions];
      
      if (existingActionIndex >= 0) {
        // Update existing action
        updatedActions[existingActionIndex] = {
          ...updatedActions[existingActionIndex],
          action: newAction,
          timestamp: Date.now(),
          feedId: currentFeedId,
          feedName: currentFeedName
        };
      } else {
        // Add new action
        updatedActions.push({
          itemId,
          action: newAction,
          timestamp: Date.now(),
          feedId: currentFeedId,
          feedName: currentFeedName
        });
      }
      
      setSwipeActions(updatedActions);
      saveToStorage(STORAGE_KEYS.SWIPE_ACTIONS, updatedActions);
      
      // Show feedback toast
      const actionText = newAction === 'like' ? 'liked' : newAction === 'dismiss' ? 'skipped' : 'bookmarked';
      toast({
        title: `Article ${actionText}!`,
        description: "Status updated successfully"
      });
    }
  };
};