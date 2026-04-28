import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import type { Wallpaper } from '../../types';
import { getTranslation } from '../../i18n/translations';

const Detail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [related, setRelated] = useState<Wallpaper[]>([]);
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) fetchData();
    const handleLang = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleLang);
    return () => window.removeEventListener('storage', handleLang);
  }, [id]);

  const fetchData = async () => {
    const { data: wp } = await supabase.from('wallpapers').select('*').eq('id', id).maybeSingle();
    if (wp) {
      setWallpaper(wp);
      const { data: rel } = await supabase.from('wallpapers').select('*').neq('id', id).limit(4);
      setRelated(rel || []);
    }
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      if (wallpaper?.storage_path) {
        const a = document.createElement('a');
        a.href = wallpaper.storage_path;
        a.download = `${wallpaper.title}.jpg`;
        a.click();
      }
      setIsDownloading(false);
    }, 1500);
  };

  if (!wallpaper) return <div className="flex justify-center py-20 text-primary"><i className="fas fa-spinner fa-spin text-3xl"></i></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl overflow-hidden mb-8"
      >
        <img src={wallpaper.storage_path} alt={wallpaper.title} className="w-full max-h-[60vh] object-contain bg-white/50" />
        
        <div className="p-8">
          <h1 className="text-3xl font-bold text-dark mb-4">{wallpaper.title}</h1>
          <p className="text-gray-600 mb-6">{wallpaper.description}</p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="btn-primary px-8 py-3 rounded-full font-medium flex items-center space-x-2"
            >
              {isDownloading ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-download"></i>}
              <span>{getTranslation(lang, 'detail.downloadBtn')}</span>
            </button>
            <span className="text-sm text-gray-500">{wallpaper.resolution}</span>
          </div>
        </div>
      </motion.div>

      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark mb-6">{getTranslation(lang, 'detail.related')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map(wp => (
              <Link key={wp.id} to={`/detail/${wp.id}`} className="group">
                <motion.div whileHover={{ scale: 1.05 }} className="glass-card rounded-2xl overflow-hidden aspect-[3/4]">
                  <img src={wp.thumbnail_path} alt={wp.title} className="w-full h-full object-cover" />
                </motion.div>
                <p className="mt-2 text-sm text-center text-gray-600 truncate">{wp.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;
