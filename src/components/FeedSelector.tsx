import { ChevronDown, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Feed {
  id: string;
  name: string;
  description: string;
  rssUrl: string;
}

interface FeedSelectorProps {
  feeds: Feed[];
  currentFeed: string;
  onFeedChange: (feedId: string) => void;
  className?: string;
}

export const FeedSelector = ({ feeds, currentFeed, onFeedChange, className }: FeedSelectorProps) => {
  const selectedFeed = feeds.find(feed => feed.id === currentFeed);

  return (
    <Select value={currentFeed} onValueChange={onFeedChange}>
      <SelectTrigger className={cn("h-6 sm:h-8 border-2 border-border bg-background", className)}>
        <div className="flex items-center gap-1 sm:gap-2">
          <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-sans font-bold uppercase truncate">
            {selectedFeed?.name || 'Select Feed'}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="border-2 border-border bg-background z-50">
        {feeds.map((feed) => (
          <SelectItem key={feed.id} value={feed.id} className="font-sans">
            <div className="flex flex-col gap-1">
              <div className="font-bold uppercase text-xs">
                {feed.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {feed.description}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};