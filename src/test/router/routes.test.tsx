import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../utils/testHelpers';
import App from '@/App';

vi.mock('@/components/auth/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: '1', email: 'test@example.com' },
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('Router Tests', () => {
  describe('Public Routes', () => {
    it('should render home page at /', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });

    it('should render sign in page at /signin', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/signin']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render sign up page at /signup', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/signup']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render 404 page for invalid routes', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/invalid-route']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    beforeEach(() => {
      vi.mock('@/components/auth/AuthContext', () => ({
        AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useAuth: () => ({
          isAuthenticated: false,
          user: null,
          signIn: vi.fn(),
          signOut: vi.fn(),
        }),
      }));
    });

    it('should redirect to login when accessing dashboard without auth', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render dashboard when authenticated', () => {
      vi.mock('@/components/auth/AuthContext', () => ({
        AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        useAuth: () => ({
          isAuthenticated: true,
          user: { id: '1', email: 'test@example.com' },
          signIn: vi.fn(),
          signOut: vi.fn(),
        }),
      }));

      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should render link extractor when authenticated', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/link-extractor']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /enhanced link extractor/i })).toBeInTheDocument();
    });

    it('should redirect to signin when not authenticated', () => {
      localStorage.removeItem('isAuthenticated');
      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Auth Callback Routes', () => {
    it('should handle YouTube callback route', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/auth/youtube/callback?code=test-code']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByText(/processing youtube authentication/i)).toBeInTheDocument();
    });

    it('should handle YouTube auth callback', async () => {
      const mockCode = 'test-auth-code';
      renderWithProviders(
        <MemoryRouter initialEntries={[`/auth/youtube/callback?code=${mockCode}`]}>
          <App />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/processing authentication/i)).toBeInTheDocument();
      });
    });
  });

  describe('Route Transitions', () => {
    it('should preserve state during navigation', () => {
      const { rerender } = renderWithProviders(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );

      // Navigate to link extractor
      rerender(
        <MemoryRouter initialEntries={['/link-extractor']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /enhanced link extractor/i })).toBeInTheDocument();
    });

    it('should handle browser back navigation', () => {
      const { rerender } = renderWithProviders(
        <MemoryRouter initialEntries={['/link-extractor']}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );
      
      // Simulate back navigation
      rerender(
        <MemoryRouter initialEntries={['/link-extractor', '/']} initialIndex={1}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });

    it('should handle navigation between routes', async () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      );
      
      // Initial route
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
      
      // Navigate to sign in
      const signInLink = screen.getByRole('link', { name: /sign in/i });
      signInLink.click();
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });

  describe('Route Guards', () => {
    it('should redirect unauthenticated users from protected routes', () => {
      localStorage.removeItem('isAuthenticated');
      const protectedRoutes = ['/dashboard', '/link-extractor'];

      protectedRoutes.forEach(route => {
        renderWithProviders(
          <MemoryRouter initialEntries={route}>
            <App />
          </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it('should redirect authenticated users from auth routes', () => {
      localStorage.setItem('isAuthenticated', 'true');
      const authRoutes = ['/signin', '/signup'];

      authRoutes.forEach(route => {
        renderWithProviders(
          <MemoryRouter initialEntries={route}>
            <App />
          </MemoryRouter>
        );
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      });
    });
  });

  describe('Query Parameter Handling', () => {
    it('should handle routes with query parameters', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/link-extractor?url=https://www.temu.com/product-123.html']}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByRole('heading', { name: /enhanced link extractor/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://www.temu.com/product-123.html')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should catch and display route errors', () => {
      // Mock a route that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <MemoryRouter initialEntries={['/error']}>
          <ErrorComponent />
        </MemoryRouter>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Route Parameters', () => {
    it('should handle dynamic route parameters', () => {
      renderWithProviders(
        <MemoryRouter initialEntries={['/link-extractor?url=https://example.com']}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('textbox')).toHaveValue('https://example.com');
    });
  });

  describe('Query Parameters', () => {
    it('should preserve query parameters during navigation', () => {
      const testUrl = 'https://example.com/product';
      renderWithProviders(
        <MemoryRouter initialEntries={[`/link-extractor?url=${encodeURIComponent(testUrl)}`]}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('textbox')).toHaveValue(testUrl);
    });

    it('should handle multiple query parameters', () => {
      const testUrl = 'https://example.com/product';
      const testTemplate = 'flash-deal';
      renderWithProviders(
        <MemoryRouter initialEntries={[
          `/link-extractor?url=${encodeURIComponent(testUrl)}&template=${testTemplate}`
        ]}>
          <App />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('textbox')).toHaveValue(testUrl);
      expect(screen.getByRole('combobox')).toHaveValue(testTemplate);
    });
  });
}); 