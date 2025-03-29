
import { toast } from 'sonner';

/**
 * Helper function to display test results
 */
export const displayTestResults = (
  testName: string,
  results: boolean[],
  validationNames?: string[]
) => {
  const allPassed = results.every(passed => passed);
  const passedCount = results.filter(r => r).length;
  const total = results.length;
  
  if (allPassed) {
    toast.success(`${testName} tests passed! (${passedCount}/${total})`);
  } else {
    toast.error(`Some ${testName} tests failed. (${passedCount}/${total})`);
  }
  
  return { success: allPassed, total, passed: passedCount };
};
