
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Video, Zap, BarChart, Paintbrush, Repeat } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Automate Your <span className="gradient-text">YouTube Shorts</span> For Affiliate Marketing
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Turn Temu product links into engaging YouTube Shorts with just a few clicks. No video editing skills required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="text-lg h-12 px-8 gradient-bg">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" className="text-lg h-12 px-8">
                  See How It Works
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="relative aspect-video max-w-2xl mx-auto rounded-md overflow-hidden border">
                {/* This would be a video or animation showing the product in action */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-teal/20 flex items-center justify-center">
                  <Video className="h-16 w-16 text-brand-purple/50" />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 bg-gray-50 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              Create Viral Shorts in <span className="text-brand-purple">Three Simple Steps</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm card-hover border">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-brand-purple">1</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Paste a Temu Link</h3>
                <p className="text-gray-600">
                  Simply copy any Temu product URL and paste it into Shortify. We'll automatically extract all the product details.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm card-hover border">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-brand-purple">2</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Customize Your Video</h3>
                <p className="text-gray-600">
                  Select from pre-designed templates, add text overlays, choose music, and personalize your Short to stand out.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm card-hover border">
                <div className="w-12 h-12 rounded-full bg-brand-purple/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-brand-purple">3</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Publish to YouTube</h3>
                <p className="text-gray-600">
                  Publish immediately or schedule for later. We'll handle the upload process and optimize your video metadata.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link to="/signup">
                <Button className="btn-primary flex items-center">
                  Start Creating Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              Powerful Features for Affiliate Marketers
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
              Everything you need to create engaging, high-converting YouTube Shorts for your affiliate marketing business.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg card-hover">
                <Zap className="h-8 w-8 text-brand-purple mb-4" />
                <h3 className="text-xl font-bold mb-2">One-Click Creation</h3>
                <p className="text-gray-600">
                  Generate professional-quality Shorts with just a product URL. No video editing skills required.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg card-hover">
                <Paintbrush className="h-8 w-8 text-brand-purple mb-4" />
                <h3 className="text-xl font-bold mb-2">Custom Templates</h3>
                <p className="text-gray-600">
                  Choose from a variety of eye-catching templates designed specifically for product promotion.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg card-hover">
                <BarChart className="h-8 w-8 text-brand-purple mb-4" />
                <h3 className="text-xl font-bold mb-2">Optimized Metadata</h3>
                <p className="text-gray-600">
                  Auto-generate titles, descriptions, and hashtags that are proven to perform well.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg card-hover">
                <Repeat className="h-8 w-8 text-brand-purple mb-4" />
                <h3 className="text-xl font-bold mb-2">Batch Processing</h3>
                <p className="text-gray-600">
                  Create multiple Shorts at once to save time and keep your content pipeline full.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg card-hover">
                <Video className="h-8 w-8 text-brand-purple mb-4" />
                <h3 className="text-xl font-bold mb-2">Direct Publishing</h3>
                <p className="text-gray-600">
                  Publish directly to YouTube or schedule your videos for optimal posting times.
                </p>
              </div>
              
              <div className="p-6 border rounded-lg card-hover">
                <BarChart className="h-8 w-8 text-brand-purple mb-4" />
                <h3 className="text-xl font-bold mb-2">Performance Tracking</h3>
                <p className="text-gray-600">
                  Monitor the performance of your Shorts to optimize your affiliate marketing strategy.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-brand-purple to-brand-teal text-white">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Creating Engaging YouTube Shorts Today
            </h2>
            <p className="text-xl mb-8">
              Join thousands of affiliate marketers who are using Shortify to create professional YouTube Shorts in minutes.
            </p>
            <Link to="/signup">
              <Button className="bg-white text-brand-purple hover:bg-gray-100 text-lg h-12 px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
