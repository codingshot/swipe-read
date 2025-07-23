import { useState } from 'react';
import { Check, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Feed } from '@/components/FeedSelector';

interface OnboardingFlowProps {
  feeds: Feed[];
  onComplete: (selectedFeeds: string[], readingFrequency: string) => void;
}

export const OnboardingFlow = ({ feeds, onComplete }: OnboardingFlowProps) => {
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [readingFrequency, setReadingFrequency] = useState<string>('');
  const [step, setStep] = useState(1);

  const handleFeedToggle = (feedId: string) => {
    setSelectedFeeds(prev => 
      prev.includes(feedId) 
        ? prev.filter(id => id !== feedId)
        : [...prev, feedId]
    );
  };

  const handleNext = () => {
    if (step === 1 && selectedFeeds.length > 0) {
      setStep(2);
    } else if (step === 2 && readingFrequency) {
      onComplete(selectedFeeds, readingFrequency);
    }
  };

  const canProceed = step === 1 ? selectedFeeds.length > 0 : readingFrequency !== '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to News Reader!</CardTitle>
          <CardDescription>
            Let's personalize your news experience
          </CardDescription>
          <div className="flex justify-center gap-2 mt-4">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Choose Your Interests</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Select the news feeds you'd like to follow. You can always change these later.
              </p>
              
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {feeds.map((feed) => (
                  <div key={feed.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <Checkbox
                      id={feed.id}
                      checked={selectedFeeds.includes(feed.id)}
                      onCheckedChange={() => handleFeedToggle(feed.id)}
                      className="mt-0.5"
                    />
                    <label htmlFor={feed.id} className="flex-1 cursor-pointer">
                      <div className="font-medium text-sm">{feed.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{feed.description}</div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                Selected: {selectedFeeds.length} feed{selectedFeeds.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Reading Frequency</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                How often would you like to read news?
              </p>
              
              <Select value={readingFrequency} onValueChange={setReadingFrequency}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your reading frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily - Stay updated every day</SelectItem>
                  <SelectItem value="weekly">Weekly - Weekly digest</SelectItem>
                  <SelectItem value="monthly">Monthly - Monthly roundup</SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-accent/20 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Your Selection Summary</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Feeds: {selectedFeeds.length} selected</div>
                  <div className="text-xs">
                    {feeds.filter(f => selectedFeeds.includes(f.id)).map(f => f.name).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step === 2 && (
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              disabled={!canProceed}
              className="ml-auto"
            >
              {step === 1 ? 'Next' : (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Get Started
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};