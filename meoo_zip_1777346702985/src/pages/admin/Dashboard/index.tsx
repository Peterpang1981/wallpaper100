import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getTranslation } from '../../../i18n/translations';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');
  const [stats, setStats] = useState({
    totalDownloads: 0,
    todayDownloads: 0,
    yesterdayDownloads: 0,
    totalWallpapers: 0,
    todayUploads: 0
  });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    fetchStats();

    const handleLangChange = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleLangChange);
    return () => window.removeEventListener('storage', handleLangChange);
  }, []);

  const checkAuth = async () => {
    // Auth temporarily disabled
  };

  const fetchStats = async () => {
    const { count: totalWallpapers } = await supabase.from('wallpapers').select('*', { count: 'exact', head: true });
    const { count: totalDownloads } = await supabase.from('downloads').select('*', { count: 'exact', head: true });

    setStats({
      totalDownloads: totalDownloads || 0,
      todayDownloads: Math.floor(Math.random() * 100),
      yesterdayDownloads: Math.floor(Math.random() * 100),
      totalWallpapers: totalWallpapers || 0,
      todayUploads: Math.floor(Math.random() * 10)
    });

    setTrendData([
      { name: 'Mon', downloads: 400 },
      { name: 'Tue', downloads: 300 },
      { name: 'Wed', downloads: 550 },
      { name: 'Thu', downloads: 450 },
      { name: 'Fri', downloads: 600 },
      { name: 'Sat', downloads: 700 },
      { name: 'Sun', downloads: 500 },
    ]);

    setCategoryData([
      { name: 'Healing', value: 400 },
      { name: 'Cyberpunk', value: 300 },
      { name: 'Minimalist', value: 300 },
      { name: 'Ancient', value: 200 },
    ]);
  };

  const t = (key: string) => getTranslation(lang, key);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin.dashboard')}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{t('admin.stats.totalDownloads')}</p>
            <p className="text-3xl font-bold text-primary">{stats.totalDownloads}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{t('admin.stats.todayDownloads')}</p>
            <p className="text-3xl font-bold text-green-500">{stats.todayDownloads}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{t('admin.stats.totalWallpapers')}</p>
            <p className="text-3xl font-bold text-blue-500">{stats.totalWallpapers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-500">{t('admin.stats.todayUploads')}</p>
            <p className="text-3xl font-bold text-purple-500">{stats.todayUploads}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{t('admin.stats.trendTitle')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="downloads" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">{t('admin.stats.categoryTitle')}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button onClick={() => navigate('/admin/wallpapers')} className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
            {t('admin.manageWallpapers')}
          </button>
          <button onClick={() => navigate('/admin/ads')} className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            {t('admin.adConfig')}
          </button>
          <button onClick={() => navigate('/admin/stats')} className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            {t('admin.stats')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
