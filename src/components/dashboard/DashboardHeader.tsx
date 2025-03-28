
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw, Info } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  lastSaved: Date | null;
  onSave: () => void;
  onReset: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastSaved,
  onSave,
  onReset
}) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-4 text-center">Create Your YouTube Short</h1>
      
      <Card className="bg-gradient-to-r from-purple-50 to-teal-50 border-none mb-6">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-purple/10">
              <Info className="h-4 w-4 text-brand-purple" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Your progress is automatically saved
              </p>
              {lastSaved && (
                <p className="text-xs text-gray-500">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={onSave}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save your current progress</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={onReset}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset all progress and start over</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHeader;
