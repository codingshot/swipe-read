import { useState } from 'react';
import { Share2, Twitter, Facebook, Copy, Check, Linkedin, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  currentArticle?: {
    id: string;
    title: string;
    description: string;
    link: string;
  };
  className?: string;
}

export const ShareButton = ({ currentArticle, className }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!currentArticle) return null;

  // Create article page URL
  const articleUrl = `${window.location.origin}/article/${currentArticle.id}`;
  const shareText = `Check out this article: ${currentArticle.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Article link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(facebookUrl, '_blank', 'width=555,height=398');
    setIsOpen(false);
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleInstagramShare = () => {
    // Instagram doesn't support direct URL sharing via web, so we'll copy the link and suggest manual posting
    handleCopyLink();
    toast({
      title: "Link copied for Instagram!",
      description: "Paste this link in your Instagram story or post",
    });
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentArticle.title,
          text: currentArticle.description,
          url: articleUrl,
        });
        setIsOpen(false);
      } catch (err) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="newspaper"
          size="sm"
          className={cn("h-8 w-8 sm:h-10 sm:w-10 p-0", className)}
          title="Share article"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-2 border-border bg-background z-50" align="start">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-sans font-bold uppercase tracking-wide">
              Share Article
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Article preview */}
            <div className="p-3 bg-accent/20 rounded border border-border">
              <div className="font-bold text-xs mb-1 line-clamp-2">
                {currentArticle.title}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {currentArticle.description}
              </div>
            </div>

            {/* Copy link */}
            <div className="space-y-2">
              <div className="text-xs font-sans font-bold uppercase">Copy Link</div>
              <div className="flex gap-2">
                <Input
                  value={articleUrl}
                  readOnly
                  className="text-xs border-2 border-border"
                />
                <Button
                  variant="newspaper"
                  size="sm"
                  onClick={handleCopyLink}
                  className="px-3"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Social sharing buttons */}
            <div className="space-y-2">
              <div className="text-xs font-sans font-bold uppercase">Share On</div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTwitterShare}
                  className="flex items-center gap-2 text-xs border-2 border-border"
                >
                  <Twitter className="w-3 h-3" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFacebookShare}
                  className="flex items-center gap-2 text-xs border-2 border-border"
                >
                  <Facebook className="w-3 h-3" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLinkedInShare}
                  className="flex items-center gap-2 text-xs border-2 border-border"
                >
                  <Linkedin className="w-3 h-3" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstagramShare}
                  className="flex items-center gap-2 text-xs border-2 border-border"
                >
                  <Instagram className="w-3 h-3" />
                  Instagram
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};