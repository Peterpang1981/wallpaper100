import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase/client';
import type { Tables } from '../supabase/types';

type Category = Tables<'categories'>;
type Wallpaper = Tables<'wallpapers'>;

export function useCategories(type: 'music' | 'wallpaper') {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('type', type)
        .order('sort_order', { ascending: true });
      setCategories(data || []);
      setLoading(false);
    };
    fetchCategories();
  }, [type]);

  return { categories, loading };
}

export function useWallpapers(category?: string) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallpapers = async () => {
      let query = supabase
        .from('wallpapers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data } = await query;
      setWallpapers(data || []);
      setLoading(false);
    };
    fetchWallpapers();
  }, [category]);

  return { wallpapers, loading };
}

export async function uploadWallpaper(file: File, metadata: {
  title: string;
  category: string;
  description?: string;
}) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('wallpapers')
    .upload(fileName, file);
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('wallpapers')
    .getPublicUrl(fileName);
  
  const { data, error } = await supabase
    .from('wallpapers')
    .insert({
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      image_url: publicUrl,
      file_size: file.size
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function recordDownload(wallpaperId: string) {
  await supabase.from('download_history').insert({ wallpaper_id: wallpaperId });
  await supabase.rpc('increment_download_count', { wallpaper_id: wallpaperId });
}
