import { VideoTemplate } from './templates';

export interface TemplateSettings {
  titleFontSize: number;
  priceFontSize: number;
  titlePosition: { gravity: string; offsetY: number };
  pricePosition: { gravity: string; offsetY?: number };
  watermarkPosition: { gravity: string; offsetY: number };
}

export const templateSettings: Record<string, TemplateSettings> = {
  'flash-deal': {
    titleFontSize: 60,
    priceFontSize: 80,
    titlePosition: { gravity: 'north', offsetY: 50 },
    pricePosition: { gravity: 'center' },
    watermarkPosition: { gravity: 'south', offsetY: 50 }
  },
  'product-showcase': {
    titleFontSize: 70,
    priceFontSize: 90,
    titlePosition: { gravity: 'north', offsetY: 100 },
    pricePosition: { gravity: 'center', offsetY: 50 },
    watermarkPosition: { gravity: 'south', offsetY: 100 }
  },
  'testimonial': {
    titleFontSize: 50,
    priceFontSize: 70,
    titlePosition: { gravity: 'north', offsetY: 30 },
    pricePosition: { gravity: 'center', offsetY: -30 },
    watermarkPosition: { gravity: 'south', offsetY: 30 }
  },
  'before-after': {
    titleFontSize: 60,
    priceFontSize: 80,
    titlePosition: { gravity: 'north', offsetY: 50 },
    pricePosition: { gravity: 'center' },
    watermarkPosition: { gravity: 'south', offsetY: 50 }
  }
}; 