
import { Product } from '@/types/product';

// Sample product images for demo purposes
const sampleProductImages = [
  'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96804.jpg',
  'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96805.jpg',
  'https://img.freepik.com/free-photo/pink-headphones-wireless-digital-device_53876-96806.jpg'
];

// This function simulates extracting product data from a Temu URL
// In a real application, this would call an API to fetch actual product data
export const extractProductData = (url: string): Product => {
  // Generate random values for demo purposes
  const productId = Math.random().toString(36).substring(2, 9);
  const reviewCount = Math.floor(Math.random() * 500) + 50;
  const ratingValue = (Math.random() * 1.5 + 3.5).toFixed(1); // Random rating between 3.5 and 5.0
  const priceValue = (Math.random() * 30 + 9.99).toFixed(2); // Random price between $9.99 and $39.99
  
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
  const originalPrice = (parseFloat(priceValue) * (1 + Math.random() * 0.5)).toFixed(2);
  const discountPercentage = Math.floor((1 - (parseFloat(priceValue) / parseFloat(originalPrice))) * 100);
  
  return {
    id: productId,
    title: productName,
    price: priceValue,
    description: productDescription,
    images: sampleProductImages,
    rating: parseFloat(ratingValue),
    reviews: reviewCount,
    originalPrice: originalPrice,
    discount: `${discountPercentage}%`
  };
};
