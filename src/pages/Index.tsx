import { useState, useEffect } from 'react';
import { ReadMode } from '@/components/ReadMode';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useFeedData } from '@/hooks/useFeedData';
import { useSEO } from '@/hooks/useSEO';

const ONBOARDING_KEY = 'onboarding_completed';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { feeds, loading } = useFeedData();

  // Set SEO for home page
  useSEO({
    title: "ReadMode - by Curate.Fun | News Made Fun",
    description: "News made fun! Swipe to read articles in an engaging, newspaper-style interface. Discover, like, and save stories from your favorite RSS feeds.",
    keywords: ["news", "reading", "swipe", "articles", "curate", "fun", "daily news", "newspaper", "RSS feeds", "social media"]
  });

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingCompleted && feeds.length > 0) {
      setShowOnboarding(true);
    }
  }, [feeds]);

  const handleOnboardingComplete = (selectedFeeds: string[], readingFrequency: string) => {
    // Store selected feeds and reading frequency
    localStorage.setItem('selected_feeds', JSON.stringify(selectedFeeds));
    localStorage.setItem('reading_frequency', readingFrequency);
    localStorage.setItem(ONBOARDING_KEY, 'true');
    
    // Set first selected feed as current
    if (selectedFeeds.length > 0) {
      localStorage.setItem('selected_feed', selectedFeeds[0]);
    }
    
    setShowOnboarding(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow 
        feeds={feeds} 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return <ReadMode />;
};

export default Index;
