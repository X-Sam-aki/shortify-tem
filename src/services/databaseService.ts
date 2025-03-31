
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Create a simplified interface for the Database
interface Database {
  public: {
    Tables: Record<string, any>;
  };
}

export class DatabaseService {
  private static instance: DatabaseService;
  private client;
  private readonly BACKUP_RETENTION_DAYS = 30;
  private readonly ANALYTICS_RETENTION_DAYS = 90;

  private constructor() {
    this.client = supabase;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // User operations
  public async createUser(email: string, password: string, fullName?: string): Promise<any> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  public async getUserById(id: string): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async updateUser(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Product operations
  public async createProduct(product: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('products')
        .insert(product)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  public async getProductByUrl(url: string): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('products')
        .select('*')
        .eq('url', url)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting product:', error);
      return null;
    }
  }

  public async updateProduct(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Video operations
  public async createVideo(video: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('videos')
        .insert(video)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating video:', error);
      throw error;
    }
  }

  public async getVideoById(id: string): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('videos')
        .select(`
          *,
          product:products(*),
          analytics:video_analytics(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting video:', error);
      return null;
    }
  }

  // Add missing methods needed by other services
  public async getVideosByDate(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('videos')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting videos by date:', error);
      return [];
    }
  }

  public async getAllActiveVideos(): Promise<any[]> {
    try {
      const { data, error } = await this.client
        .from('videos')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active videos:', error);
      return [];
    }
  }

  public async updateVideo(id: string, updates: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('videos')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  }

  // Analytics operations
  public async createVideoAnalytics(analytics: any): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('video_analytics')
        .insert(analytics)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating video analytics:', error);
      throw error;
    }
  }

  public async getVideoAnalytics(videoId: string): Promise<any> {
    try {
      const { data, error } = await this.client
        .from('video_analytics')
        .select('*')
        .eq('video_id', videoId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting video analytics:', error);
      return [];
    }
  }

  // Mock implementations for browser environment
  public async createBackup(): Promise<void> {
    console.log('Database backup created (mock)');
  }

  public async cleanupOldData(): Promise<void> {
    console.log('Old data cleaned up (mock)');
  }

  public async optimizeStorage(): Promise<void> {
    console.log('Storage optimized (mock)');
  }

  public async enforceDataRetention(): Promise<void> {
    console.log('Data retention policies enforced (mock)');
  }
}
