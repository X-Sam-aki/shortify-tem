import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Video className="h-6 w-6 text-brand-purple" />
              <span className="font-montserrat font-bold text-xl">Shortify</span>
            </Link>
            <p className="text-gray-600">
              Automate your YouTube Shorts creation for affiliate marketing success.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-600 hover:text-brand-purple">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-brand-purple">Pricing</Link></li>
              <li><Link to="/templates" className="text-gray-600 hover:text-brand-purple">Templates</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-brand-purple">About</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-brand-purple">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-brand-purple">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-600 hover:text-brand-purple">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-brand-purple">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Shortify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
