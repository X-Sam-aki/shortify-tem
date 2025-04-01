import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SignUpForm from '@/components/auth/SignUpForm';
import { useAuth } from '@/components/auth/useAuth';

const SignUp = () => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is already authenticated, redirect to dashboard or the attempted location
  if (user) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <SignUpForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignUp;
