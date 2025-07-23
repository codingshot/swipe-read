import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, X, ExternalLink, Share2, Volume2, Clock, Eye, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className?: string;
  style?: React.CSSProperties;
}

export const SwipeCard = ({ 
  item, 
  onSwipe, 
  onShare, 
  onSpeak, 
  className, 
  style 
}: SwipeCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFlipped) return;
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFlipped) return;
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || isFlipped) return;
    
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
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
    
    const threshold = 100;
    const { x } = dragOffset;
    
    if (Math.abs(x) > threshold) {
      const direction = x > 0 ? 'right' : 'left';
      onSwipe(direction, item);
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleCardClick = () => {
    if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
      setIsFlipped(!isFlipped);
    }
  };

  const getSwipeIndicator = () => {
    const { x } = dragOffset;
    const threshold = 100;
    const opacity = Math.min(Math.abs(x) / threshold, 1);
    
    if (x > 50) {
      return (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-like/20 rounded-xl transition-opacity duration-200"
          style={{ opacity }}
        >
          <div className="flex items-center gap-2 text-success font-bold text-xl">
            <Heart className="w-8 h-8" />
            LIKE
          </div>
        </div>
      );
    } else if (x < -50) {
      return (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gradient-dismiss/20 rounded-xl transition-opacity duration-200"
          style={{ opacity }}
        >
          <div className="flex items-center gap-2 text-destructive font-bold text-xl">
            <X className="w-8 h-8" />
            PASS
          </div>
        </div>
      );
    }
    return null;
  };

  const rotation = dragOffset.x * 0.1;
  const scale = isDragging ? 0.95 : 1;

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing",
        "transform-gpu transition-transform duration-200",
        isDragging ? "transition-none" : "",
        className
      )}
      style={{
        transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg) scale(${scale})`,
        ...style
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleEnd}
      onClick={handleCardClick}
    >
      <Card className="h-[500px] sm:h-[600px] swipe-card overflow-hidden relative transition-all duration-200 hover:shadow-elevated animate-fade-in">
        {getSwipeIndicator()}
        
        <div className={cn(
          "absolute inset-0 transition-transform duration-500 ease-out",
          isFlipped ? "transform rotateY-180" : ""
        )}>
          {/* Front of card */}
          <div className={cn(
            "absolute inset-0 p-4 sm:p-6 flex flex-col",
            isFlipped ? "opacity-0" : "opacity-100"
          )}>
            {/* Header with newspaper dateline style */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 border-b border-border">
              <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground text-xs sm:text-sm font-sans uppercase tracking-wide">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {formatDate(item.date)}
              </div>
              <Badge variant="outline" className="text-xs font-sans font-bold uppercase border-2 border-border">
                {item.source.title}
              </Badge>
            </div>

            {/* Headline */}
            <h2 className="font-headline text-lg sm:text-2xl font-bold text-foreground leading-tight mb-3 sm:mb-4 line-clamp-4 sm:line-clamp-3 headline-hover p-2 -m-2 transition-colors duration-150">
              {item.title}
            </h2>

            {/* Lead paragraph */}
            <p className="font-body text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 flex-1 line-clamp-6 sm:line-clamp-6">
              {item.description}
            </p>

            {/* Tags section */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              {item.category.slice(0, 3).map((cat, index) => (
                <Badge key={index} variant="outline" className="text-xs font-sans font-medium border-2 border-border uppercase">
                  {cat.name}
                </Badge>
              ))}
              {item.category.length > 3 && (
                <Badge variant="outline" className="text-xs text-muted-foreground border-2 border-border font-sans">
                  +{item.category.length - 3} MORE
                </Badge>
              )}
            </div>

            {/* Byline */}
            {item.author.length > 0 && (
              <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 font-sans uppercase tracking-wide border-t border-border pt-2">
                BY {item.author.map(a => a.name).join(', ')}
              </div>
            )}

            {/* Action buttons - newspaper style */}
            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
              <Button
                variant="newspaper"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSpeak(item.title + '. ' + item.description);
                }}
                className="flex items-center gap-1 text-xs flex-1 max-w-20 sm:max-w-24"
              >
                <Volume2 className="w-3 h-3" />
                <span className="hidden sm:inline">LISTEN</span>
              </Button>
              
              <div className="flex gap-1">
                <Button
                  variant="newspaper"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(!isFlipped);
                  }}
                  className="px-2 sm:px-3"
                  title="Read full article"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="newspaper"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.link, '_blank');
                  }}
                  className="px-2 sm:px-3"
                  title="Open original"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="newspaper"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(item);
                  }}
                  className="px-2 sm:px-3"
                  title="Share article"
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Back of card - Full article view */}
          <div className={cn(
            "absolute inset-0 p-4 sm:p-6 transform rotateY-180 bg-background",
            isFlipped ? "opacity-100" : "opacity-0"
          )}>
            <div className="h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-border">
                <h3 className="font-headline text-base sm:text-lg font-bold text-foreground uppercase tracking-wide">
                  FULL STORY
                </h3>
                <Button
                  variant="newspaper"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                  className="px-2"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {item.content || item.description}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};