import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../supabase/client';
import type { AdConfig } from '../../types';
import { getTranslation } from '../../i18n/translations';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'zh', name: '中文' }, { code: 'ja', name: '日本語' },
  { code: 'fr', name: 'Français' }, { code: 'es', name: 'Español' }, { code: 'de', name: 'Deutsch' },
  { code: 'ko', name: '한국어' }, { code: 'ru', name: 'Русский' }, { code: 'pt', name: 'Português' },
  { code: 'it', name: 'Italiano' }, { code: 'ar', name: 'العربية' }, { code: 'hi', name: 'हिन्दी' },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lang, setLang] = useState(() => localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    fetchInitialData();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_lang') setLang(e.newValue || 'en');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [lang]);

  const fetchInitialData = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    if (cats) setCategories(cats);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) window.location.hash = `/#/category/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen flex flex-col anime-gradient">
      <header className="sticky top-4 z-50 mx-4 mt-2">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card rounded-2xl px-6 py-3 flex justify-between items-center"
        >
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-glow group-hover:scale-110 transition-transform">
              <i className="fas fa-star"></i>
            </div>
            <span className="text-xl font-bold text-dark font-serif">{getTranslation(lang, 'common.appName')}</span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} to={`/category/${cat.type}`} className={`text-sm font-medium transition-colors ${location.pathname.includes(`/category/${cat.type}`) ? 'text-primary' : 'text-dark/70 hover:text-primary'}`}>
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <input type="text" placeholder={getTranslation(lang, 'category.search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 pr-4 py-1.5 bg-white/50 border border-white/60 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary w-40 transition-all focus:w-56" />
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60"></i>
            </form>
            
            <select value={lang} onChange={(e) => { setLang(e.target.value); localStorage.setItem('app_lang', e.target.value); window.dispatchEvent(new StorageEvent('storage', { key: 'app_lang', newValue: e.target.value })); }} className="bg-white/50 border border-white/60 rounded-lg text-xs text-dark py-1 px-2 focus:outline-none cursor-pointer">
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>

            <Link to="/favorites" className="text-dark/70 hover:text-primary transition-colors"><i className="fas fa-heart text-lg"></i></Link>
          </div>
        </motion.div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8"><Outlet /></main>

      <footer className="mt-12 mx-4 mb-4">
        <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <p className="text-dark/80 text-sm">© 2026 AI Wallpapers - Original AI Art Platform</p>
          <div className="mt-4 space-x-4">
            <Link to="/about" className="text-dark/60 hover:text-primary text-sm">{getTranslation(lang, 'about.intro')}</Link>
            <Link to="/about" className="text-dark/60 hover:text-primary text-sm">{getTranslation(lang, 'about.copyright')}</Link>
          </div>
          <Link to="/admin/login" className="absolute bottom-4 right-4 text-xs text-dark/40 hover:text-primary transition-colors">
            <i className="fas fa-cog mr-1"></i>{getTranslation(lang, 'admin.login')}
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
