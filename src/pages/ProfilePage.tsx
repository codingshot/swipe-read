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
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>(() => {
    const stored = localStorage.getItem('selected_feeds');
    return stored ? JSON.parse(stored) : [];
  });

  // Calculate daily stats manually
  const today = new Date().toDateString();
  const dailyStats = {
    articlesRead: swipeActions.filter(action => 
      new Date(action.timestamp).toDateString() === today
    ).length
  };

  // Get read articles by checking which articles have been swiped
  const readArticles: NewsItem[] = [];
  // Note: We'll need to fetch articles to properly display them
  // For now, we'll show placeholder data based on swipe actions

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
                  {selectedFeeds.map(feedId => {
                    const feed = feeds.find(f => f.id === feedId);
                    return feed ? (
                      <Badge key={feedId} variant="secondary">
                        {feed.name}
                      </Badge>
                    ) : null;
                  })}
                  {selectedFeeds.length === 0 && (
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
                    <Card key={action.itemId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-2 mb-1">Article ID: {action.itemId}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {action.feedName || 'Unknown feed'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{action.feedName || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(new Date(action.timestamp).toISOString())}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {action.action === 'like' && (
                              <Badge variant="default" className="bg-green-100 text-green-800">
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
                    <Card key={action.itemId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-2 mb-1">Article ID: {action.itemId}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {action.feedName || 'Unknown feed'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{action.feedName || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(new Date(action.timestamp).toISOString())}</span>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ❤️ Liked
                          </Badge>
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
                    <Card key={action.itemId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-2 mb-1">Article ID: {action.itemId}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {action.feedName || 'Unknown feed'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{action.feedName || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(new Date(action.timestamp).toISOString())}</span>
                            </div>
                          </div>
                          <Badge variant="secondary">
                            👎 Skipped
                          </Badge>
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