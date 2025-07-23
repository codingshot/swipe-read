import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface Feed {
  id: string;
  name: string;
  description: string;
  rssUrl: string;
}

interface MultiFeedSelectorProps {
  feeds: Feed[];
  selectedFeeds: string[];
  onFeedChange: (feedIds: string[]) => void;
  className?: string;
}

const truncateMiddle = (text: string, maxLength: number = 20) => {
  if (text.length <= maxLength) return text;
  const start = Math.ceil((maxLength - 3) / 2);
  const end = Math.floor((maxLength - 3) / 2);
  return text.slice(0, start) + '...' + text.slice(-end);
};

export const MultiFeedSelector = ({ feeds, selectedFeeds, onFeedChange, className }: MultiFeedSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingFeeds, setPendingFeeds] = useState<string[]>(selectedFeeds);
  
  // Update pending feeds when selectedFeeds prop changes
  useEffect(() => {
    setPendingFeeds(selectedFeeds);
  }, [selectedFeeds]);
  
  const selectedFeedsData = feeds.filter(feed => selectedFeeds.includes(feed.id));
  const pendingFeedsData = feeds.filter(feed => pendingFeeds.includes(feed.id));
  const allSelected = pendingFeeds.length === feeds.length;
  const noneSelected = pendingFeeds.length === 0;
  const hasChanges = JSON.stringify(pendingFeeds.sort()) !== JSON.stringify(selectedFeeds.sort());

  const handleFeedToggle = (feedId: string) => {
    const newPending = pendingFeeds.includes(feedId)
      ? pendingFeeds.filter(id => id !== feedId)
      : [...pendingFeeds, feedId];
    setPendingFeeds(newPending);
  };

  const handleSelectAll = () => {
    setPendingFeeds(allSelected ? [] : feeds.map(f => f.id));
  };

  const handleLoadFeeds = () => {
    if (pendingFeeds.length > 0) {
      onFeedChange(pendingFeeds);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setPendingFeeds(selectedFeeds);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedFeeds.length === 0) return 'Select Feeds';
    if (selectedFeeds.length === 1) {
      return truncateMiddle(selectedFeedsData[0].name, 16);
    }
    if (selectedFeeds.length === feeds.length) {
      return 'All Feeds';
    }
    return `${selectedFeeds.length} Feeds`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-6 sm:h-8 border-2 border-border bg-background justify-start text-left", className)}
        >
          <div className="flex items-center gap-1 sm:gap-2 w-full">
            <span className="text-xs sm:text-sm font-sans font-bold uppercase truncate flex-1">
              {getDisplayText()}
            </span>
            {selectedFeeds.length > 1 && (
              <Badge variant="outline" className="text-xs h-4 px-1 border-border">
                {selectedFeeds.length}
              </Badge>
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-2 border-border bg-background z-50 p-0">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-sans font-bold uppercase text-sm">Select News Feeds</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="h-6 px-2 text-xs"
            >
              {allSelected ? 'Clear All' : 'Select All'}
            </Button>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          {feeds.map((feed) => {
            const isSelected = pendingFeeds.includes(feed.id);
            return (
              <div
                key={feed.id}
                className="flex items-start space-x-3 p-3 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border/50 last:border-b-0"
                onClick={() => handleFeedToggle(feed.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleFeedToggle(feed.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="font-bold uppercase text-xs mb-1">
                    {feed.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {feed.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="p-3 border-t border-border bg-accent/10">
          <div className="flex gap-2">
            <Button
              onClick={handleLoadFeeds}
              disabled={pendingFeeds.length === 0}
              className="flex-1 h-8 text-xs font-bold uppercase"
              variant={hasChanges ? "default" : "outline"}
            >
              Load Feeds ({pendingFeeds.length})
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="h-8 px-3 text-xs font-bold uppercase"
            >
              Cancel
            </Button>
          </div>
          
          {hasChanges && (
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Click "Load Feeds" to apply changes
            </div>
          )}
        </div>

        {/* Currently active feeds */}
        {selectedFeedsData.length > 0 && (
          <div className="p-3 border-t border-border bg-accent/20">
            <div className="text-xs font-sans font-bold uppercase mb-2">
              Currently Loaded ({selectedFeeds.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedFeedsData.map((feed) => (
                <Badge
                  key={feed.id}
                  variant="outline"
                  className="text-xs border-border bg-background"
                >
                  {truncateMiddle(feed.name, 12)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};