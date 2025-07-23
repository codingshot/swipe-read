import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, ExternalLink } from 'lucide-react';
import { useFeedData } from '@/hooks/useFeedData';
import { useToast } from '@/hooks/use-toast';

interface SubmitNewsPopupProps {
  children: React.ReactNode;
}

export const SubmitNewsPopup = ({ children }: SubmitNewsPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const { feeds } = useFeedData();
  const { toast } = useToast();

  const validateUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      const hostname = url.hostname.toLowerCase();
      const isValidDomain = hostname === 'x.com' || 
                           hostname === 'www.x.com' || 
                           hostname === 'twitter.com' || 
                           hostname === 'www.twitter.com';
      
      // Check if it's a status URL with a tweet ID
      const pathParts = url.pathname.split('/');
      const hasStatus = pathParts.includes('status') && pathParts[pathParts.indexOf('status') + 1];
      
      return isValidDomain && hasStatus;
    } catch {
      return false;
    }
  };

  const extractTweetId = (urlString: string) => {
    try {
      const url = new URL(urlString);
      const pathParts = url.pathname.split('/');
      const statusIndex = pathParts.indexOf('status');
      if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
        return pathParts[statusIndex + 1].split('?')[0]; // Remove query params
      }
    } catch {
      return null;
    }
    return null;
  };

  const handleSubmit = () => {
    if (!selectedFeed) {
      toast({
        title: "Feed Required",
        description: "Please select a feed to submit to.",
        variant: "destructive"
      });
      return;
    }

    if (!url) {
      toast({
        title: "URL Required", 
        description: "Please enter a valid X.com or Twitter.com URL.",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid X.com or Twitter.com URL.",
        variant: "destructive"
      });
      return;
    }

    // Create tweet intent
    const tweetText = `!submit @curatedotfun #${selectedFeed}${note ? ` ${note}` : ''}`;
    const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&in_reply_to=${encodeURIComponent(url)}`;
    
    // Open tweet intent in new window
    window.open(tweetIntent, '_blank', 'width=550,height=420');
    
    // Reset form and close popup
    setSelectedFeed('');
    setUrl('');
    setNote('');
    setIsOpen(false);
    
    toast({
      title: "Tweet Intent Created",
      description: "Your submission tweet has been opened in a new window.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2 border-border bg-background">
        <DialogHeader>
          <DialogTitle className="font-headline text-lg font-bold uppercase tracking-wide flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit News
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feed-select" className="font-sans font-bold text-sm uppercase tracking-wide">
              Select Feed
            </Label>
            <Select value={selectedFeed} onValueChange={setSelectedFeed}>
              <SelectTrigger id="feed-select" className="border-2 border-border">
                <SelectValue placeholder="Choose a feed" />
              </SelectTrigger>
              <SelectContent className="border-2 border-border bg-background">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="url-input" className="font-sans font-bold text-sm uppercase tracking-wide">
              X.com / Twitter.com URL
            </Label>
            <Input
              id="url-input"
              type="url"
              placeholder="https://x.com/username/status/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`border-2 ${validateUrl(url) && url ? 'border-green-500' : 'border-border'}`}
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid X.com or Twitter.com URL to reply to
            </p>
            
            {/* Tweet Preview */}
            {url && validateUrl(url) && (
              <div className="mt-3 p-3 border-2 border-border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-sans font-bold uppercase tracking-wide text-green-700">
                    Valid Tweet URL
                  </span>
                </div>
                <div className="space-y-2">
                  <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 transition-colors underline break-all"
                  >
                    {url}
                  </a>
                  <div className="text-xs text-muted-foreground">
                    Tweet ID: {extractTweetId(url)}
                  </div>
                </div>
                
                {/* Simple Tweet Embed Placeholder */}
                <div className="mt-3 p-3 border border-border/50 rounded bg-background/50">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-1">
                        <div className="h-3 bg-muted rounded w-16"></div>
                        <div className="h-3 bg-muted/60 rounded w-12"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-3 bg-muted/80 rounded w-full"></div>
                        <div className="h-3 bg-muted/80 rounded w-3/4"></div>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <div className="h-2 bg-muted/60 rounded w-8"></div>
                        <div className="h-2 bg-muted/60 rounded w-8"></div>
                        <div className="h-2 bg-muted/60 rounded w-8"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    Tweet Preview (ID: {extractTweetId(url)})
                  </div>
                </div>
              </div>
            )}
            
            {url && !validateUrl(url) && (
              <div className="mt-2 p-2 border-2 border-red-500 rounded-md bg-red-50 dark:bg-red-950/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-sans font-bold uppercase tracking-wide text-red-700 dark:text-red-400">
                    Invalid URL
                  </span>
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Please enter a valid tweet URL (must include /status/)
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-input" className="font-sans font-bold text-sm uppercase tracking-wide">
              Note (Optional)
            </Label>
            <Textarea
              id="note-input"
              placeholder="Add additional context or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="border-2 border-border min-h-[80px]"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {note.length}/200 characters
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Create Tweet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};