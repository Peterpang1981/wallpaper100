import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Wallpaper {
  id: string;
  title: string;
  category: string;
  image_url: string;
  download_count: number;
}

export default function AdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'categories' | 'images'>('categories');

  useEffect(() => {
    fetchCategories();
    fetchWallpapers();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').eq('type', 'wallpaper');
    if (data) setCategories(data);
  };

  const fetchWallpapers = async () => {
    const { data } = await supabase.from('wallpapers').select('*').order('created_at', { ascending: false });
    if (data) setWallpapers(data);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await supabase.from('categories').insert({ name: newCategory, type: 'wallpaper' });
    setNewCategory('');
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const deleteWallpaper = async (id: string) => {
    await supabase.from('wallpapers').delete().eq('id', id);
    fetchWallpapers();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;
    const { data: uploadData } = await supabase.storage.from('wallpapers').upload(fileName, file);
    
    if (uploadData) {
      const { data: urlData } = supabase.storage.from('wallpapers').getPublicUrl(fileName);
      await supabase.from('wallpapers').insert({
        title: file.name,
        category,
        image_url: urlData.publicUrl
      });
      fetchWallpapers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">管理后台</h1>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            分类管理
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'images' ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            图片管理
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="输入分类名称"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <Plus size={18} /> 添加
              </button>
            </div>
            
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{cat.name}</span>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {categories.map((cat) => (
                <div key={cat.id} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <label className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-gray-400" size={24} />
                    <span className="text-sm text-gray-600">上传到 {cat.name}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, cat.name)}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {wallpapers.map((wp) => (
                <div key={wp.id} className="relative group">
                  <img
                    src={wp.image_url}
                    alt={wp.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => deleteWallpaper(wp.id)}
                      className="text-white hover:text-red-400"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
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
