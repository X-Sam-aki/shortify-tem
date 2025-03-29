
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/custom-badge";
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface TestResultProps {
  name: string;
  success: boolean;
  total?: number;
  passed?: number;
  description?: string;
  details?: React.ReactNode;
}

const TestResult: React.FC<TestResultProps> = ({ 
  name, 
  success, 
  total, 
  passed, 
  description,
  details
}) => {
  const passRate = total && passed ? Math.round((passed / total) * 100) : (success ? 100 : 0);
  
  return (
    <Card className={`${success ? 'border-green-200' : 'border-red-200'}`}>
      <CardHeader className="py-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            {success ? (
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 mr-2 text-red-500" />
            )}
            {name}
          </CardTitle>
          <Badge variant={success ? "success" : "destructive"} className="text-xs">
            {success ? 'PASSED' : 'FAILED'}
          </Badge>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="py-2">
        {total !== undefined && passed !== undefined && (
          <div className="mb-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${success ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${passRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{passed} passed</span>
              <span>{total - passed} failed</span>
              <span>{passRate}%</span>
            </div>
          </div>
        )}
        {details && <div className="mt-2">{details}</div>}
      </CardContent>
    </Card>
  );
};

interface TestResultsProps {
  results: any;
  isRunning: boolean;
}

const TestResults: React.FC<TestResultsProps> = ({ results, isRunning }) => {
  if (isRunning) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Running tests...</AlertTitle>
        <AlertDescription>
          Tests are currently running. Results will appear here when complete.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!results) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No test results</AlertTitle>
        <AlertDescription>
          Run tests to see results here.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-4">
      {results.urlValidation && (
        <TestResult 
          name="URL Validation"
          success={results.urlValidation.success}
          total={results.urlValidation.total}
          passed={results.urlValidation.passed}
          description="Testing various Temu URL formats"
        />
      )}
      
      {results.productExtraction && (
        <TestResult 
          name="Product Extraction"
          success={results.productExtraction.success}
          total={results.productExtraction.total}
          passed={results.productExtraction.passedCount}
          description="Verifying product data retrieval and structure"
        />
      )}
      
      {results.templateRendering && (
        <TestResult 
          name="Template Rendering"
          success={results.templateRendering.success}
          description="Testing template compatibility with different product types"
        />
      )}
      
      {results.videoGeneration && (
        <TestResult 
          name="Video Generation"
          success={results.videoGeneration.success}
          description="Testing video creation process"
          details={
            results.videoGeneration.result && (
              <div className="mt-2 text-xs text-gray-600">
                {results.videoGeneration.result.videoUrl && (
                  <div>Video URL: {results.videoGeneration.result.videoUrl.substring(0, 30)}...</div>
                )}
                {results.videoGeneration.result.thumbnailUrl && (
                  <div>Thumbnail: {results.videoGeneration.result.thumbnailUrl.substring(0, 30)}...</div>
                )}
              </div>
            )
          }
        />
      )}
    </div>
  );
};

export default TestResults;
