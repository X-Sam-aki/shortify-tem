import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductInput from './ProductInput';
import VideoCustomization from './video-customization';
import Publishing from './Publishing';
import TestPanel from './TestPanel';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FlaskConical } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';
import { toast } from 'sonner';
import DashboardHeader from './DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const {
    activeTab,
    product,
    videoSettings,
    lastSaved,
    setActiveTab,
    setProduct,
    setVideoSettings,
    resetProgress
  } = useProgress();
  
  const handleProductSubmit = (productData: any) => {
    setProduct(productData);
    toast.success('Product information saved');
  };
  
  const handleCustomizationComplete = (settings: any) => {
    setVideoSettings(settings);
    toast.success('Video customization saved');
  };
  
  const goBack = () => {
    if (activeTab === "customize") setActiveTab("product");
    if (activeTab === "publish") setActiveTab("customize");
    if (activeTab === "test") setActiveTab("publish");
  };
  
  const getProgressPercentage = () => {
    if (activeTab === "product") return 25;
    if (activeTab === "customize") return 50;
    if (activeTab === "publish") return 75;
    if (activeTab === "test") return 100;
    return 0;
  };

  const handleSaveProgress = () => {
    toast.success('Progress saved successfully');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader 
        lastSaved={lastSaved}
        onSave={handleSaveProgress}
        onReset={resetProgress}
      />
      
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
          <span>Testing</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="product">1. Product</TabsTrigger>
          <TabsTrigger value="customize" disabled={!product}>2. Customize</TabsTrigger>
          <TabsTrigger value="publish" disabled={!product || activeTab === "product"}>3. Publish</TabsTrigger>
          <TabsTrigger value="test" disabled={!product || activeTab === "product"}>4. Test</TabsTrigger>
        </TabsList>
        
        <TabsContent value="product" className="mt-6">
          <ProductInput onSubmit={handleProductSubmit} savedProduct={product} />
        </TabsContent>
        
        <TabsContent value="customize" className="mt-6">
          {product && (
            <>
              <VideoCustomization 
                product={product} 
                onComplete={handleCustomizationComplete}
                savedSettings={videoSettings}
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
        
        <TabsContent value="test" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <TestPanel />
            </div>
            <div className="md:col-span-1">
              <Card className="bg-brand-purple/5 border-brand-purple/30">
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center">
                    <FlaskConical className="h-4 w-4 mr-2 text-brand-purple" />
                    Testing Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 space-y-2 text-xs">
                  <p>• Run core feature tests before publishing</p>
                  <p>• Test with multiple product URLs</p>
                  <p>• Verify template compatibility</p>
                  <p>• Check video generation speed</p>
                  <p>• Ensure error messages are clear</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <Button 
              variant="outline" 
              onClick={goBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
