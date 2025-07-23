import { useState, useEffect } from 'react';
import { Feed } from '@/components/FeedSelector';

const STORAGE_KEY = 'selected_feeds'; // Changed to plural
const DEFAULT_FEEDS = ['crypto-grants']; // Changed to array

export const useFeedData = () => {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>(DEFAULT_FEEDS);
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

  // Load selected feeds from localStorage and URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const feedsFromUrl = urlParams.get('feeds');
    
    if (feedsFromUrl) {
      const feedIds = feedsFromUrl.split(',').filter(id => feeds.some(f => f.id === id));
      if (feedIds.length > 0) {
        setSelectedFeeds(feedIds);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(feedIds));
        return;
      }
    }

    const savedFeeds = localStorage.getItem(STORAGE_KEY);
    if (savedFeeds) {
      try {
        const parsedFeeds = JSON.parse(savedFeeds);
        if (Array.isArray(parsedFeeds) && parsedFeeds.length > 0) {
          setSelectedFeeds(parsedFeeds);
        }
      } catch (e) {
        // Fallback for old single feed format
        setSelectedFeeds([savedFeeds]);
      }
    }
  }, [feeds]);

  // Update URL params when feeds change
  useEffect(() => {
    if (selectedFeeds.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set('feeds', selectedFeeds.join(','));
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [selectedFeeds]);

  // Change feeds
  const changeFeeds = (feedIds: string[]) => {
    setSelectedFeeds(feedIds);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedIds));
  };

  // Get selected feed URLs
  const getSelectedFeedUrls = () => {
    return feeds.filter(f => selectedFeeds.includes(f.id)).map(f => f.rssUrl);
  };

  // Get selected feed info
  const getSelectedFeeds = () => {
    return feeds.filter(f => selectedFeeds.includes(f.id));
  };

  // Backward compatibility - get current feed (first selected)
  const getCurrentFeed = () => {
    return feeds.find(f => f.id === selectedFeeds[0]) || feeds[0];
  };

  const getCurrentFeedUrl = () => {
    const feed = getCurrentFeed();
    return feed?.rssUrl || '';
  };

  return {
    feeds,
    selectedFeeds,
    currentFeed: selectedFeeds[0] || DEFAULT_FEEDS[0], // Backward compatibility
    changeFeeds,
    changeFeed: (feedId: string) => changeFeeds([feedId]), // Backward compatibility
    getSelectedFeedUrls,
    getSelectedFeeds,
    getCurrentFeedUrl,
    getCurrentFeed,
    loading,
    error
  };
};