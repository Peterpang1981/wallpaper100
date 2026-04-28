import { useState, useEffect } from 'react';
import { supabase } from './supabase/client';
import { Image as ImageIcon, Upload, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

interface Wallpaper {
  id: string;
  title: string;
  image_url: string;
  thumbnail_url: string;
  category: string;
  download_count: number;
}

export default function App() {
  const [view, setView] = useState<'gallery' | 'admin'>('gallery');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<Wallpaper | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
  }, []);

  useEffect(() => {
    fetchWallpapers();
  }, [activeCategory]);

  async function fetchCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'wallpaper')
      .order('sort_order');
    setCategories(data || []);
  }

  async function fetchWallpapers() {
    setLoading(true);
    let query = supabase
      .from('wallpapers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (activeCategory !== 'all') {
      query = query.eq('category', activeCategory);
    }
    
    const { data } = await query;
    setWallpapers(data || []);
    setLoading(false);
  }

  if (view === 'admin') {
    return <AdminPanel onBack={() => { setView('gallery'); fetchCategories(); fetchWallpapers(); }} onUpdate={fetchWallpapers} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">壁纸库</h1>
          <button
            onClick={() => setView('admin')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings size={20} />
            <span>管理</span>
          </button>
        </div>
      </header>

      <div className="sticky top-[65px] z-30 bg-white/60 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.name
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wallpapers.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-200 cursor-pointer shadow-sm hover:shadow-lg transition-shadow"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
                    <p className="text-white/70 text-xs">{item.download_count} 次下载</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
              onClick={() => setSelectedImage(null)}
            >
              <i className="fas fa-times" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminPanel({ onBack, onUpdate }: { onBack: () => void; onUpdate: () => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'upload'>('categories');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('type', 'wallpaper').order('sort_order');
    if (data) setCategories(data);
  };

  const fetchWallpapers = async () => {
    const { data } = await supabase.from('wallpapers').select('*').order('created_at', { ascending: false });
    if (data) setWallpapers(data);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const { data, error } = await supabase.from('categories').insert({
        name: newCategory.trim(),
        type: 'wallpaper',
        sort_order: categories.length
      }).select();
      if (error) {
        console.error('添加分类失败:', error);
        alert('添加失败: ' + error.message);
        return;
      }
      setNewCategory('');
      if (data && data[0]) {
        setCategories([...categories, data[0]]);
      }
    } catch (err) {
      console.error('添加分类异常:', err);
      alert('添加失败');
    }
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const deleteWallpaper = async (id: string) => {
    await supabase.from('wallpapers').delete().eq('id', id);
    fetchWallpapers();
    onUpdate();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadCategory) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage.from('wallpapers').upload(fileName, arrayBuffer, {
        contentType: file.type
      });
      if (uploadError) {
        console.error('上传失败:', uploadError);
        alert('上传失败: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage.from('wallpapers').getPublicUrl(fileName);
      const { data, error } = await supabase.from('wallpapers').insert({
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: uploadCategory,
        image_url: urlData.publicUrl,
        thumbnail_url: urlData.publicUrl
      }).select();

      if (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + error.message);
        setUploading(false);
        return;
      }

      if (data && data[0]) {
        setWallpapers([data[0], ...wallpapers]);
      }
      onUpdate();
      alert('上传成功！');
    } catch (err) {
      console.error('上传异常:', err);
      alert('上传失败');
    }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">返回</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'categories' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}
          >
            分类管理
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'upload' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600'}`}
          >
            上传图片
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="输入分类名称"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <button
                onClick={addCategory}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                添加
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{cat.name}</span>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:text-red-700">
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">选择分类</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">请选择分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center mb-6">
              <ImageIcon className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-4">
                {!uploadCategory ? '请先选择分类' : '选择图片上传'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={!uploadCategory || uploading}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer ${
                  !uploadCategory || uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-gray-800'
                } text-white`}
              >
                <Upload size={18} />
                <span>{uploading ? '上传中...' : '选择文件'}</span>
              </label>
            </div>

            <h3 className="font-medium mb-4">已上传图片</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {wallpapers.map(wp => (
                <div key={wp.id} className="relative group">
                  <img src={wp.image_url} alt={wp.title} className="w-full h-24 object-cover rounded-lg" />
                  <button
                    onClick={() => deleteWallpaper(wp.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <i className="fas fa-times text-xs" />
                  </button>
                  <p className="text-xs mt-1 truncate">{wp.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
