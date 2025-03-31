import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { AuthProvider } from '@/components/auth/AuthContext';

const renderWithRouter = (initialEntries = ['/', { state: {} }]) => {
  return render(
    <MemoryRouter initialEntries={[initialEntries]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Router Tests', () => {
  describe('Public Routes', () => {
    it('should render home page at /', () => {
      renderWithRouter('/');
      expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    });

    it('should render sign in page at /signin', () => {
      renderWithRouter('/signin');
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render sign up page at /signup', () => {
      renderWithRouter('/signup');
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render 404 page for invalid routes', () => {
      renderWithRouter('/invalid-route');
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    beforeEach(() => {
      // Mock authenticated state
      localStorage.setItem('isAuthenticated', 'true');
    });

    it('should render dashboard when authenticated', () => {
      renderWithRouter('/dashboard');
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    it('should render link extractor when authenticated', () => {
      renderWithRouter('/link-extractor');
      expect(screen.getByRole('heading', { name: /enhanced link extractor/i })).toBeInTheDocument();
    });

    it('should redirect to signin when not authenticated', () => {
      localStorage.removeItem('isAuthenticated');
      renderWithRouter('/dashboard');
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Auth Callback Routes', () => {
    it('should handle YouTube callback route', () => {
      renderWithRouter('/auth/youtube/callback?code=test-code');
      expect(screen.getByText(/processing youtube authentication/i)).toBeInTheDocument();
    });
  });

  describe('Route Transitions', () => {
    it('should preserve state during navigation', () => {
      const { rerender } = renderWithRouter('/');
      
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
      const { rerender } = renderWithRouter('/link-extractor');
      
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
  });

  describe('Route Guards', () => {
    it('should redirect unauthenticated users from protected routes', () => {
      localStorage.removeItem('isAuthenticated');
      const protectedRoutes = ['/dashboard', '/link-extractor'];

      protectedRoutes.forEach(route => {
        renderWithRouter(route);
        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it('should redirect authenticated users from auth routes', () => {
      localStorage.setItem('isAuthenticated', 'true');
      const authRoutes = ['/signin', '/signup'];

      authRoutes.forEach(route => {
        renderWithRouter(route);
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      });
    });
  });

  describe('Query Parameter Handling', () => {
    it('should handle routes with query parameters', () => {
      renderWithRouter('/link-extractor?url=https://www.temu.com/product-123.html');
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
}); 