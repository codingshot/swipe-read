import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FeedSelector, Feed } from './FeedSelector';
import { TimeFilter } from '@/hooks/useNewsData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar, Filter, Zap, Globe, Target, Bell } from 'lucide-react';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  feeds: Feed[];
  currentFeed: string;
  onFeedChange: (feedId: string) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (filter: TimeFilter) => void;
  dailyGoal: number;
  onDailyGoalChange: (goal: number) => void;
}

export const SettingsPopup = ({
  isOpen,
  onClose,
  feeds,
  currentFeed,
  onFeedChange,
  timeFilter,
  onTimeFilterChange,
  dailyGoal,
  onDailyGoalChange
}: SettingsPopupProps) => {
  const getFilterIcon = (filter: TimeFilter) => {
    switch (filter) {
      case 'day': return <Clock className="w-4 h-4" />;
      case 'week': return <Calendar className="w-4 h-4" />;
      case 'month': return <Calendar className="w-4 h-4" />;
      case 'before': return <Filter className="w-4 h-4" />;
      case 'demo': return <Zap className="w-4 h-4" />;
      default: return <Filter className="w-4 h-4" />;
    }
  };

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'before': return 'Older Articles';
      case 'all': return 'All Time';
      case 'demo': return 'Demo Mode';
      default: return filter;
    }
  };

  const selectedFeed = feeds.find(feed => feed.id === currentFeed);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-2 border-border">
        <DialogHeader>
          <DialogTitle className="font-headline text-lg font-bold uppercase tracking-wider">
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Feed Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <h3 className="font-headline text-sm font-bold uppercase tracking-wide">
                News Feed
              </h3>
            </div>
            <FeedSelector
              feeds={feeds}
              currentFeed={currentFeed}
              onFeedChange={onFeedChange}
              className="w-full"
            />
            {selectedFeed && (
              <p className="text-xs text-muted-foreground">
                {selectedFeed.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Time Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <h3 className="font-headline text-sm font-bold uppercase tracking-wide">
                Time Filter
              </h3>
            </div>
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger className="w-full border-2 border-border">
                <div className="flex items-center gap-2">
                  {getFilterIcon(timeFilter)}
                  <span className="font-sans font-bold uppercase text-sm">
                    {getFilterLabel(timeFilter)}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="border-2 border-border bg-background z-50">
                <SelectItem value="day" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <div>
                      <div className="font-bold">TODAY</div>
                      <div className="text-xs text-muted-foreground">Last 24 hours</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="week" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="font-bold">THIS WEEK</div>
                      <div className="text-xs text-muted-foreground">Last 7 days</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="month" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <div className="font-bold">THIS MONTH</div>
                      <div className="text-xs text-muted-foreground">Last 30 days</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="before" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <div>
                      <div className="font-bold">OLDER</div>
                      <div className="text-xs text-muted-foreground">Before 30 days</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="all" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <div>
                      <div className="font-bold">ALL TIME</div>
                      <div className="text-xs text-muted-foreground">Every article</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="demo" className="font-sans">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <div>
                      <div className="font-bold">DEMO MODE</div>
                      <div className="text-xs text-muted-foreground">Explore past articles</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Daily Goal */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <h3 className="font-headline text-sm font-bold uppercase tracking-wide">
                Daily Goal
              </h3>
            </div>
            <Select value={dailyGoal.toString()} onValueChange={(value) => onDailyGoalChange(parseInt(value))}>
              <SelectTrigger className="w-full border-2 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-2 border-border bg-background z-50">
                {[5, 10, 15, 20, 25, 30, 50].map((goal) => (
                  <SelectItem key={goal} value={goal.toString()} className="font-sans">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span className="font-bold">{goal} ARTICLES</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Set your daily reading goal
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="newspaper" onClick={onClose}>
            Close Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};