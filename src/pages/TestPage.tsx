
import React from 'react';
import { SupabaseTest } from '../test/components/SupabaseTest';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TestPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Lovable Template Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <SupabaseTest />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Node Environment:</strong> {import.meta.env.MODE}</p>
              <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
              <p><strong>Lovable Version:</strong> Latest</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;
