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
      "fixed right-2 top-1/2 transform -translate-y-1/2 z-30 flex flex-col gap-3",
      className
    )}>
      <div className="text-xs font-sans font-bold text-center mb-2 transform rotate-90 origin-center whitespace-nowrap text-muted-foreground">
        COMING SOON
      </div>
      
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div key={feature.name} className="relative group">
            <Button
              variant="newspaper"
              size="sm"
              disabled
              className="w-10 h-10 p-0 opacity-50 cursor-not-allowed relative overflow-hidden"
              title={`${feature.name} - ${feature.description}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
            
            {/* Coming Soon Badge */}
            <Badge 
              variant="outline" 
              className="absolute -top-1 -right-1 text-xs font-sans font-bold border-2 border-border bg-background px-1 py-0 h-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              SOON
            </Badge>
            
            {/* Tooltip on hover */}
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-background border-2 border-border p-2 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="text-xs font-sans font-bold">{feature.name}</div>
              <div className="text-xs text-muted-foreground">{feature.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};