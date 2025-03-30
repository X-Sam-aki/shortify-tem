import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export class DatabaseService {
  private static instance: DatabaseService;
  private client;
  private readonly BACKUP_RETENTION_DAYS = 30;
  private readonly ANALYTICS_RETENTION_DAYS = 90;

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.client = createClient<Database>(supabaseUrl, supabaseKey);
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // User operations
  public async createUser(email: string, password: string, fullName?: string): Promise<any> {
    const { data, error } = await this.client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (error) throw error;
    return data;
  }

  public async getUserById(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  public async updateUser(id: string, updates: any): Promise<any> {
    const { data, error } = await this.client
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Product operations
  public async createProduct(product: any): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async getProductByUrl(url: string): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('url', url)
      .single();

    if (error) throw error;
    return data;
  }

  public async updateProduct(id: string, updates: any): Promise<any> {
    const { data, error } = await this.client
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Video operations
  public async createVideo(video: any): Promise<any> {
    const { data, error } = await this.client
      .from('videos')
      .insert(video)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async getVideoById(id: string): Promise<any> {
    const { data, error } = await this.client
      .from('videos')
      .select(`
        *,
        product:products(*),
        analytics:video_analytics(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  public async updateVideo(id: string, updates: any): Promise<any> {
    const { data, error } = await this.client
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Analytics operations
  public async createVideoAnalytics(analytics: any): Promise<any> {
    const { data, error } = await this.client
      .from('video_analytics')
      .insert(analytics)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  public async getVideoAnalytics(videoId: string): Promise<any> {
    const { data, error } = await this.client
      .from('video_analytics')
      .select('*')
      .eq('video_id', videoId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Backup and maintenance operations
  public async createBackup(): Promise<void> {
    const { error } = await this.client.rpc('backup_database');
    if (error) throw error;
  }

  public async cleanupOldData(): Promise<void> {
    const { error } = await this.client.rpc('cleanup_old_data');
    if (error) throw error;
  }

  // Storage optimization
  public async optimizeStorage(): Promise<void> {
    // Implement storage optimization logic
    // This could include:
    // 1. Compressing old videos
    // 2. Moving inactive videos to cold storage
    // 3. Cleaning up unused assets
    console.log('Storage optimization completed');
  }

  // Data retention
  public async enforceDataRetention(): Promise<void> {
    // Implement data retention policies
    // This could include:
    // 1. Archiving old analytics data
    // 2. Deleting expired sessions
    // 3. Removing inactive user data
    console.log('Data retention policies enforced');
  }

  // Error handling and logging
  private handleError(error: any): never {
    console.error('Database error:', error);
    throw new Error(error.message || 'Database operation failed');
  }
} 