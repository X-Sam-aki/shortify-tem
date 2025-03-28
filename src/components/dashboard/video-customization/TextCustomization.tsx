
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from "@/components/ui/label";
import { Type } from 'lucide-react';

interface TextCustomizationProps {
  fontStyle: string;
  setFontStyle: (font: string) => void;
  colorScheme: string;
  setColorScheme: (color: string) => void;
  animation: string;
  setAnimation: (animation: string) => void;
}

const TextCustomization: React.FC<TextCustomizationProps> = ({
  fontStyle,
  setFontStyle,
  colorScheme,
  setColorScheme,
  animation,
  setAnimation
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Type className="h-4 w-4 mr-2" /> Text Customization
      </h3>
      <p className="text-sm text-gray-500">
        Customize the text overlays that will appear in your video
      </p>
      
      <div className="space-y-3">
        <div>
          <Label>Font Style</Label>
          <Select value={fontStyle} onValueChange={setFontStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="montserrat">Montserrat</SelectItem>
              <SelectItem value="oswald">Oswald</SelectItem>
              <SelectItem value="roboto">Roboto</SelectItem>
              <SelectItem value="poppins">Poppins</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Color Scheme</Label>
          <Select value={colorScheme} onValueChange={setColorScheme}>
            <SelectTrigger>
              <SelectValue placeholder="Select color scheme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purple">Purple & Teal</SelectItem>
              <SelectItem value="red">Red & Black</SelectItem>
              <SelectItem value="blue">Blue & Yellow</SelectItem>
              <SelectItem value="green">Green & White</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Animation Style</Label>
          <Select value={animation} onValueChange={setAnimation}>
            <SelectTrigger>
              <SelectValue placeholder="Select animation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fade">Fade In</SelectItem>
              <SelectItem value="zoom">Zoom</SelectItem>
              <SelectItem value="slide">Slide</SelectItem>
              <SelectItem value="bounce">Bounce</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm font-medium">Dynamic Text Variables</p>
        <p className="text-xs text-gray-500 mt-1">
          The following variables will be replaced with actual product data:
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-100 p-1 rounded">$product_title</div>
          <div className="bg-gray-100 p-1 rounded">$price</div>
          <div className="bg-gray-100 p-1 rounded">$discount_percentage</div>
          <div className="bg-gray-100 p-1 rounded">$rating</div>
        </div>
      </div>
    </div>
  );
};

export default TextCustomization;
