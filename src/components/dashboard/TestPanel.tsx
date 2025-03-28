
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FlaskConical, CheckCircle2, XCircle } from 'lucide-react';
import { testUrlValidation, testProductExtraction, testVideoGeneration, runAllTests } from '@/utils/testing';
import { Product } from '@/types/product';
import { extractProductData } from '@/utils/productUtils';

const TestPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('core');
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    urlValidation?: { success: boolean; total: number; passed: number };
    productExtraction?: { success: boolean; product?: Product };
    videoGeneration?: { success: boolean };
  }>({});

  const handleRunCoreTests = async () => {
    setIsRunningTests(true);
    
    try {
      // Test URL validation
      const urlResults = testUrlValidation();
      setTestResults(prev => ({ ...prev, urlValidation: urlResults }));
      
      // Test product extraction
      const productResults = testProductExtraction();
      setTestResults(prev => ({ ...prev, productExtraction: productResults }));
      
      if (productResults.success && productResults.product) {
        // Test video generation with a sample product
        const videoOptions = {
          template: 'flash-deal',
          music: 'upbeat',
          fontStyle: 'montserrat',
          colorScheme: 'purple',
          animation: 'fade'
        };
        
        const videoResults = await testVideoGeneration(productResults.product, videoOptions);
        setTestResults(prev => ({ ...prev, videoGeneration: videoResults }));
      }
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };
  
  const handleRunAllTests = async () => {
    setIsRunningTests(true);
    try {
      await runAllTests();
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FlaskConical className="h-5 w-5 mr-2 text-brand-purple" />
          <span>Test & Validation Panel</span>
        </CardTitle>
        <CardDescription>
          Run tests to validate functionality of your Shortify app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="core">Core Features</TabsTrigger>
            <TabsTrigger value="ui">UI/UX</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="core" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Temu API Tests</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="border rounded p-3 text-sm">
                  <div className="font-medium mb-1">URL Validation</div>
                  {testResults.urlValidation ? (
                    <div className="flex items-center">
                      {testResults.urlValidation.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span>
                        {testResults.urlValidation.passed}/{testResults.urlValidation.total} tests passed
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Not tested</span>
                  )}
                </div>
                
                <div className="border rounded p-3 text-sm">
                  <div className="font-medium mb-1">Product Extraction</div>
                  {testResults.productExtraction ? (
                    <div className="flex items-center">
                      {testResults.productExtraction.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span>
                        {testResults.productExtraction.success ? 'Data extracted' : 'Failed'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Not tested</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Video Generation Tests</h3>
              <div className="border rounded p-3 text-sm">
                <div className="font-medium mb-1">Video Creation</div>
                {testResults.videoGeneration ? (
                  <div className="flex items-center">
                    {testResults.videoGeneration.success ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span>
                      {testResults.videoGeneration.success ? 'Video generated successfully' : 'Failed to generate video'}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">Not tested</span>
                )}
              </div>
            </div>
            
            <Button 
              onClick={handleRunCoreTests} 
              disabled={isRunningTests}
              className="w-full"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running tests...
                </>
              ) : (
                <>
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Run Core Feature Tests
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="ui" className="space-y-4">
            <div className="p-8 border border-dashed rounded-md flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-4">UI/UX tests require manual verification</p>
              <ul className="text-sm text-left space-y-2 mb-4">
                <li className="flex items-start">
                  <span className="inline-block w-5">◻️</span>
                  Dashboard displays created Shorts correctly
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5">◻️</span>
                  Preview functionality works before publishing
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-5">◻️</span>
                  Templates load and apply correctly
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="p-8 border border-dashed rounded-md flex flex-col items-center justify-center text-center">
              <p className="text-gray-500 mb-4">Performance test suite</p>
              <Button 
                onClick={handleRunAllTests} 
                disabled={isRunningTests}
                className="mb-4"
              >
                {isRunningTests ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Run All Performance Tests
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                This will test video generation speed, API response time, and overall system performance
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-xs text-center text-gray-500">
        Use this panel to validate functionality before publishing to YouTube
      </CardFooter>
    </Card>
  );
};

export default TestPanel;
