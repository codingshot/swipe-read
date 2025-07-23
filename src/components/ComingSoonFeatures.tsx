import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, MessageSquare, Upload, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComingSoonFeaturesProps {
  className?: string;
}

export const ComingSoonFeatures = ({ className }: ComingSoonFeaturesProps) => {
  const features = [
    {
      icon: Bookmark,
      name: 'BOOKMARK',
      description: 'Save articles for later'
    },
    {
      icon: MessageSquare,
      name: 'NOTES',
      description: 'Community notes & corrections'
    },
    {
      icon: Upload,
      name: 'SUBMIT',
      description: 'Submit news to feeds'
    },
    {
      icon: Bell,
      name: 'ALERTS',
      description: 'Breaking news notifications'
    }
  ];

  return (
    <div className={cn(
      "fixed right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-2 sm:gap-3",
      className
    )}>
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={feature.name} className="relative group">
            <Button
              variant="newspaper"
              size="sm"
              disabled
              className="w-10 h-10 p-0 opacity-30 cursor-not-allowed hover:opacity-50 transition-opacity duration-200"
              title={`${feature.name} - ${feature.description}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
            
            {/* Coming Soon Badge - only visible on hover */}
            <Badge 
              variant="outline" 
              className="absolute -top-1 -right-1 text-xs font-sans font-bold border-2 border-border bg-background px-1 py-0 h-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
              SOON
            </Badge>
            
            {/* Enhanced tooltip on hover */}
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-background border-2 border-border p-3 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-elevated">
              <div className="text-sm font-sans font-bold uppercase tracking-wide">{feature.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{feature.description}</div>
              <div className="text-xs text-muted-foreground mt-1 italic">Coming soon...</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};