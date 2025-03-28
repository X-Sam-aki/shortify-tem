
import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { toast } from 'sonner';

interface VideoSettings {
  template: string;
  music: string;
  textOverlays?: any[];
  [key: string]: any;
}

interface ProgressState {
  activeTab: string;
  product: Product | null;
  videoSettings: VideoSettings;
  lastSaved: Date | null;
}

const defaultSettings: VideoSettings = {
  template: 'flash-deal',
  music: 'upbeat',
  textOverlays: []
};

export function useProgress() {
  const [state, setState] = useState<ProgressState>({
    activeTab: 'product',
    product: null,
    videoSettings: defaultSettings,
    lastSaved: null
  });

  // Load saved progress on component mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('video-creation-progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setState({
          ...parsed,
          lastSaved: parsed.lastSaved ? new Date(parsed.lastSaved) : null
        });
        toast.info('Restored your previous progress');
      } catch (error) {
        console.error('Failed to parse saved progress:', error);
      }
    }
  }, []);

  // Save progress whenever it changes
  useEffect(() => {
    if (state.product) {
      const updatedState = {
        ...state,
        lastSaved: new Date()
      };
      localStorage.setItem('video-creation-progress', JSON.stringify(updatedState));
    }
  }, [state.activeTab, state.product, state.videoSettings]);

  const setActiveTab = (tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const setProduct = (product: Product) => {
    setState(prev => ({ ...prev, product, activeTab: 'customize' }));
  };

  const setVideoSettings = (settings: VideoSettings) => {
    setState(prev => ({ ...prev, videoSettings: { ...prev.videoSettings, ...settings }, activeTab: 'publish' }));
  };

  const resetProgress = () => {
    localStorage.removeItem('video-creation-progress');
    setState({
      activeTab: 'product',
      product: null,
      videoSettings: defaultSettings,
      lastSaved: null
    });
    toast.success('Progress reset successfully');
  };

  return {
    ...state,
    setActiveTab,
    setProduct,
    setVideoSettings,
    resetProgress
  };
}
