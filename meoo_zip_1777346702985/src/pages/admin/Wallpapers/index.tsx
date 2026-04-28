import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import type { Wallpaper, Category } from '../../../types';
import { getTranslation } from '../../../i18n/translations';

const AdminWallpapers: React.FC = () => {
  const lang = localStorage.getItem('app_lang') || 'en';
  const navigate = useNavigate();
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingWallpaper, setEditingWallpaper] = useState<Wallpaper | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    tags: '',
    resolution: '',
    is_featured: false,
    is_recommended: false,
    is_published: true,
    file: null as File | null
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    // Auth temporarily disabled
  };

  const fetchData = async () => {
    const [{ data: wData }, { data: cData }] = await Promise.all([
      supabase.from('wallpapers').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order')
    ]);
    
    if (wData) setWallpapers(wData);
    if (cData) setCategories(cData);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) return;

    try {
      const arrayBuffer = await formData.file.arrayBuffer();
      const fileName = `${Date.now()}_${formData.file.name.replace(/\s+/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wallpapers')
        .upload(`original/${fileName}`, arrayBuffer, {
          contentType: formData.file.type
        });

      if (uploadError) throw uploadError;

      const publicUrl = `${supabase.storage.from('wallpapers').getPublicUrl(uploadData.path).data.publicUrl}`;

      const { error } = await supabase.from('wallpapers').insert({
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        resolution: formData.resolution,
        storage_path: publicUrl,
        thumbnail_path: publicUrl,
        is_featured: formData.is_featured,
        is_recommended: formData.is_recommended,
        is_published: formData.is_published
      });

      if (error) throw error;

      setShowUploadModal(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert('Operation failed: ' + err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWallpaper) return;

    const { error } = await supabase.from('wallpapers').update({
      title: formData.title,
      description: formData.description,
      category_id: formData.category_id || null,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      resolution: formData.resolution,
      is_featured: formData.is_featured,
      is_recommended: formData.is_recommended,
      is_published: formData.is_published
    }).eq('id', editingWallpaper.id);

    if (error) {
      alert('Update failed: ' + error.message);
    } else {
      setEditingWallpaper(null);
      resetForm();
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallpaper?')) return;
    await supabase.from('wallpapers').delete().eq('id', id);
    fetchData();
  };

  const togglePublish = async (wallpaper: Wallpaper) => {
    await supabase.from('wallpapers')
      .update({ is_published: !wallpaper.is_published })
      .eq('id', wallpaper.id);
    fetchData();
  };

  const openEditModal = (wallpaper: Wallpaper) => {
    setEditingWallpaper(wallpaper);
    setFormData({
      title: wallpaper.title,
      description: wallpaper.description || '',
      category_id: wallpaper.category_id || '',
      tags: wallpaper.tags?.join(', ') || '',
      resolution: wallpaper.resolution || '',
      is_featured: wallpaper.is_featured,
      is_recommended: wallpaper.is_recommended,
      is_published: wallpaper.is_published,
      file: null
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category_id: '',
      tags: '',
      resolution: '',
      is_featured: false,
      is_recommended: false,
      is_published: true,
      file: null
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <button onClick={() => navigate('/admin')} className="text-sm text-primary hover:underline flex items-center">
            <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Wallpaper Management</h1>
          <button
            onClick={() => { setEditingWallpaper(null); resetForm(); setShowUploadModal(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            <i className="fas fa-plus mr-2"></i>Upload Wallpaper
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wallpapers.map(w => (
                <tr key={w.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={w.thumbnail_path || ''} alt={w.title} className="h-12 w-12 object-cover rounded" />
                  </td>
                  <td className="px-6 py-4">{w.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {categories.find(c => c.id === w.category_id)?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{w.download_count}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${w.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {w.is_published ? 'Published' : 'Unpublished'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEditModal(w)} className="text-primary hover:text-blue-900">Edit</button>
                    <button onClick={() => togglePublish(w)} className="text-yellow-600 hover:text-yellow-900">
                      {w.is_published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload/Edit Modal */}
      {(showUploadModal || editingWallpaper) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingWallpaper ? 'Edit Wallpaper' : 'Upload Wallpaper'}</h2>
            <form onSubmit={editingWallpaper ? handleUpdate : handleUpload} className="space-y-4">
              <input
                type="text"
                placeholder="Wallpaper Title"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <select
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Resolution (e.g. 1920x1080)"
                value={formData.resolution}
                onChange={e => setFormData({...formData, resolution: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
              {!editingWallpaper && (
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={e => setFormData({...formData, file: e.target.files?.[0] || null})}
                  className="w-full"
                  required
                />
              )}
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="mr-2" />
                  Featured
                </label>
                <label className="flex items-center">
                  <input type="checkbox" checked={formData.is_recommended} onChange={e => setFormData({...formData, is_recommended: e.target.checked})} className="mr-2" />
                  Recommended
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => { setShowUploadModal(false); setEditingWallpaper(null); }} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWallpapers;
