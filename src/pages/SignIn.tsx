
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SignInForm from '@/components/auth/SignInForm';

const SignIn = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <SignInForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SignIn;
