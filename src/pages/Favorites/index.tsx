import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import type { Wallpaper } from '../../types';
import { getTranslation } from '../../i18n/translations';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    loadFavorites();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_lang') {
        setLang(e.newValue || 'en');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadFavorites = async () => {
    const sessionId = localStorage.getItem('user_session_id') || crypto.randomUUID();
    if (!localStorage.getItem('user_session_id')) {
      localStorage.setItem('user_session_id', sessionId);
    }

    const { data } = await supabase
      .from('favorites')
      .select('wallpaper_id')
      .eq('user_session_id', sessionId);

    if (data && data.length > 0) {
      const ids = data.map(f => f.wallpaper_id);
      const { data: wallpapers } = await supabase
        .from('wallpapers')
        .select('*')
        .in('id', ids);
      
      if (wallpapers) setFavorites(wallpapers);
    }
    setLoading(false);
  };

  const removeFavorite = async (wallpaperId: string) => {
    const sessionId = localStorage.getItem('user_session_id');
    if (!sessionId) return;

    await supabase
      .from('favorites')
      .delete()
      .eq('wallpaper_id', wallpaperId)
      .eq('user_session_id', sessionId);

    setFavorites(prev => prev.filter(w => w.id !== wallpaperId));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><i className="fas fa-spinner fa-spin text-3xl text-primary"></i></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{getTranslation(lang, 'favorites.title')}</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <i className="fas fa-heart-broken text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">{getTranslation(lang, 'favorites.empty')}</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">{getTranslation(lang, 'favorites.browse')}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((wallpaper, index) => (
            <motion.div
              key={wallpaper.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <Link to={`/detail/${wallpaper.id}`}>
                <img 
                  src={wallpaper.thumbnail_path || 'https://via.placeholder.com/300x400'} 
                  alt={wallpaper.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <button
                onClick={() => removeFavorite(wallpaper.id)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">{wallpaper.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{wallpaper.resolution || getTranslation(lang, 'common.unknownResolution')}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
