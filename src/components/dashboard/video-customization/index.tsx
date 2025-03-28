
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';
import { toast } from 'sonner';
import TemplateSelection from './TemplateSelection';
import TextCustomization from './TextCustomization';
import MusicSelection from './MusicSelection';
import VideoPreview from './VideoPreview';
import ProductDetails from './ProductDetails';

interface VideoSettings {
  template: string;
  music: string;
  textOverlays?: any[];
  [key: string]: any;
}

interface VideoCustomizationProps {
  product: Product;
  savedSettings?: VideoSettings;
  onComplete: (settings: VideoSettings) => void;
}

const VideoCustomization: React.FC<VideoCustomizationProps> = ({ 
  product, 
  savedSettings,
  onComplete 
}) => {
  const [activeTab, setActiveTab] = React.useState("template");
  const [selectedTemplate, setSelectedTemplate] = React.useState(savedSettings?.template || "flash-deal");
  const [selectedMusic, setSelectedMusic] = React.useState(savedSettings?.music || "upbeat");
  const [fontStyle, setFontStyle] = React.useState(savedSettings?.fontStyle || "montserrat");
  const [colorScheme, setColorScheme] = React.useState(savedSettings?.colorScheme || "purple");
  const [animation, setAnimation] = React.useState(savedSettings?.animation || "fade");
  
  // Initialize from saved settings if available
  React.useEffect(() => {
    if (savedSettings) {
      setSelectedTemplate(savedSettings.template || "flash-deal");
      setSelectedMusic(savedSettings.music || "upbeat");
      setFontStyle(savedSettings.fontStyle || "montserrat");
      setColorScheme(savedSettings.colorScheme || "purple");
      setAnimation(savedSettings.animation || "fade");
    }
  }, [savedSettings]);
  
  const handleComplete = () => {
    const settings = {
      template: selectedTemplate,
      music: selectedMusic,
      fontStyle,
      colorScheme,
      animation
    };
    
    toast.success('Video customization complete!');
    onComplete(settings);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span>Customize Your Video</span>
              </CardTitle>
              <CardDescription>
                Personalize your YouTube Short with templates, music, and text overlays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="template">Template</TabsTrigger>
                  <TabsTrigger value="text">Text</TabsTrigger>
                  <TabsTrigger value="music">Music</TabsTrigger>
                </TabsList>
                
                <TabsContent value="template">
                  <TemplateSelection 
                    selectedTemplate={selectedTemplate} 
                    setSelectedTemplate={setSelectedTemplate} 
                  />
                </TabsContent>
                
                <TabsContent value="text">
                  <TextCustomization 
                    fontStyle={fontStyle}
                    setFontStyle={setFontStyle}
                    colorScheme={colorScheme}
                    setColorScheme={setColorScheme}
                    animation={animation}
                    setAnimation={setAnimation}
                  />
                </TabsContent>
                
                <TabsContent value="music">
                  <MusicSelection 
                    selectedMusic={selectedMusic}
                    setSelectedMusic={setSelectedMusic}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Reset to defaults
                  setSelectedTemplate("flash-deal");
                  setSelectedMusic("upbeat");
                  setFontStyle("montserrat");
                  setColorScheme("purple");
                  setAnimation("fade");
                  toast.info("Settings reset to defaults");
                }}
              >
                Reset Settings
              </Button>
              <Button
                onClick={handleComplete}
                className="btn-primary flex items-center"
              >
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Preview Panel */}
        <div className="md:col-span-1">
          <VideoPreview 
            product={product} 
            selectedTemplate={selectedTemplate}
          />
          
          <div className="mt-4">
            <ProductDetails product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCustomization;
