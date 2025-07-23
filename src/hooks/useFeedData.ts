import { useState, useEffect } from 'react';
import { Feed } from '@/components/FeedSelector';

const STORAGE_KEY = 'selected_feed';
const DEFAULT_FEED = 'crypto-grants';

export const useFeedData = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [currentFeed, setCurrentFeed] = useState<string>(DEFAULT_FEED);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load feeds from JSON file
  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const response = await fetch('/data/feeds.json');
        if (!response.ok) {
          throw new Error('Failed to load feeds configuration');
        }
        const data = await response.json();
        setFeeds(data.feeds);
      } catch (err) {
        console.error('Failed to load feeds:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feeds');
      } finally {
        setLoading(false);
      }
    };

    loadFeeds();
  }, []);

  // Load selected feed from localStorage
  useEffect(() => {
    const savedFeed = localStorage.getItem(STORAGE_KEY);
    if (savedFeed) {
      setCurrentFeed(savedFeed);
    }
  }, []);

  // Change feed
  const changeFeed = (feedId: string) => {
    setCurrentFeed(feedId);
    localStorage.setItem(STORAGE_KEY, feedId);
  };

  // Get current feed URL
  const getCurrentFeedUrl = () => {
    const feed = feeds.find(f => f.id === currentFeed);
    return feed?.rssUrl || feeds[0]?.rssUrl || '';
  };

  // Get current feed info
  const getCurrentFeed = () => {
    return feeds.find(f => f.id === currentFeed) || feeds[0];
  };

  return {
    feeds,
    currentFeed,
    changeFeed,
    getCurrentFeedUrl,
    getCurrentFeed,
    loading,
    error
  };
};