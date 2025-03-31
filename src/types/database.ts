
export interface Database {
  // Define your database schema here
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          price: number;
          url: string;
        };
        Insert: {
          id?: string;
          title: string;
          price: number;
          url: string;
        };
        Update: {
          id?: string;
          title?: string;
          price?: number;
          url?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          title?: string;
          created_at?: string;
        };
      };
      video_analytics: {
        Row: {
          id: string;
          video_id: string;
          views: number;
          likes: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          views: number;
          likes: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          views?: number;
          likes?: number;
          recorded_at?: string;
        };
      };
    };
  };
}
