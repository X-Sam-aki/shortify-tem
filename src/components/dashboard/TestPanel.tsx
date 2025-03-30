import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FlaskConical, 
  ListChecks, 
  PlayCircle, 
  Link as LinkIcon, 
  Package, 
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  testUrlValidation, 
  testProductExtraction, 
  testVideoGeneration,
  testTemplateRendering,
  testYouTubePublishing,
  runAllTests 
} from '@/utils/testing';
import TestResults from './TestResults';

const TestPanel = () => {
  const [activeTest, setActiveTest] = useState("all");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [template, setTemplate] = useState("flash-deal");
  
  const handleRunTest = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      let testResults;
      
      switch (activeTest) {
        case "url": {
          testResults = testUrlValidation();
          setResults({ urlValidation: testResults });
          break;
        }
          
        case "product": {
          testResults = await testProductExtraction();
          setResults({ productExtraction: testResults });
          break;
        }
          
        case "template": {
          testResults = testTemplateRendering(template);
          setResults({ templateRendering: testResults });
          break;
        }
          
        case "video": {
          const productResults = await testProductExtraction();
          if (productResults.success && productResults.product) {
            const videoOptions = {
              template,
              music: 'upbeat',
              fontStyle: 'montserrat',
              colorScheme: 'purple',
              animation: 'fade'
            };
            
            const videoResults = await testVideoGeneration(productResults.product, videoOptions);
            setResults({ 
              productExtraction: productResults,
              videoGeneration: videoResults 
            });
          } else {
            toast.error('Product extraction failed. Cannot test video generation.');
            setResults({ productExtraction: productResults });
          }
          break;
        }
          
        case "all":
        default: {
          const allResults = await runAllTests();
          setResults(allResults.results);
          break;
        }
      }
    } catch (error) {
      console.error('Test execution error:', error);
      toast.error('An error occurred while running tests');
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <FlaskConical className="h-5 w-5 mr-2 text-brand-purple" />
          Test Suite
        </CardTitle>
        <CardDescription>
          Verify functionality and system performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTest} onValueChange={setActiveTest} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="text-xs">
              <ListChecks className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">All Tests</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs">
              <LinkIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">URL</span>
            </TabsTrigger>
            <TabsTrigger value="product" className="text-xs">
              <Package className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Product</span>
            </TabsTrigger>
            <TabsTrigger value="template" className="text-xs">
              <PlayCircle className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Template</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="text-xs">
              <Video className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="template">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Template</label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flash-deal">Flash Deal</SelectItem>
                  <SelectItem value="product-showcase">Product Showcase</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="before-after">Before & After</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <div className="mt-4">
            <TestResults results={results} isRunning={isRunning} />
          </div>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRunTest} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <FlaskConical className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <FlaskConical className="mr-2 h-4 w-4" />
              Run {activeTest === "all" ? "All Tests" : `${activeTest.charAt(0).toUpperCase()}${activeTest.slice(1)} Test`}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TestPanel;
