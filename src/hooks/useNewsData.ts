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

interface SwipeAction {
  itemId: string;
  action: 'like' | 'dismiss' | 'bookmark';
  timestamp: number;
}

const RSS_API_URL = 'https://grants-rss.up.railway.app/api/items';
const STORAGE_KEYS = {
  READ_ITEMS: 'read_mode_read_items',
  SWIPE_ACTIONS: 'read_mode_swipe_actions',
  DAILY_STATS: 'read_mode_daily_stats',
  FILTERS: 'read_mode_filters'
};

export const useNewsData = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());
  const [swipeActions, setSwipeActions] = useState<SwipeAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedReadItems = localStorage.getItem(STORAGE_KEYS.READ_ITEMS);
    const savedSwipeActions = localStorage.getItem(STORAGE_KEYS.SWIPE_ACTIONS);

    if (savedReadItems) {
      setReadItems(new Set(JSON.parse(savedReadItems)));
    }

    if (savedSwipeActions) {
      setSwipeActions(JSON.parse(savedSwipeActions));
    }
  }, []);

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
        
        // Filter articles from the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const recentArticles = data.filter((article: NewsItem) => {
          const articleDate = new Date(article.date);
          return articleDate > yesterday;
        });

        // Sort by date (newest first)
        recentArticles.sort((a: NewsItem, b: NewsItem) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setArticles(recentArticles);
        
        if (recentArticles.length === 0) {
          toast({
            title: "No recent articles",
            description: "No articles found from the last 24 hours.",
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
  }, [toast]);

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
    if (currentIndex < articles.length - 1) {
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

  return {
    articles,
    loading,
    error,
    currentIndex,
    readItems,
    swipeActions,
    unreadArticles: getUnreadArticles(),
    dailyStats: getDailyStats(),
    handleSwipe,
    handleBookmark,
    undoLastAction,
    shareArticle,
    markAsRead,
    setCurrentIndex,
    canUndo: swipeActions.length > 0 && currentIndex > 0
  };
};