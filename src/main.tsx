
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './components/auth/AuthContext'
import App from './App'
import './index.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Modern @tanstack/react-query no longer uses 'cacheTime'
      // Using 'gcTime' instead which is the new name for the same functionality
      gcTime: 1000 * 60 * 30 // 30 minutes
    },
  },
})

// Correctly wrap the app with the required providers
// Ensure proper nesting of providers with React.StrictMode outermost
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
