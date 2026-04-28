import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import type { AdConfig } from '../../../types';
import { getTranslation } from '../../../i18n/translations';

const AdminAds: React.FC = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [editingAd, setEditingAd] = useState<AdConfig | null>(null);
  const [formData, setFormData] = useState({ title: '', image_url: '', link_url: '', is_active: true });
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    checkAuth();
    fetchAds();
    const handleStorageChange = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (key: string) => getTranslation(lang, key);

  const checkAuth = async () => {
    // Auth temporarily disabled
  };

  const fetchAds = async () => {
    const { data } = await supabase.from('ad_configs').select('*').order('sort_order');
    if (data) setAds(data);
  };

  const handleEdit = (ad: AdConfig) => {
    setEditingAd(ad);
    setFormData({ title: ad.title || '', image_url: ad.image_url || '', link_url: ad.link_url || '', is_active: ad.is_active });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    await supabase.from('ad_configs').update(formData).eq('id', editingAd.id);
    setEditingAd(null);
    fetchAds();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('ad_configs').update({ is_active: !currentStatus }).eq('id', id);
    fetchAds();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate('/admin')} className="p-2 bg-white border rounded-lg hover:bg-gray-50">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.adConfig')}</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.position')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.title')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ads.map(ad => (
                <tr key={ad.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{ad.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${ad.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {ad.is_active ? t('admin.active') : t('admin.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(ad)} className="text-primary hover:text-blue-700">{t('admin.edit')}</button>
                    <button onClick={() => toggleStatus(ad.id, ad.is_active)} className="text-gray-600 hover:text-gray-900">
                      {ad.is_active ? t('admin.disable') : t('admin.enable')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingAd && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold mb-4">{t('admin.editAd')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.title')}</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.imageUrl')}</label>
                  <input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.linkUrl')}</label>
                  <input type="text" value={formData.link_url} onChange={e => setFormData({...formData, link_url: e.target.value})} className="mt-1 block w-full border rounded-md px-3 py-2" />
                </div>
                <div className="flex items-center">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="mr-2" />
                  <span className="text-sm text-gray-700">{t('admin.enableAd')}</span>
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setEditingAd(null)} className="px-4 py-2 border rounded-lg">{t('admin.cancel')}</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">{t('admin.save')}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAds;
