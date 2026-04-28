import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import type { Wallpaper } from '../../types';
import { getTranslation } from '../../i18n/translations';

const Home: React.FC = () => {
  const [featured, setFeatured] = useState<Wallpaper[]>([]);
  const [recommended, setRecommended] = useState<Wallpaper[]>([]);
  const [latest, setLatest] = useState<Wallpaper[]>([]);
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    fetchWallpapers();
    const handleStorageChange = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchWallpapers = async () => {
    const { data: featuredData } = await supabase.from('wallpapers').select('*').eq('is_featured', true).eq('is_published', true).limit(5);
    const { data: recommendedData } = await supabase.from('wallpapers').select('*').eq('is_recommended', true).eq('is_published', true).limit(20);
    const { data: latestData } = await supabase.from('wallpapers').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(10);
    if (featuredData) setFeatured(featuredData);
    if (recommendedData) setRecommended(recommendedData);
    if (latestData) setLatest(latestData);
  };

  const WallpaperCard: React.FC<{ wallpaper: Wallpaper; large?: boolean }> = ({ wallpaper, large }) => (
    <Link to={`/detail/${wallpaper.id}`} className="block group">
      <motion.div 
        whileHover={{ scale: 1.03 }} 
        className={`relative overflow-hidden rounded-3xl bg-white shadow-soft ${large ? 'h-96' : 'h-64'}`}
      >
        <img src={wallpaper.thumbnail_path || 'https://via.placeholder.com/400x600?text=AI+Wallpaper'} alt={wallpaper.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div>
            <h3 className="text-white font-bold text-lg truncate">{wallpaper.title}</h3>
            <p className="text-pink-100 text-sm mt-1">{wallpaper.resolution || 'HD'}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {featured.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-dark mb-8 flex items-center">
            <i className="fas fa-star text-accent mr-3"></i>
            {getTranslation(lang, 'home.featured')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.slice(0, 3).map(w => <WallpaperCard key={w.id} wallpaper={w} large />)}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-dark mb-8 flex items-center">
            <i className="fas fa-fire text-primary mr-3"></i>
            {getTranslation(lang, 'home.trending')}
          </h2>
          <div className="columns-2 md:columns-4 gap-6 space-y-6">
            {recommended.map(w => <WallpaperCard key={w.id} wallpaper={w} />)}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-serif font-bold text-dark mb-8 flex items-center">
            <i className="fas fa-clock text-secondary mr-3"></i>
            {getTranslation(lang, 'home.latest')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {latest.map(w => <WallpaperCard key={w.id} wallpaper={w} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
