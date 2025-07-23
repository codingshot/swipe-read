import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Clock, Target, Zap, BookOpen, Mic } from 'lucide-react';

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  autoPlay: boolean;
  autoRead: boolean;
  onAutoPlayChange: (enabled: boolean) => void;
  onAutoReadChange: (enabled: boolean) => void;
  dailyGoal: number;
  onDailyGoalChange: (goal: number) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoiceId: string;
  onVoiceChange: (voiceId: string) => void;
}

export const SettingsPopup = ({ 
  isOpen, 
  onClose, 
  autoPlay, 
  autoRead, 
  onAutoPlayChange, 
  onAutoReadChange, 
  dailyGoal, 
  onDailyGoalChange,
  availableVoices,
  selectedVoiceId,
  onVoiceChange
}: SettingsPopupProps) => {
  const selectedVoice = availableVoices.find(voice => voice.voiceURI === selectedVoiceId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-2 border-border">
        <DialogHeader>
          <DialogTitle className="font-headline text-lg font-bold uppercase tracking-wider">
            Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-base font-medium">Auto Mode</Label>
                <p className="text-sm text-muted-foreground">Automated reading experience</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto Play</Label>
                  <p className="text-xs text-muted-foreground">Automatically advance to next article</p>
                </div>
                <Switch 
                  checked={autoPlay} 
                  onCheckedChange={onAutoPlayChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Auto Read</Label>
                  <p className="text-xs text-muted-foreground">Read articles aloud with text-to-speech</p>
                </div>
                <Switch 
                  checked={autoRead} 
                  onCheckedChange={onAutoReadChange}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-base font-medium">Daily Goal</Label>
                <p className="text-sm text-muted-foreground">Set your reading target</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Select value={dailyGoal.toString()} onValueChange={(value) => onDailyGoalChange(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25, 30, 50].map((goal) => (
                    <SelectItem key={goal} value={goal.toString()}>
                      {goal} articles per day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-base font-medium">Voice Settings</Label>
                <p className="text-sm text-muted-foreground">Choose voice for audio reading</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium mb-2 block">Voice Selection</Label>
                <Select value={selectedVoiceId} onValueChange={onVoiceChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a voice">
                      {selectedVoice ? (
                        <div className="flex items-center gap-2">
                          <span>{selectedVoice.name}</span>
                          {selectedVoice.localService && (
                            <Badge variant="secondary" className="text-xs">Local</Badge>
                          )}
                        </div>
                      ) : (
                        "Select a voice"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    {availableVoices
                      .filter(voice => voice.lang.startsWith('en'))
                      .map((voice) => (
                        <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                          <div className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            {voice.localService && (
                              <Badge variant="secondary" className="text-xs">Local</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};