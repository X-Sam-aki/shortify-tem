import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LinkExtractor } from '../LinkExtractor';
import { extractProductData } from '@/utils/productUtils';

// Mock the productUtils
vi.mock('@/utils/productUtils', () => ({
  extractProductData: vi.fn(),
}));

// Create a test query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Mock product data
const mockProduct = {
  id: '123',
  title: 'Test Product',
  price: 29.99,
  description: 'A test product description',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  rating: 4.5,
  reviews: 100,
  originalPrice: 39.99,
  discount: 25,
  timestamp: new Date().toISOString(),
  url: 'https://www.temu.com/product-123.html',
  platform: 'Temu',
  aiEnhanced: true,
};

describe('LinkExtractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders the link extractor interface', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <LinkExtractor />
      </QueryClientProvider>
    );

    expect(screen.getByText('Enhanced Link Extractor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter product URL...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /extract/i })).toBeInTheDocument();
  });

  it('handles URL submission', async () => {
    const mockUrl = 'https://www.temu.com/product-123.html';
    (extractProductData as any).mockResolvedValue(mockProduct);

    render(
      <QueryClientProvider client={queryClient}>
        <LinkExtractor />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Enter product URL...');
    const submitButton = screen.getByRole('button', { name: /extract/i });

    fireEvent.change(input, { target: { value: mockUrl } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  it('displays loading state while extracting data', async () => {
    (extractProductData as any).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <QueryClientProvider client={queryClient}>
        <LinkExtractor />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Enter product URL...');
    const submitButton = screen.getByRole('button', { name: /extract/i });

    fireEvent.change(input, { target: { value: 'https://www.temu.com/product-123.html' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Extracting...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Extracting...')).not.toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    const errorMessage = 'Failed to extract data';
    (extractProductData as any).mockRejectedValue(new Error(errorMessage));

    render(
      <QueryClientProvider client={queryClient}>
        <LinkExtractor />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Enter product URL...');
    const submitButton = screen.getByRole('button', { name: /extract/i });

    fireEvent.change(input, { target: { value: 'https://www.temu.com/product-123.html' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(`Error extracting data: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('allows toggling data selection', async () => {
    (extractProductData as any).mockResolvedValue(mockProduct);

    render(
      <QueryClientProvider client={queryClient}>
        <LinkExtractor />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Enter product URL...');
    const submitButton = screen.getByRole('button', { name: /extract/i });

    fireEvent.change(input, { target: { value: 'https://www.temu.com/product-123.html' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const titleCheckbox = screen.getByRole('checkbox', { name: /title/i });
    fireEvent.click(titleCheckbox);

    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });

  it('exports selected data', async () => {
    (extractProductData as any).mockResolvedValue(mockProduct);

    render(
      <QueryClientProvider client={queryClient}>
        <LinkExtractor />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText('Enter product URL...');
    const submitButton = screen.getByRole('button', { name: /extract/i });

    fireEvent.change(input, { target: { value: 'https://www.temu.com/product-123.html' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    const exportTab = screen.getByRole('tab', { name: /export/i });
    fireEvent.click(exportTab);

    const exportButton = screen.getByRole('button', { name: /export as json/i });
    fireEvent.click(exportButton);

    // Note: We can't test the actual file download in the test environment
    // but we can verify that the button is present and clickable
    expect(exportButton).toBeInTheDocument();
  });
}); 