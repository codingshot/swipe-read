import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Clock, Twitter, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NewsItem, SwipeAction } from '@/hooks/useNewsData';
import { Link } from 'react-router-dom';

interface ReadStoriesPopupProps {
  readArticles: NewsItem[];
  swipeActions: SwipeAction[];
  trigger: React.ReactNode;
}

export const ReadStoriesPopup = ({ readArticles, swipeActions, trigger }: ReadStoriesPopupProps) => {
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
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground font-sans">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(article.date)}
                      </div>
                      <Badge variant="outline" className="font-sans font-bold border-border">
                        {article.source.title}
                      </Badge>
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
                      <Link to={`/article/${article.id}`}>
                        <Button variant="newspaper" size="sm" className="text-xs">
                          READ AGAIN
                        </Button>
                      </Link>
                      
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
                        {/* Header */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground font-sans">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(article.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-success fill-current" />
                            <Badge variant="outline" className="font-sans font-bold border-border">
                              {article.source.title}
                            </Badge>
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
                          <Link to={`/article/${article.id}`}>
                            <Button variant="newspaper" size="sm" className="text-xs">
                              READ AGAIN
                            </Button>
                          </Link>
                          
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
                        {/* Header */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-muted-foreground font-sans">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(article.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <X className="w-3 h-3 text-destructive" />
                            <Badge variant="outline" className="font-sans font-bold border-border">
                              {article.source.title}
                            </Badge>
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
                          <Link to={`/article/${article.id}`}>
                            <Button variant="newspaper" size="sm" className="text-xs">
                              READ NOW
                            </Button>
                          </Link>
                          
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