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
}

export type TimeFilter = 'day' | 'week' | 'month' | 'before' | 'all' | 'demo';

const RSS_API_URL = 'https://grants-rss.up.railway.app/api/items';
const STORAGE_KEYS = {
  READ_ITEMS: 'read_mode_read_items',
  SWIPE_ACTIONS: 'read_mode_swipe_actions',
  DAILY_STATS: 'read_mode_daily_stats',
  FILTERS: 'read_mode_filters',
  TIME_FILTER: 'read_mode_time_filter',
  SAVED_FOR_LATER: 'read_mode_saved_for_later'
};

export const useNewsData = (initialTimeFilter: TimeFilter = 'day') => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [allArticles, setAllArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [swipeActions, setSwipeActions] = useState<SwipeAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(initialTimeFilter);
  const [savedForLaterItems, setSavedForLaterItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedReadItems = localStorage.getItem(STORAGE_KEYS.READ_ITEMS);
    const savedSwipeActions = localStorage.getItem(STORAGE_KEYS.SWIPE_ACTIONS);
    const savedTimeFilter = localStorage.getItem(STORAGE_KEYS.TIME_FILTER);
    const savedForLaterItems = localStorage.getItem(STORAGE_KEYS.SAVED_FOR_LATER);

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

  // Fetch articles from RSS API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(RSS_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Sort by date (newest first)
        const sortedArticles = data.sort((a: NewsItem, b: NewsItem) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAllArticles(sortedArticles);

        // Apply initial time filter
        const filteredArticles = filterArticlesByTime(sortedArticles, timeFilter);
        setArticles(filteredArticles);
        
        // Reset current index when filter changes
        setCurrentIndex(0);

        // Check if we need to suggest alternative filters
        if (filteredArticles.length === 0) {
          if (timeFilter === 'day') {
            const weekArticles = filterArticlesByTime(sortedArticles, 'week');
            if (weekArticles.length > 0) {
              toast({
                title: "No articles today",
                description: `Found ${weekArticles.length} articles from this week. Try switching to week view in settings.`,
              });
            } else if (sortedArticles.length > 0) {
              toast({
                title: "No recent articles",
                description: `Found ${sortedArticles.length} older articles. Try demo mode to explore them.`,
              });
            }
          } else if (timeFilter === 'week') {
            if (sortedArticles.length > 0) {
              toast({
                title: "No articles this week",
                description: `Found ${sortedArticles.length} older articles. Try demo mode to explore them.`,
              });
            }
          }
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
  }, [toast, timeFilter]);

  // Change time filter
  const changeTimeFilter = (newFilter: TimeFilter) => {
    setTimeFilter(newFilter);
    localStorage.setItem(STORAGE_KEYS.TIME_FILTER, newFilter);
    
    const filteredArticles = filterArticlesByTime(allArticles, newFilter);
    setArticles(filteredArticles);
    setCurrentIndex(0);

    let description = '';
    switch (newFilter) {
      case 'day':
        description = 'Showing articles from the last 24 hours';
        break;
      case 'week':
        description = 'Showing articles from the last 7 days';
        break;
      case 'all':
        description = 'Showing all available articles';
        break;
      case 'demo':
        description = 'Demo mode: explore past articles';
        break;
    }

    toast({
      title: `Switched to ${newFilter} view`,
      description: `${description} (${filteredArticles.length} articles)`,
    });
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
      timestamp: Date.now()
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
      timestamp: Date.now()
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
      dailyGoal: 20 // This could be configurable
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

  return {
    articles,
    allArticles,
    loading,
    error,
    currentIndex,
    readItems,
    swipeActions,
    timeFilter,
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
    canUndo: swipeActions.length > 0 && currentIndex > 0,
    updateSwipeAction: (itemId: string, newAction: 'like' | 'dismiss' | 'bookmark') => {
      const existingActionIndex = swipeActions.findIndex(action => action.itemId === itemId);
      let updatedActions = [...swipeActions];
      
      if (existingActionIndex >= 0) {
        // Update existing action
        updatedActions[existingActionIndex] = {
          ...updatedActions[existingActionIndex],
          action: newAction,
          timestamp: Date.now()
        };
      } else {
        // Add new action
        updatedActions.push({
          itemId,
          action: newAction,
          timestamp: Date.now()
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