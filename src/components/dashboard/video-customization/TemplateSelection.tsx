
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Layout } from 'lucide-react';

interface TemplateSelectionProps {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

const TemplateSelection: React.FC<TemplateSelectionProps> = ({ 
  selectedTemplate, 
  setSelectedTemplate 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center">
        <Layout className="h-4 w-4 mr-2" /> Choose a Template
      </h3>
      <RadioGroup
        value={selectedTemplate}
        onValueChange={setSelectedTemplate}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="flash-deal" id="flash-deal" className="mt-1" />
          <div>
            <Label htmlFor="flash-deal" className="font-medium">Flash Deal</Label>
            <p className="text-sm text-gray-500">High-energy template with price animations</p>
            <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Popular for limited-time offers</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="product-showcase" id="product-showcase" className="mt-1" />
          <div>
            <Label htmlFor="product-showcase" className="font-medium">Product Showcase</Label>
            <p className="text-sm text-gray-500">Clean layout focused on product features</p>
            <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Best for detailed product videos</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="testimonial" id="testimonial" className="mt-1" />
          <div>
            <Label htmlFor="testimonial" className="font-medium">Testimonial Style</Label>
            <p className="text-sm text-gray-500">Displays customer reviews alongside product</p>
            <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Builds trust with social proof</div>
          </div>
        </div>
        
        <div className="flex items-start space-x-2">
          <RadioGroupItem value="before-after" id="before-after" className="mt-1" />
          <div>
            <Label htmlFor="before-after" className="font-medium">Before & After</Label>
            <p className="text-sm text-gray-500">Shows problem/solution comparison</p>
            <div className="mt-2 bg-gray-100 rounded-md p-2 text-xs text-gray-700">Great for transformative products</div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TemplateSelection;
