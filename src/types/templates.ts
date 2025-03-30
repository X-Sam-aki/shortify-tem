export interface TextOverlay {
  text: string;
  position: 'top' | 'center' | 'bottom' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';
  style: 'bold' | 'italic' | 'normal';
  fontSize?: number;
  color?: string;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  duration: number;
  transitions: string[];
  textOverlays: TextOverlay[];
  defaultSettings: {
    fontStyle: string;
    colorScheme: string;
    animation: string;
  };
}

export const videoTemplates: VideoTemplate[] = [
  {
    id: 'flash-deal',
    name: 'Flash Deal',
    description: 'Perfect for time-sensitive offers and promotions',
    duration: 15,
    transitions: ['fade', 'slide'],
    textOverlays: [
      { text: 'FLASH DEAL!', position: 'top', style: 'bold', fontSize: 60 },
      { text: 'Limited Time Offer', position: 'bottom', style: 'italic', fontSize: 40 }
    ],
    defaultSettings: {
      fontStyle: 'Montserrat',
      colorScheme: '#FF0000',
      animation: 'fade'
    }
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Highlight your product features and benefits',
    duration: 30,
    transitions: ['zoom', 'fade'],
    textOverlays: [
      { text: 'Featured Product', position: 'center', style: 'bold', fontSize: 50 },
      { text: 'Check it out!', position: 'bottom', style: 'italic', fontSize: 40 }
    ],
    defaultSettings: {
      fontStyle: 'Roboto',
      colorScheme: '#000000',
      animation: 'zoom'
    }
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Share customer reviews and feedback',
    duration: 20,
    transitions: ['fade', 'slide'],
    textOverlays: [
      { text: 'Customer Review', position: 'top', style: 'bold', fontSize: 50 },
      { text: 'What they say', position: 'bottom', style: 'italic', fontSize: 40 }
    ],
    defaultSettings: {
      fontStyle: 'Open Sans',
      colorScheme: '#4A90E2',
      animation: 'fade'
    }
  },
  {
    id: 'before-after',
    name: 'Before & After',
    description: 'Compare before and after results',
    duration: 25,
    transitions: ['slide', 'fade'],
    textOverlays: [
      { text: 'Before & After', position: 'top', style: 'bold', fontSize: 50 },
      { text: 'See the difference', position: 'bottom', style: 'italic', fontSize: 40 }
    ],
    defaultSettings: {
      fontStyle: 'Lato',
      colorScheme: '#2ECC71',
      animation: 'slide'
    }
  }
]; 