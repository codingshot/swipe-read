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
    changeDailyGoal
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

  // Calculate daily stats manually
  const today = new Date().toDateString();
  const dailyStats = {
    articlesRead: swipeActions.filter(action => 
      new Date(action.timestamp).toDateString() === today
    ).length
  };

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

  // Filter swipe actions instead of articles for now
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
                <div className="text-3xl font-bold text-blue-600">{dailyStats.articlesRead}/{dailyGoal}</div>
                <p className="text-sm text-muted-foreground">Articles today</p>
                {topFeeds.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Top feeds:</p>
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
                  {swipeActions.map(action => (
                    <Card key={action.itemId} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {action.action === 'like' && (
                                <Badge variant="default" className="bg-green-100 text-green-800 flex-shrink-0">
                                  ❤️ Liked
                                </Badge>
                              )}
                              {action.action === 'dismiss' && (
                                <Badge variant="secondary" className="flex-shrink-0">
                                  👎 Skipped
                                </Badge>
                              )}
                              {action.action === 'bookmark' && (
                                <Badge variant="outline" className="flex-shrink-0">
                                  🔖 Saved
                                </Badge>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                                <span className="truncate">{action.feedName || 'Unknown feed'}</span>
                                <span>•</span>
                                <span className="flex-shrink-0">{formatTimeAgo(new Date(action.timestamp).toISOString())}</span>
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg p-3 border">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-muted-foreground mb-1">Article Preview</p>
                                  <p className="text-xs font-mono text-muted-foreground/80 truncate">ID: {action.itemId}</p>
                                  <p className="text-sm mt-2 text-foreground">
                                    This article was {action.action === 'like' ? 'liked' : action.action === 'dismiss' ? 'skipped' : 'bookmarked'} from {action.feedName || 'an unknown feed'}.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {swipeActions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No articles read yet. Start reading to see your history!
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="liked">
                <div className="space-y-4">
                  {likedActions.map(action => (
                    <Card key={action.itemId} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="default" className="bg-green-100 text-green-800 flex-shrink-0">
                                ❤️ Liked
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                                <span className="truncate">{action.feedName || 'Unknown feed'}</span>
                                <span>•</span>
                                <span className="flex-shrink-0">{formatTimeAgo(new Date(action.timestamp).toISOString())}</span>
                              </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">Liked Article</p>
                                  <p className="text-xs font-mono text-green-600 dark:text-green-400 truncate">ID: {action.itemId}</p>
                                  <p className="text-sm mt-2 text-green-800 dark:text-green-200">
                                    You loved this article from {action.feedName || 'an unknown feed'}. Great content!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {likedActions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No liked articles yet. Like articles to see them here!
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skipped">
                <div className="space-y-4">
                  {skippedActions.map(action => (
                    <Card key={action.itemId} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="flex-shrink-0">
                                👎 Skipped
                              </Badge>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                                <span className="truncate">{action.feedName || 'Unknown feed'}</span>
                                <span>•</span>
                                <span className="flex-shrink-0">{formatTimeAgo(new Date(action.timestamp).toISOString())}</span>
                              </div>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-3 border border-muted">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0"></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-muted-foreground mb-1">Skipped Article</p>
                                  <p className="text-xs font-mono text-muted-foreground/80 truncate">ID: {action.itemId}</p>
                                  <p className="text-sm mt-2 text-muted-foreground">
                                    You skipped this article from {action.feedName || 'an unknown feed'}. No worries!
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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