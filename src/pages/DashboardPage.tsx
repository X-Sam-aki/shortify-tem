
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Dashboard from '@/components/dashboard/Dashboard';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  
  // Redirect to sign in page if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/signin" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
          </div>
        ) : (
          <Dashboard />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
