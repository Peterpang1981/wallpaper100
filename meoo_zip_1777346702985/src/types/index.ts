export interface Category {
  id: string;
  name: string;
  type: 'style' | 'size' | 'color';
  sort_order: number;
}

export interface Wallpaper {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  tags: string[] | null;
  resolution: string | null;
  format: string | null;
  file_size: number | null;
  storage_path: string | null;
  thumbnail_path: string | null;
  is_featured: boolean;
  is_recommended: boolean;
  is_published: boolean;
  download_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdConfig {
  id: string;
  position: string;
  title: string | null;
  image_url: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Favorite {
  id: string;
  wallpaper_id: string;
  user_session_id: string | null;
  created_at: string;
}