import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Clock, Twitter, Heart, X, Globe, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewsItem, SwipeAction } from '@/hooks/useNewsData';
import { Feed } from './FeedSelector';
import { Link } from 'react-router-dom';

interface ReadStoriesPopupProps {
  readArticles: NewsItem[];
  swipeActions: SwipeAction[];
  feeds: Feed[];
  currentFeed: string;
  onUpdateSwipeAction: (itemId: string, newAction: 'like' | 'dismiss' | 'bookmark') => void;
  onSwitchToFeed: (feedId: string) => void;
  trigger: React.ReactNode;
}

export const ReadStoriesPopup = ({ readArticles, swipeActions, feeds, currentFeed, onUpdateSwipeAction, onSwitchToFeed, trigger }: ReadStoriesPopupProps) => {
  const [open, setOpen] = useState(false);

  const getSwipeAction = (articleId: string) => {
    return swipeActions.find(action => action.itemId === articleId);
  };

  const likedArticles = readArticles.filter(article => {
    const action = getSwipeAction(article.id);
    return action?.action === 'like';
  });

  const skippedArticles = readArticles.filter(article => {
    const action = getSwipeAction(article.id);
    return action?.action === 'dismiss';
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  const isTwitterSource = (item: NewsItem) => 
    item.source.title.toLowerCase() === 'twitter' || 
    item.link.includes('x.com') || 
    item.link.includes('twitter.com');

  const getFeedInfo = (action: SwipeAction) => {
    if (action.feedId && action.feedName) {
      return { id: action.feedId, name: action.feedName };
    }
    // Fallback for older actions without feed info
    return { id: currentFeed, name: feeds.find(f => f.id === currentFeed)?.name || 'Unknown Feed' };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden border-2 border-border bg-background">
        <DialogHeader className="border-b-2 border-border pb-4">
          <DialogTitle className="font-headline text-xl font-bold uppercase tracking-wide">
            READ STORIES ({readArticles.length})
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="grid w-full grid-cols-3 border border-border">
            <TabsTrigger value="all" className="font-sans text-xs uppercase">
              All ({readArticles.length})
            </TabsTrigger>
            <TabsTrigger value="liked" className="font-sans text-xs uppercase">
              <Heart className="w-3 h-3 mr-1" />
              Liked ({likedArticles.length})
            </TabsTrigger>
            <TabsTrigger value="skipped" className="font-sans text-xs uppercase">
              <X className="w-3 h-3 mr-1" />
              Skipped ({skippedArticles.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            <div className="overflow-y-auto max-h-[50vh] pr-2">
              {readArticles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="font-sans">No articles read yet.</p>
                  <p className="text-sm mt-2">Start reading to see your history here!</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {readArticles.map((article) => (
                <Card key={article.id} className="p-4 border-2 border-border hover:shadow-elevated transition-all duration-200">
                  <div className="space-y-3">
                    {/* Header with feed info and quick switch */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <Badge variant={getFeedInfo(getSwipeAction(article.id)!).id === currentFeed ? "default" : "outline"} className="text-xs">
                          {getFeedInfo(getSwipeAction(article.id)!).name}
                        </Badge>
                        {getFeedInfo(getSwipeAction(article.id)!).id !== currentFeed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSwitchToFeed(getFeedInfo(getSwipeAction(article.id)!).id);
                            }}
                            className="h-6 px-2 text-xs"
                            title={`Switch to ${getFeedInfo(getSwipeAction(article.id)!).name} feed`}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Read More
                          </Button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(article.date)}
                      </div>
                    </div>


                    {/* Title */}
                    <Link 
                      to={`/article/${article.id}`}
                      className="block hover:bg-accent/20 transition-colors duration-150 p-2 -m-2"
                    >
                      <h3 className="font-headline text-sm font-bold leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 font-body">
                      {article.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {article.category.slice(0, 3).map((cat, index) => (
                        <Badge key={index} variant="outline" className="text-xs font-sans border-border">
                          {cat.name}
                        </Badge>
                      ))}
                      {article.category.length > 3 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                          +{article.category.length - 3}
                        </Badge>
                      )}
                    </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex gap-1">
                            <Link to={`/article/${article.id}`}>
                              <Button variant="newspaper" size="sm" className="text-xs">
                                READ AGAIN
                              </Button>
                            </Link>
                            
                            {/* Change action buttons */}
                            {getSwipeAction(article.id)?.action === 'like' ? (
                              <Button
                                variant="outline" 
                                size="sm"
                                onClick={() => onUpdateSwipeAction(article.id, 'dismiss')}
                                className="text-xs px-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                                title="Change to skipped"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm" 
                                onClick={() => onUpdateSwipeAction(article.id, 'like')}
                                className="text-xs px-2 border-success/50 text-success hover:bg-success/10"
                                title="Change to liked"
                              >
                                <Heart className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            {isTwitterSource(article) && (
                              <Button
                                variant="newspaper"
                                size="sm"
                                onClick={() => window.open(article.link, '_blank')}
                                className="px-2"
                              >
                                <Twitter className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="newspaper"
                              size="sm"
                              onClick={() => window.open(article.link, '_blank')}
                              className="px-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                  </div>
                </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="liked" className="mt-4">
            <div className="overflow-y-auto max-h-[50vh] pr-2">
              {likedArticles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-sans">No liked articles yet.</p>
                  <p className="text-sm mt-2">Swipe right to like articles!</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {likedArticles.map((article) => (
                     <Card key={article.id} className="p-4 border-2 border-border hover:shadow-elevated transition-all duration-200">
                       <div className="space-y-3">
                         {/* Header with feed info and quick switch */}
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Globe className="w-4 h-4 text-muted-foreground" />
                             <Badge variant={getFeedInfo(getSwipeAction(article.id)!).id === currentFeed ? "default" : "outline"} className="text-xs">
                               {getFeedInfo(getSwipeAction(article.id)!).name}
                             </Badge>
                             {getFeedInfo(getSwipeAction(article.id)!).id !== currentFeed && (
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onSwitchToFeed(getFeedInfo(getSwipeAction(article.id)!).id);
                                 }}
                                 className="h-6 px-2 text-xs"
                                 title={`Switch to ${getFeedInfo(getSwipeAction(article.id)!).name} feed`}
                               >
                                 <Play className="w-3 h-3 mr-1" />
                                 Read More
                               </Button>
                             )}
                           </div>
                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
                             <Heart className="w-3 h-3 text-success fill-current" />
                             {formatTimeAgo(article.date)}
                           </div>
                         </div>

                        {/* Title */}
                        <Link 
                          to={`/article/${article.id}`}
                          className="block hover:bg-accent/20 transition-colors duration-150 p-2 -m-2"
                        >
                          <h3 className="font-headline text-sm font-bold leading-tight line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 font-body">
                          {article.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {article.category.slice(0, 3).map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-sans border-border">
                              {cat.name}
                            </Badge>
                          ))}
                          {article.category.length > 3 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                              +{article.category.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex gap-1">
                            <Link to={`/article/${article.id}`}>
                              <Button variant="newspaper" size="sm" className="text-xs">
                                READ AGAIN
                              </Button>
                            </Link>
                            
                            {/* Change to skipped button */}
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => onUpdateSwipeAction(article.id, 'dismiss')}
                              className="text-xs px-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                              title="Change to skipped"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
                            {isTwitterSource(article) && (
                              <Button
                                variant="newspaper"
                                size="sm"
                                onClick={() => window.open(article.link, '_blank')}
                                className="px-2"
                              >
                                <Twitter className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="newspaper"
                              size="sm"
                              onClick={() => window.open(article.link, '_blank')}
                              className="px-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="skipped" className="mt-4">
            <div className="overflow-y-auto max-h-[50vh] pr-2">
              {skippedArticles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <X className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="font-sans">No skipped articles yet.</p>
                  <p className="text-sm mt-2">Swipe left to skip articles!</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {skippedArticles.map((article) => (
                     <Card key={article.id} className="p-4 border-2 border-border hover:shadow-elevated transition-all duration-200">
                       <div className="space-y-3">
                         {/* Header with feed info and quick switch */}
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <Globe className="w-4 h-4 text-muted-foreground" />
                             <Badge variant={getFeedInfo(getSwipeAction(article.id)!).id === currentFeed ? "default" : "outline"} className="text-xs">
                               {getFeedInfo(getSwipeAction(article.id)!).name}
                             </Badge>
                             {getFeedInfo(getSwipeAction(article.id)!).id !== currentFeed && (
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onSwitchToFeed(getFeedInfo(getSwipeAction(article.id)!).id);
                                 }}
                                 className="h-6 px-2 text-xs"
                                 title={`Switch to ${getFeedInfo(getSwipeAction(article.id)!).name} feed`}
                               >
                                 <Play className="w-3 h-3 mr-1" />
                                 Read More
                               </Button>
                             )}
                           </div>
                           <div className="flex items-center gap-1 text-xs text-muted-foreground">
                             <X className="w-3 h-3 text-destructive" />
                             {formatTimeAgo(article.date)}
                           </div>
                         </div>

                        {/* Title */}
                        <Link 
                          to={`/article/${article.id}`}
                          className="block hover:bg-accent/20 transition-colors duration-150 p-2 -m-2"
                        >
                          <h3 className="font-headline text-sm font-bold leading-tight line-clamp-2">
                            {article.title}
                          </h3>
                        </Link>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 font-body">
                          {article.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {article.category.slice(0, 3).map((cat, index) => (
                            <Badge key={index} variant="outline" className="text-xs font-sans border-border">
                              {cat.name}
                            </Badge>
                          ))}
                          {article.category.length > 3 && (
                            <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                              +{article.category.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="flex gap-1">
                            <Link to={`/article/${article.id}`}>
                              <Button variant="newspaper" size="sm" className="text-xs">
                                READ NOW
                              </Button>
                            </Link>
                            
                            {/* Change to liked button */}
                            <Button
                              variant="outline"
                              size="sm" 
                              onClick={() => onUpdateSwipeAction(article.id, 'like')}
                              className="text-xs px-2 border-success/50 text-success hover:bg-success/10"
                              title="Change to liked"
                            >
                              <Heart className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
                            {isTwitterSource(article) && (
                              <Button
                                variant="newspaper"
                                size="sm"
                                onClick={() => window.open(article.link, '_blank')}
                                className="px-2"
                              >
                                <Twitter className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="newspaper"
                              size="sm"
                              onClick={() => window.open(article.link, '_blank')}
                              className="px-2"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};