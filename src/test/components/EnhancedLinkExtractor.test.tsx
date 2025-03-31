import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnhancedLinkExtractor from '@/components/dashboard/EnhancedLinkExtractor';
import { createMockProduct, mockFetch } from '../utils/testHelpers';

// Mock the toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('EnhancedLinkExtractor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render the component', () => {
      render(<EnhancedLinkExtractor />);
      expect(screen.getByPlaceholderText(/enter temu product url/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /extract/i })).toBeInTheDocument();
    });

    it('should have extract button disabled initially', () => {
      render(<EnhancedLinkExtractor />);
      expect(screen.getByRole('button', { name: /extract/i })).toBeDisabled();
    });

    it('should show example URLs', () => {
      render(<EnhancedLinkExtractor />);
      expect(screen.getByText(/example urls/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(3); // Extract + 2 example URLs
    });
  });

  describe('URL Input Handling', () => {
    it('should enable extract button when URL is entered', async () => {
      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      await userEvent.type(input, 'https://www.temu.com/product-123.html');
      expect(screen.getByRole('button', { name: /extract/i })).toBeEnabled();
    });

    it('should populate URL when clicking example URL button', async () => {
      render(<EnhancedLinkExtractor />);
      const exampleButton = screen.getByText(/product-123456\.html/);
      await userEvent.click(exampleButton);
      expect(screen.getByPlaceholderText(/enter temu product url/i)).toHaveValue('https://www.temu.com/product-123456.html');
    });
  });

  describe('Data Extraction', () => {
    it('should show loading state while extracting', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      await userEvent.type(input, 'https://www.temu.com/product-123.html');
      
      const extractButton = screen.getByRole('button', { name: /extract/i });
      fireEvent.click(extractButton);

      expect(screen.getByRole('button', { name: /extract/i })).toBeDisabled();
      // Should show loading spinner
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should display extracted data after successful fetch', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      await userEvent.type(input, 'https://www.temu.com/product-123.html');
      
      const extractButton = screen.getByRole('button', { name: /extract/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
        expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument();
      });
    });

    it('should show error message on failed extraction', async () => {
      mockFetch({ error: 'Failed to extract data' });

      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      await userEvent.type(input, 'https://www.temu.com/product-123.html');
      
      const extractButton = screen.getByRole('button', { name: /extract/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to extract data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Selection', () => {
    beforeEach(async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      await userEvent.type(input, 'https://www.temu.com/product-123.html');
      
      const extractButton = screen.getByRole('button', { name: /extract/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
      });
    });

    it('should toggle data visibility when checkboxes are clicked', async () => {
      const titleCheckbox = screen.getByRole('checkbox', { name: /title/i });
      await userEvent.click(titleCheckbox);
      
      // Switch to preview tab
      const previewTab = screen.getByRole('tab', { name: /preview/i });
      await userEvent.click(previewTab);

      expect(screen.queryByText(/test product/i)).not.toBeInTheDocument();
    });

    it('should update preview when selections change', async () => {
      const priceCheckbox = screen.getByRole('checkbox', { name: /price/i });
      await userEvent.click(priceCheckbox);
      
      const previewButton = screen.getByRole('button', { name: /preview selected/i });
      await userEvent.click(previewButton);

      expect(screen.queryByText(/\$29\.99/)).not.toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should generate export file with selected data', async () => {
      const mockProduct = createMockProduct();
      mockFetch(mockProduct);

      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      await userEvent.type(input, 'https://www.temu.com/product-123.html');
      
      const extractButton = screen.getByRole('button', { name: /extract/i });
      fireEvent.click(extractButton);

      await waitFor(() => {
        expect(screen.getByText(mockProduct.title)).toBeInTheDocument();
      });

      // Mock URL.createObjectURL and document.createElement
      const createObjectURL = vi.fn();
      const createElement = document.createElement.bind(document);
      
      URL.createObjectURL = createObjectURL;
      document.createElement = vi.fn().mockImplementation((tag) => {
        const element = createElement(tag);
        if (tag === 'a') {
          element.click = vi.fn();
        }
        return element;
      });

      const exportButton = screen.getByRole('button', { name: /export selected/i });
      await userEvent.click(exportButton);

      expect(createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EnhancedLinkExtractor />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-label');
      expect(screen.getByRole('button', { name: /extract/i })).toHaveAttribute('aria-label');
    });

    it('should handle keyboard navigation', async () => {
      render(<EnhancedLinkExtractor />);
      const input = screen.getByPlaceholderText(/enter temu product url/i);
      input.focus();
      expect(document.activeElement).toBe(input);

      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /extract/i }));
    });
  });
}); 