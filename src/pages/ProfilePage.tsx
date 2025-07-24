import { useState, useEffect } from 'react';
import { ArrowLeft, User, BookOpen, Settings, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useNewsData, type NewsItem, type SwipeAction } from '@/hooks/useNewsData';
import { useFeedData } from '@/hooks/useFeedData';
import { useSpeech } from '@/hooks/useSpeech';
import { useSEO } from '@/hooks/useSEO';

export function ProfilePage() {
  const navigate = useNavigate();
  const { feeds } = useFeedData();
  const { availableVoices } = useSpeech();
  const {
    readItems,
    swipeActions,
    dailyGoal,
    changeDailyGoal,
    allArticles
  } = useNewsData('all');

  // Settings state
  const [autoPlay, setAutoPlay] = useState(() => 
    localStorage.getItem('autoPlay') === 'true'
  );
  const [autoRead, setAutoRead] = useState(() => 
    localStorage.getItem('autoRead') === 'true'
  );
  const [selectedVoiceId, setSelectedVoiceId] = useState(() => 
    localStorage.getItem('selectedVoice') || ''
  );

  // Profile stats
  const [readingFrequency, setReadingFrequency] = useState(() =>
    localStorage.getItem('reading_frequency') || 'daily'
  );
  
  // Get selected feeds from feeds hook instead of localStorage
  const actualSelectedFeeds = feeds.filter(feed => {
    const stored = localStorage.getItem('selected_feeds');
    const selectedFeedIds = stored ? JSON.parse(stored) : [];
    return selectedFeedIds.includes(feed.id);
  });

  // Calculate daily reading history
  const getDailyHistory = () => {
    const days: { [date: string]: { count: number; goalMet: boolean; actions: SwipeAction[] } } = {};
    
    swipeActions.forEach(action => {
      const date = new Date(action.timestamp).toDateString();
      if (!days[date]) {
        days[date] = { count: 0, goalMet: false, actions: [] };
      }
      days[date].count++;
      days[date].actions.push(action);
      days[date].goalMet = days[date].count >= dailyGoal;
    });
    
    return Object.entries(days)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 7); // Last 7 days
  };

  const dailyHistory = getDailyHistory();
  const today = new Date().toDateString();
  const todayStats = dailyHistory.find(([date]) => date === today)?.[1] || { count: 0, goalMet: false, actions: [] };

  // Get feed statistics
  const getFeedStats = () => {
    const feedCounts: { [feedName: string]: number } = {};
    
    swipeActions.forEach(action => {
      if (action.feedName) {
        feedCounts[action.feedName] = (feedCounts[action.feedName] || 0) + 1;
      }
    });
    
    return Object.entries(feedCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([feedName, count]) => ({ feedName, count }));
  };

  const topFeeds = getFeedStats();

  // Set SEO for profile page
  useSEO({
    title: "My Profile - ReadMode by Curate.Fun",
    description: "View your reading history, preferences, and statistics on ReadMode.",
    keywords: ["profile", "reading history", "preferences", "statistics", "news reading"]
  });

  const handleAutoPlayChange = (checked: boolean) => {
    setAutoPlay(checked);
    localStorage.setItem('autoPlay', checked.toString());
  };

  const handleAutoReadChange = (checked: boolean) => {
    setAutoRead(checked);
    localStorage.setItem('autoRead', checked.toString());
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    localStorage.setItem('selectedVoice', voiceId);
  };

  const handleReadingFrequencyChange = (frequency: string) => {
    setReadingFrequency(frequency);
    localStorage.setItem('reading_frequency', frequency);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getSwipeAction = (articleId: string) => {
    return swipeActions.find(action => action.itemId === articleId);
  };

  // Get articles with their swipe actions
  const getArticleFromAction = (action: SwipeAction) => {
    return allArticles.find(article => article.id === action.itemId);
  };

  // Filter swipe actions by type
  const likedActions = swipeActions.filter(action => action.action === 'like');
  const skippedActions = swipeActions.filter(action => action.action === 'dismiss');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">My Profile</h1>
                <p className="text-sm text-muted-foreground">Your reading journey</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Articles Read</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{swipeActions.length}</div>
                  <p className="text-sm text-muted-foreground">Total articles</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Liked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{likedActions.length}</div>
                  <p className="text-sm text-muted-foreground">Articles loved</p>
                </CardContent>
              </Card>
              
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Daily Goal</CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{todayStats.count}/{dailyGoal}</div>
                  <p className="text-sm text-muted-foreground">
                    Articles today {todayStats.goalMet ? '🎯' : ''}
                  </p>
                  
                  {/* Daily Progress */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Last 7 days:</p>
                    <div className="space-y-1">
                      {dailyHistory.map(([date, stats]) => (
                        <div key={date} className="flex justify-between text-xs items-center">
                          <span className="truncate">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{stats.count}/{dailyGoal}</span>
                            {stats.goalMet && <span className="text-green-600">✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {topFeeds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Top feeds (all time):</p>
                      <div className="space-y-1">
                        {topFeeds.map(({ feedName, count }) => (
                          <div key={feedName} className="flex justify-between text-xs">
                            <span className="truncate">{feedName}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
            </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Selected Feeds</CardTitle>
                <CardDescription>Feeds you're subscribed to</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {actualSelectedFeeds.map(feed => (
                    <Badge key={feed.id} variant="secondary">
                      {feed.name}
                    </Badge>
                  ))}
                  {actualSelectedFeeds.length === 0 && (
                    <p className="text-muted-foreground">No feeds selected</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All ({swipeActions.length})</TabsTrigger>
                <TabsTrigger value="liked">Liked ({likedActions.length})</TabsTrigger>
                <TabsTrigger value="skipped">Skipped ({skippedActions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-4">
                  {swipeActions.map(action => {
                    const article = getArticleFromAction(action);
                    return (
                      <Card key={action.itemId} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          {article ? (
                            <div className="p-4 space-y-4">
                              {/* Action badge and meta info */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {action.action === 'like' && (
                                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                      ❤️ Liked
                                    </Badge>
                                  )}
                                  {action.action === 'dismiss' && (
                                    <Badge variant="secondary">
                                      👎 Skipped
                                    </Badge>
                                  )}
                                  {action.action === 'bookmark' && (
                                    <Badge variant="outline">
                                      🔖 Saved
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(action.timestamp).toISOString())}
                                </div>
                              </div>
                              
                              {/* Article card similar to swipe cards */}
                              <div className="border border-border rounded-lg p-4 bg-card/50 hover:bg-card transition-colors">
                                <h3 className="font-headline font-bold text-lg leading-tight mb-3 line-clamp-2">
                                  {article.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                                  {article.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">{action.feedName || 'Unknown feed'}</span>
                                    {article.author && article.author.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>by {article.author[0].name}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>{new Date(article.date).toLocaleDateString()}</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs px-3"
                                    onClick={() => window.open(article.link, '_blank')}
                                  >
                                    Read Article
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  {action.action === 'like' && (
                                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                      ❤️ Liked
                                    </Badge>
                                  )}
                                  {action.action === 'dismiss' && (
                                    <Badge variant="secondary">
                                      👎 Skipped
                                    </Badge>
                                  )}
                                  {action.action === 'bookmark' && (
                                    <Badge variant="outline">
                                      🔖 Saved
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(action.timestamp).toISOString())}
                                </div>
                              </div>
                              
                              <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Article no longer available</p>
                                    <p className="text-xs text-muted-foreground/70">From: {action.feedName || 'Unknown feed'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {swipeActions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No articles read yet. Start reading to see your history!
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="liked">
                <div className="space-y-4">
                  {likedActions.map(action => {
                    const article = getArticleFromAction(action);
                    return (
                      <Card key={action.itemId} className="overflow-hidden border-green-200 dark:border-green-800 hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          {article ? (
                            <div className="p-4 space-y-4">
                              {/* Action badge and meta info */}
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  ❤️ Liked
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(action.timestamp).toISOString())}
                                </div>
                              </div>
                              
                              {/* Article card similar to swipe cards */}
                              <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50/50 dark:bg-green-950/20 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors">
                                <h3 className="font-headline font-bold text-lg leading-tight mb-3 line-clamp-2">
                                  {article.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                                  {article.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-green-200 dark:border-green-800">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">{action.feedName || 'Unknown feed'}</span>
                                    {article.author && article.author.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>by {article.author[0].name}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>{new Date(article.date).toLocaleDateString()}</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs px-3 border-green-300 hover:bg-green-100 dark:border-green-700 dark:hover:bg-green-900"
                                    onClick={() => window.open(article.link, '_blank')}
                                  >
                                    Read Article
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                  ❤️ Liked
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(action.timestamp).toISOString())}
                                </div>
                              </div>
                              
                              <div className="bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-dashed border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Liked article no longer available</p>
                                    <p className="text-xs text-muted-foreground/70">From: {action.feedName || 'Unknown feed'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {likedActions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No liked articles yet. Like some articles to see them here!
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skipped">
                <div className="space-y-4">
                  {skippedActions.map(action => {
                    const article = getArticleFromAction(action);
                    return (
                      <Card key={action.itemId} className="overflow-hidden border-muted hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          {article ? (
                            <div className="p-4 space-y-4">
                              {/* Action badge and meta info */}
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="secondary">
                                  👎 Skipped
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(action.timestamp).toISOString())}
                                </div>
                              </div>
                              
                              {/* Article card similar to swipe cards */}
                              <div className="border border-muted rounded-lg p-4 bg-muted/20 hover:bg-muted/30 transition-colors">
                                <h3 className="font-headline font-bold text-lg leading-tight mb-3 line-clamp-2 text-muted-foreground">
                                  {article.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 opacity-75">
                                  {article.description}
                                </p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-muted">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className="font-medium">{action.feedName || 'Unknown feed'}</span>
                                    {article.author && article.author.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>by {article.author[0].name}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>{new Date(article.date).toLocaleDateString()}</span>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs px-3 text-muted-foreground hover:text-foreground"
                                    onClick={() => window.open(article.link, '_blank')}
                                  >
                                    Read Article
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4">
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <Badge variant="secondary">
                                  👎 Skipped
                                </Badge>
                                <div className="text-xs text-muted-foreground">
                                  {formatTimeAgo(new Date(action.timestamp).toISOString())}
                                </div>
                              </div>
                              
                              <div className="bg-muted/20 rounded-lg p-4 border border-dashed border-muted">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">Skipped article no longer available</p>
                                    <p className="text-xs text-muted-foreground/70">From: {action.feedName || 'Unknown feed'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {skippedActions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No skipped articles yet.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reading Preferences</CardTitle>
                <CardDescription>Customize your reading experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Daily Reading Goal</label>
                  <Select value={dailyGoal.toString()} onValueChange={(value) => changeDailyGoal(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 articles per day</SelectItem>
                      <SelectItem value="10">10 articles per day</SelectItem>
                      <SelectItem value="15">15 articles per day</SelectItem>
                      <SelectItem value="20">20 articles per day</SelectItem>
                      <SelectItem value="25">25 articles per day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Reading Frequency</label>
                  <Select value={readingFrequency} onValueChange={handleReadingFrequencyChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto Mode Settings</CardTitle>
                <CardDescription>Configure automatic reading features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto Play</label>
                    <p className="text-sm text-muted-foreground">Automatically advance to next article</p>
                  </div>
                  <Switch checked={autoPlay} onCheckedChange={handleAutoPlayChange} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto Read</label>
                    <p className="text-sm text-muted-foreground">Automatically read articles aloud</p>
                  </div>
                  <Switch checked={autoRead} onCheckedChange={handleAutoReadChange} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voice Settings</CardTitle>
                <CardDescription>Choose your preferred text-to-speech voice</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium mb-2 block">Text-to-Speech Voice</label>
                  <Select value={selectedVoiceId} onValueChange={handleVoiceChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}