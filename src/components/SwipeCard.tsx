import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, X, ExternalLink, Share2, Volume2, Clock, Eye, Bookmark, BookmarkPlus, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
interface Author {
  link: string;
  name: string;
}
interface Category {
  name: string;
}
interface Source {
  url: string;
  title: string;
}
interface NewsItem {
  id: string;
  guid: string;
  title: string;
  description: string;
  content: string;
  link: string;
  date: string;
  author: Author[];
  category: Category[];
  source: Source;
}
interface SwipeCardProps {
  item: NewsItem;
  onSwipe: (direction: 'left' | 'right', item: NewsItem) => void;
  onShare: (item: NewsItem) => void;
  onSpeak: (text: string) => void;
  onSaveForLater?: (item: NewsItem) => void;
  'data-card-index'?: number;
  className?: string;
  style?: React.CSSProperties;
}
export const SwipeCard = ({
  item,
  onSwipe,
  onShare,
  onSpeak,
  onSaveForLater,
  'data-card-index': dataCardIndex,
  className,
  style
}: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({
    x: 0,
    y: 0
  });

  // Clip description for front view (mobile responsive)
  const getClippedDescription = () => {
    const maxLength = window.innerWidth < 640 ? 120 : 200; // Shorter on mobile
    return item.description.length > maxLength ? item.description.substring(0, maxLength) + '...' : item.description;
  };

  // Smoother typing animations
  const titleAnimation = useTypingAnimation({
    text: item.title,
    speed: 20,
    delay: 100
  });
  const descriptionAnimation = useTypingAnimation({
    text: getClippedDescription(),
    speed: 10,
    delay: titleAnimation.isComplete ? 200 : 1500
  });
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    if (diffMonths < 12) return `${diffMonths}mo ago`;
    return `${Math.floor(diffMonths / 12)}y ago`;
  };
  const isTwitterSource = item.source.title.toLowerCase() === 'twitter' || item.link.includes('x.com') || item.link.includes('twitter.com');
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFlipped) return;
    setIsDragging(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY
    };
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFlipped) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || isFlipped) return;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({
      x: deltaX,
      y: deltaY
    });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  };
  const handleEnd = () => {
    if (!isDragging || isFlipped) return;
    const threshold = 80; // Reduced threshold for easier swiping
    const {
      x
    } = dragOffset;
    if (Math.abs(x) > threshold) {
      const direction = x > 0 ? 'right' : 'left';
      onSwipe(direction, item);
    } else {
      // Bounce back to center with spring animation
      setDragOffset({
        x: 0,
        y: 0
      });
    }
    setIsDragging(false);
  };
  const handleCardClick = () => {
    if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
      setIsFlipped(!isFlipped);
    }
  };
  const getSwipeIndicator = () => {
    const {
      x
    } = dragOffset;
    const threshold = 80;
    const opacity = Math.min(Math.abs(x) / threshold, 1);
    if (x > 40) {
      return <div className="absolute inset-0 flex items-center justify-center bg-success/20 backdrop-blur-sm transition-all duration-200 border-2 border-success animate-pulse" style={{
        opacity
      }}>
          <div className="flex items-center gap-3 text-success font-bold text-xl animate-bounce">
            <Heart className="w-10 h-10 fill-current" />
            <span className="font-headline uppercase tracking-wide">LIKE</span>
          </div>
        </div>;
    } else if (x < -40) {
      return <div className="absolute inset-0 flex items-center justify-center bg-destructive/20 backdrop-blur-sm transition-all duration-200 border-2 border-destructive animate-pulse" style={{
        opacity
      }}>
          <div className="flex items-center gap-3 text-destructive font-bold text-xl animate-bounce">
            <X className="w-10 h-10 stroke-2" />
            <span className="font-headline uppercase tracking-wide">PASS</span>
          </div>
        </div>;
    }
    return null;
  };
  const rotation = dragOffset.x * 0.15;
  const scale = isDragging ? 0.98 : 1;
  const cardElevation = isDragging ? 16 : 0;
  const skew = dragOffset.x * 0.03;
  return <div ref={cardRef} data-card-index={dataCardIndex} className={cn("relative w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing", "transform-gpu transition-all duration-200", isDragging ? "transition-none z-50" : "transition-all duration-300 ease-out", className)} style={{
    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale}) skewX(${skew}deg)`,
    filter: `drop-shadow(0 ${cardElevation}px ${cardElevation * 1.5}px rgba(0,0,0,0.2))`,
    transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    willChange: 'transform, filter',
    ...style
  }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleEnd} onMouseLeave={handleEnd} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleEnd} onClick={handleCardClick}>
      <Card className={cn("h-[500px] sm:h-[600px] swipe-card overflow-hidden relative animate-fade-in", isDragging ? "dragging shadow-elevated border-4" : "hover:shadow-elevated transition-all duration-200", "bg-background border-2 border-foreground")}>
        {getSwipeIndicator()}
        
        <div className={cn("absolute inset-0 transition-transform duration-500 ease-out", isFlipped ? "transform rotateY-180" : "")}>
          {/* Front of card */}
          <div className={cn("absolute inset-0 p-4 sm:p-6 flex flex-col", isFlipped ? "opacity-0" : "opacity-100")}>
            {/* Header with source only */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-border">
              <div className="w-full" />
              <Badge variant="outline" className="text-xs font-sans font-bold uppercase border-2 border-border">
                {item.source.title}
              </Badge>
            </div>

            {/* Headline with typing animation */}
            <h2 className="font-headline text-lg sm:text-2xl font-bold text-foreground leading-tight mb-2 sm:mb-3 line-clamp-4 sm:line-clamp-3 headline-hover p-2 -m-2 transition-colors duration-150 min-h-[3rem] sm:min-h-[4rem]">
              {titleAnimation.displayedText}
              {!titleAnimation.isComplete && <span className="animate-pulse">|</span>}
            </h2>

            {/* Time ago under headline */}
            <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm font-sans uppercase tracking-wide mb-3 sm:mb-4">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              {formatTimeAgo(item.date)}
            </div>

            {/* Lead paragraph with typing animation */}
            <p className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-1 line-clamp-6 sm:line-clamp-6 min-h-[6rem]">
              {descriptionAnimation.displayedText}
              {titleAnimation.isComplete && !descriptionAnimation.isComplete && <span className="animate-pulse">|</span>}
            </p>


            {/* Byline */}
            {item.author.length > 0 && <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 font-sans uppercase tracking-wide border-t border-border pt-2">
                <span>BY </span>
                {item.author.map((author, index) => <span key={index}>
                    {isTwitterSource ? <button onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                // Try to extract Twitter handle from author name or create search URL
                const twitterHandle = author.name.replace('@', '');
                const twitterUrl = author.name.startsWith('@') ? `https://twitter.com/${twitterHandle}` : `https://twitter.com/search?q=${encodeURIComponent(author.name)}`;
                window.open(twitterUrl, '_blank');
              }} className="hover:text-foreground transition-colors underline cursor-pointer">
                        {author.name}
                      </button> : <span>{author.name}</span>}
                    {index < item.author.length - 1 && ', '}
                  </span>)}
              </div>}

            {/* Action buttons - newspaper style */}
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3 relative z-40 pointer-events-auto">
              <Button variant="newspaper" size="sm" onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              onSpeak(item.title + '. ' + getClippedDescription());
            }} className="flex items-center gap-1 text-xs flex-1 max-w-20 sm:max-w-24 pointer-events-auto">
                <Volume2 className="w-3 h-3" />
                <span className="hidden sm:inline">LISTEN</span>
              </Button>
              
              <div className="flex gap-1 pointer-events-auto">
                {onSaveForLater && <Button variant="newspaper" size="sm" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onSaveForLater(item);
              }} className="px-2 sm:px-3 pointer-events-auto" title="Save for later">
                    <BookmarkPlus className="w-3 h-3" />
                  </Button>}
                
                <Button variant="newspaper" size="sm" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setIsFlipped(!isFlipped);
              }} className="px-2 sm:px-3 pointer-events-auto" title="Read full article">
                  <Eye className="w-3 h-3" />
                </Button>
                
                <Button variant="newspaper" size="sm" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.open(item.link, '_blank');
              }} className="px-2 sm:px-3 pointer-events-auto" title="Open original">
                  <ExternalLink className="w-3 h-3" />
                </Button>
                
                <Button variant="newspaper" size="sm" onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onShare(item);
              }} className="px-2 sm:px-3 pointer-events-auto" title="Share article">
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Back of card - Full article view */}
          <div className={cn("absolute inset-0 p-4 sm:p-6 transform rotateY-180 bg-background", isFlipped ? "opacity-100" : "opacity-0")}>
            <div className="h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-border">
                <h3 className="font-headline text-base sm:text-lg font-bold text-foreground uppercase tracking-wide">
                  FULL STORY
                </h3>
                <div className="flex gap-1">
                  {isTwitterSource && <Button variant="newspaper" size="sm" onClick={e => {
                  e.stopPropagation();
                  window.open(item.link, '_blank');
                }} className="px-2" title="Open on Twitter/X">
                      <Twitter className="w-3 h-3" />
                    </Button>}
                  
                  <Button variant="newspaper" size="sm" onClick={e => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }} className="px-2">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Tags section on back */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 pb-2 border-b border-border">
                {item.category.map((cat, index) => <Badge key={index} variant="outline" className="text-xs font-sans font-medium border-2 border-border uppercase">
                    {cat.name}
                  </Badge>)}
              </div>
              
              <div className="space-y-4">
                {/* Author/Tweet info */}
                {item.author.length > 0 && <div className="bg-accent/10 p-3 rounded border border-border">
                    <h4 className="font-headline text-sm font-bold uppercase tracking-wide mb-2">
                      {isTwitterSource ? 'TWEETED BY' : 'SUBMITTED BY'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.author.map((author, index) => <div key={index} className="text-sm">
                          {isTwitterSource ? <button onClick={e => {
                      e.stopPropagation();
                      const twitterHandle = author.name.replace('@', '');
                      const twitterUrl = author.name.startsWith('@') ? `https://twitter.com/${twitterHandle}` : `https://twitter.com/search?q=${encodeURIComponent(author.name)}`;
                      window.open(twitterUrl, '_blank');
                    }} className="font-medium hover:text-primary transition-colors underline cursor-pointer">
                              {author.name}
                            </button> : <span className="font-medium">{author.name}</span>}
                          {author.link && !isTwitterSource && <Button variant="link" size="sm" onClick={e => {
                      e.stopPropagation();
                      window.open(author.link, '_blank');
                    }} className="p-0 h-auto ml-2 text-xs">
                              View Profile
                            </Button>}
                        </div>)}
                    </div>
                  </div>}
                
                <div className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.content || item.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>;
};