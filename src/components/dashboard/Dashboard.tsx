
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductInput from './ProductInput';
import VideoCustomization from './VideoCustomization';
import Publishing from './Publishing';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Product } from '@/types/product';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("product");
  const [product, setProduct] = useState<Product | null>(null);
  const [videoSettings, setVideoSettings] = useState({
    template: 'flash-deal',
    music: 'upbeat',
    textOverlays: []
  });
  
  const handleProductSubmit = (productData: Product) => {
    setProduct(productData);
    setActiveTab("customize");
  };
  
  const handleCustomizationComplete = (settings: any) => {
    setVideoSettings(settings);
    setActiveTab("publish");
  };
  
  const goBack = () => {
    if (activeTab === "customize") setActiveTab("product");
    if (activeTab === "publish") setActiveTab("customize");
  };
  
  const getProgressPercentage = () => {
    if (activeTab === "product") return 33;
    if (activeTab === "customize") return 66;
    if (activeTab === "publish") return 100;
    return 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Your YouTube Short</h1>
      
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-purple to-brand-teal transition-all duration-500 ease-in-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Product Input</span>
          <span>Customization</span>
          <span>Publishing</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="product">1. Product</TabsTrigger>
          <TabsTrigger value="customize" disabled={!product}>2. Customize</TabsTrigger>
          <TabsTrigger value="publish" disabled={!product || activeTab !== "publish"}>3. Publish</TabsTrigger>
        </TabsList>
        
        <TabsContent value="product" className="mt-6">
          <ProductInput onSubmit={handleProductSubmit} />
        </TabsContent>
        
        <TabsContent value="customize" className="mt-6">
          {product && (
            <>
              <VideoCustomization 
                product={product} 
                onComplete={handleCustomizationComplete} 
              />
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={goBack}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="publish" className="mt-6">
          {product && (
            <>
              <Publishing product={product} videoSettings={videoSettings} />
              <div className="mt-6 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={goBack}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
