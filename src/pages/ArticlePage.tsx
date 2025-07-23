import { useEffect, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Share2, Volume2, Clock, Twitter } from 'lucide-react';
import { NewsItem } from '@/hooks/useNewsData';
import { useSpeech } from '@/hooks/useSpeech';
import { useToast } from '@/hooks/use-toast';
import { useFeedData } from '@/hooks/useFeedData';
import { useSEO } from '@/hooks/useSEO';

export const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [articleFeedId, setArticleFeedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { speak } = useSpeech();
  const { toast } = useToast();
  const { feeds, changeFeed } = useFeedData();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        // Try to find the article in all feeds
        let foundArticle: NewsItem | null = null;
        let foundFeedId: string | null = null;
        
        for (const feed of feeds) {
          try {
            const response = await fetch(feed.rssUrl);
            if (response.ok) {
              const articles: NewsItem[] = await response.json();
              const article = articles.find(a => a.id === id);
              if (article) {
                foundArticle = article;
                foundFeedId = feed.id;
                break;
              }
            }
          } catch (err) {
            // Continue to next feed if this one fails
            console.log(`Failed to fetch from ${feed.name}:`, err);
          }
        }
        
        if (foundArticle && foundFeedId) {
          setArticle(foundArticle);
          setArticleFeedId(foundFeedId);
        } else {
          setError('Article not found');
        }
      } catch (err) {
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    if (id && feeds.length > 0) {
      fetchArticle();
    }
  }, [id, feeds]);

  // SEO meta tags for the article
  useSEO({
    title: article ? `${article.title} | ReadMode by Curate.Fun` : undefined,
    description: article ? article.description.slice(0, 160) + (article.description.length > 160 ? '...' : '') : undefined,
    keywords: article ? [...article.category.map(cat => cat.name), 'news', article.source.title] : undefined,
    author: article?.author.length ? article.author.map(a => a.name).join(', ') : 'Curate.Fun',
    ogTitle: article ? article.title : undefined,
    ogDescription: article ? article.description.slice(0, 160) + (article.description.length > 160 ? '...' : '') : undefined,
    ogUrl: article ? window.location.href : undefined,
    ogImage: '/lovable-uploads/1d75c33b-437e-4cfe-be6b-57c7cd5be98c.png',
    twitterTitle: article ? article.title : undefined,
    twitterDescription: article ? article.description.slice(0, 160) + (article.description.length > 160 ? '...' : '') : undefined,
    twitterImage: '/lovable-uploads/1d75c33b-437e-4cfe-be6b-57c7cd5be98c.png',
    canonical: article ? window.location.href : undefined
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleShare = async () => {
    if (!article) return;

    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Article link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Sharing failed",
          description: "Could not share this article",
          variant: "destructive",
        });
      }
    }
  };

  const handleContinueReading = () => {
    // If we found the article in a specific feed, switch to that feed
    if (articleFeedId) {
      changeFeed(articleFeedId);
    }
    // Navigate to the main page (ReadMode)
    navigate('/');
  };

  const isTwitterSource = article && (
    article.source.title.toLowerCase() === 'twitter' || 
    article.link.includes('x.com') || 
    article.link.includes('twitter.com')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-headline font-bold">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-border bg-background sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="newspaper" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              BACK TO READ mode
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="newspaper"
              size="sm"
              onClick={() => speak(article.title + '. ' + article.description)}
            >
              <Volume2 className="w-4 h-4 mr-2" />
              LISTEN
            </Button>
            
            <Button
              variant="newspaper"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              SHARE
            </Button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="swipe-card p-8">
          {/* Article Meta */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-border">
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-sans">
              <Clock className="w-4 h-4" />
              {formatTimeAgo(article.date)}
            </div>
            <Badge variant="outline" className="font-sans font-bold border-2 border-border">
              {article.source.title}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author */}
          {article.author.length > 0 && (
            <div className="text-sm text-muted-foreground mb-6 font-sans uppercase tracking-wide border-b border-border pb-4">
              BY {article.author.map(a => a.name).join(', ')}
            </div>
          )}

          {/* Content */}
          <div className="font-body text-lg leading-relaxed text-foreground mb-8 whitespace-pre-wrap">
            {article.content || article.description}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-border">
            {article.category.map((cat, index) => (
              <Badge key={index} variant="outline" className="font-sans font-medium border-2 border-border uppercase">
                {cat.name}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="newspaper" onClick={handleContinueReading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              CONTINUE READING
            </Button>
            
            <div className="flex gap-2">
              {isTwitterSource && (
                <Button
                  variant="newspaper"
                  onClick={() => window.open(article.link, '_blank')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  VIEW ON X
                </Button>
              )}
              
              <Button
                variant="newspaper"
                onClick={() => window.open(article.link, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                VIEW ORIGINAL
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};