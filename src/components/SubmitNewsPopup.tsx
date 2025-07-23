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
      return hostname === 'x.com' || 
             hostname === 'www.x.com' || 
             hostname === 'twitter.com' || 
             hostname === 'www.twitter.com';
    } catch {
      return false;
    }
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
              className="border-2 border-border"
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid X.com or Twitter.com URL to reply to
            </p>
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