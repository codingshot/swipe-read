import { useState, useEffect } from 'react';
import { ReadMode } from '@/components/ReadMode';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useFeedData } from '@/hooks/useFeedData';

const ONBOARDING_KEY = 'onboarding_completed';

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { feeds, loading } = useFeedData();

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
