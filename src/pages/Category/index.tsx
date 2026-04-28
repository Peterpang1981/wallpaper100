import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import type { Wallpaper, Category } from '../../types';
import { getTranslation } from '../../i18n/translations';

const CategoryPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q');
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
    
    const handleStorageChange = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [type, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    if (!type) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .order('sort_order', { ascending: true });
    if (data) setCategories(data);
  };

  const fetchWallpapers = async () => {
    setLoading(true);
    let query = supabase
      .from('wallpapers')
      .select('*, categories(name)')
      .eq('is_published', true);

    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    } else if (selectedCategory) {
      query = query.eq('category_id', selectedCategory);
    } else if (type) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id')
        .eq('type', type);
      if (cats && cats.length > 0) {
        query = query.in('category_id', cats.map(c => c.id));
      }
    }

    const { data } = await query.order('created_at', { ascending: false }).limit(50);
    if (data) setWallpapers(data as any);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!searchQuery && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getTranslation(lang, 'category.all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {searchQuery ? `${getTranslation(lang, 'category.search')}: "${searchQuery}"` :
         type === 'style' ? 'Style Categories' : type === 'size' ? 'Size Categories' : 'Color Categories'}
      </h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
          ))}
        </div>
      ) : wallpapers.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wallpapers.map((wallpaper, index) => (
            <motion.div
              key={wallpaper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
              onClick={() => window.location.hash = `/#/detail/${wallpaper.id}`}
            >
              <img
                src={wallpaper.thumbnail_path || 'https://via.placeholder.com/300x400?text=AI+Wallpaper'}
                alt={wallpaper.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{wallpaper.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{(wallpaper as any).categories?.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">{getTranslation(lang, 'category.noResults')}</div>
      )}
    </div>
  );
};

export default CategoryPage;
