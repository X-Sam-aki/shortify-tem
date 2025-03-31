# Testing Documentation

## Overview
This document outlines the testing strategy and implementation for the Shortify application, with a focus on the Link Extractor functionality.

## Test Structure
```
src/test/
├── components/              # Component tests
│   └── EnhancedLinkExtractor.test.tsx
├── core/                   # Core functionality tests
│   └── linkExtractor.test.ts
├── performance/            # Performance tests
│   └── linkExtractor.perf.ts
├── router/                 # Router tests
│   └── routes.test.tsx
├── utils/                  # Test utilities
│   └── testHelpers.ts
├── setup.ts               # Test setup configuration
└── README.md              # This documentation
```

## Test Categories

### 1. Core Functionality Tests
- URL validation
- Product data extraction
- Data validation
- Error handling
- Rate limiting

### 2. Component Tests
- Initial render
- User interactions
- Data display
- Error states
- Loading states
- Accessibility

### 3. Router Tests
- Public routes
- Protected routes
- Auth callbacks
- Route transitions
- Route guards
- Query parameters
- Error boundaries

### 4. Performance Tests
- Response time
- Memory usage
- Cache performance
- Load testing
- Error recovery
- Resource cleanup

## Running Tests

### All Tests
```bash
npm test
```

### Specific Categories
```bash
# Run component tests
npm test components

# Run core functionality tests
npm test core

# Run performance tests
npm test performance

# Run router tests
npm test router
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Coverage
To generate test coverage report:
```bash
npm test -- --coverage
```

Coverage thresholds:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Writing Tests

### Component Tests
1. Use React Testing Library
2. Focus on user interactions
3. Test accessibility
4. Mock external dependencies
5. Test error states

Example:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  render(<Component />);
  await userEvent.type(screen.getByRole('textbox'), 'test');
  expect(screen.getByDisplayValue('test')).toBeInTheDocument();
});
```

### Performance Tests
1. Measure response times
2. Test concurrent operations
3. Monitor memory usage
4. Test cache effectiveness
5. Simulate load conditions

Example:
```typescript
it('should perform within time limit', async () => {
  const startTime = performance.now();
  await operation();
  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(1000);
});
```

## Mocking

### Network Requests
```typescript
vi.mock('fetch', () => ({
  default: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData)
  })
}));
```

### Time
```typescript
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

## Best Practices

1. **Isolation**
   - Tests should be independent
   - Clean up after each test
   - Use beforeEach/afterEach hooks

2. **Readability**
   - Clear test descriptions
   - Well-organized test suites
   - Meaningful variable names

3. **Maintenance**
   - Keep tests DRY
   - Use shared utilities
   - Update tests with code changes

4. **Performance**
   - Mock expensive operations
   - Use appropriate timeouts
   - Clean up resources

5. **Coverage**
   - Test edge cases
   - Include error scenarios
   - Test async operations

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Merges to main branch
- Release tags

### CI Pipeline
1. Install dependencies
2. Run linter
3. Run tests
4. Generate coverage report
5. Check coverage thresholds

## Troubleshooting

### Common Issues

1. **Timeouts**
   - Increase timeout in test config
   - Check for infinite loops
   - Verify async operations

2. **Memory Leaks**
   - Clean up subscriptions
   - Dispose of resources
   - Check for retained references

3. **Flaky Tests**
   - Add proper wait conditions
   - Avoid timing dependencies
   - Use stable selectors

## Contributing

1. Follow existing test patterns
2. Update documentation
3. Maintain coverage levels
4. Add test cases for bugs
5. Review test results 