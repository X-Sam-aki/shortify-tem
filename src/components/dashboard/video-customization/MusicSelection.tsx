
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Music } from 'lucide-react';

interface MusicSelectionProps {
  selectedMusic: string;
  setSelectedMusic: (music: string) => void;
}

const MusicSelection: React.FC<MusicSelectionProps> = ({
  selectedMusic,
  setSelectedMusic
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Music className="h-4 w-4 mr-2" /> Music Selection
      </h3>
      <p className="text-sm text-gray-500">
        Choose background music for your video
      </p>
      
      <RadioGroup
        value={selectedMusic}
        onValueChange={setSelectedMusic}
        className="space-y-3"
      >
        <div className="flex items-center justify-between border rounded-md p-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upbeat" id="upbeat" />
            <Label htmlFor="upbeat" className="font-medium cursor-pointer">Upbeat Pop</Label>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            Preview
          </Button>
        </div>
        
        <div className="flex items-center justify-between border rounded-md p-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="electronic" id="electronic" />
            <Label htmlFor="electronic" className="font-medium cursor-pointer">Electronic Beat</Label>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            Preview
          </Button>
        </div>
        
        <div className="flex items-center justify-between border rounded-md p-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="acoustic" id="acoustic" />
            <Label htmlFor="acoustic" className="font-medium cursor-pointer">Acoustic Chill</Label>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            Preview
          </Button>
        </div>
        
        <div className="flex items-center justify-between border rounded-md p-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cinematic" id="cinematic" />
            <Label htmlFor="cinematic" className="font-medium cursor-pointer">Cinematic</Label>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            Preview
          </Button>
        </div>
      </RadioGroup>
      
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm font-medium">Volume Settings</p>
        <p className="text-xs text-gray-500 mt-1">
          Adjust the music volume to balance with any voiceover you might add later
        </p>
        <div className="mt-2 px-2">
          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-brand-teal w-3/4 rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicSelection;
