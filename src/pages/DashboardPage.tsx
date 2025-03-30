import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Dashboard from '@/components/dashboard/Dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, FileVideo, BarChart } from 'lucide-react';
import UserSettings from '@/components/dashboard/UserSettings';

const DashboardPage = () => {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<string>("create");
  
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
          <div className="container mx-auto px-4">
            <Tabs 
              value={activeView} 
              onValueChange={setActiveView}
              className="mb-8"
            >
              <div className="flex justify-center">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="create" className="flex items-center justify-center gap-2">
                    <FileVideo className="h-4 w-4" />
                    <span className="hidden sm:inline">Create</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center justify-center gap-2">
                    <BarChart className="h-4 w-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center justify-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="create">
                <Dashboard />
              </TabsContent>
              
              <TabsContent value="analytics">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <BarChart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Analytics Coming Soon</h2>
                  <p className="text-gray-600">
                    Track the performance of your YouTube Shorts in our upcoming analytics dashboard.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings">
                <UserSettings user={user} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default DashboardPage;
