import { Product } from '@/types/product';

// Sample product images for demo purposes
const sampleProductImages = [
  'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96804.jpg',
  'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96805.jpg',
  'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96806.jpg'
];

/**
 * Validates if a string is a proper Temu product URL
 */
export const validateTemuUrl = (url: string): boolean => {
  // Enhanced validation that also accepts mobile URLs
  const temuUrlPattern = /^https?:\/\/(?:www\.|m\.)?temu\.com(?:\/us)?\/(?:[\w-]+\.html|products\/[\w-]+)/i;
  return temuUrlPattern.test(url);
};

/**
 * Extracts product ID from a Temu URL
 */
export const extractProductIdFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Handle different URL formats
    // For paths like: /product-123456.html
    const productFileMatch = pathParts[pathParts.length - 1].match(/product-([a-zA-Z0-9]+)\.html/);
    if (productFileMatch) {
      return productFileMatch[1];
    }
    
    // For paths like: /products/123456
    if (pathParts.includes('products') && pathParts.length > 2) {
      return pathParts[pathParts.indexOf('products') + 1];
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

// This function simulates extracting product data from a Temu URL
// In a real application, this would call an API to fetch actual product data
export const extractProductData = (url: string): Product => {
  // Try to extract product ID from URL
  const productId = extractProductIdFromUrl(url) || Math.random().toString(36).substring(2, 9);
  
  // Generate random values for demo purposes
  const reviewCount = Math.floor(Math.random() * 500) + 50;
  const ratingValue = (Math.random() * 1.5 + 3.5).toFixed(1); // Random rating between 3.5 and 5.0
  const priceValue = Math.floor(Math.random() * 30) + 10; // Random price between $10 and $39 (as a number)
  
  // Sample product names for demo
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Portable Bluetooth Speaker',
    'Ergonomic Laptop Stand',
    'LED Desk Lamp with USB Port',
    'Foldable Phone Stand',
    'Noise Cancelling Earbuds',
    'Wireless Charging Pad',
    'Smart Watch Fitness Tracker',
    'Mini Portable Power Bank',
    'HD Webcam with Microphone'
  ];
  
  // Select a random product name
  const productName = productNames[Math.floor(Math.random() * productNames.length)];
  
  // Create product description
  const productDescription = `High-quality ${productName.toLowerCase()} with premium features. Perfect for everyday use with long battery life and durable construction. One of our bestselling products with great customer satisfaction.`;
  
  // Calculate discount information
  const originalPrice = (priceValue * (1 + Math.random() * 0.5)).toFixed(2);
  const discountPercentage = Math.floor((1 - (priceValue / parseFloat(originalPrice))) * 100);
  
  return {
    id: productId,
    title: productName,
    price: priceValue, // Now a number
    description: productDescription,
    images: sampleProductImages,
    rating: parseFloat(ratingValue),
    reviews: reviewCount,
    originalPrice: originalPrice,
    discount: `${discountPercentage}%`
  };
};
