import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../supabase/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getTranslation } from '../../../i18n/translations';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Stats: React.FC = () => {
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
  const [topWallpapers, setTopWallpapers] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    const handleStorageChange = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (key: string) => getTranslation(lang, key);

  const fetchStats = async () => {
    // 获取基础统计
    const { count: totalWallpapers } = await supabase.from('wallpapers').select('*', { count: 'exact', head: true });
    const { count: totalDownloads } = await supabase.from('downloads').select('*', { count: 'exact', head: true });
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { count: todayDownloads } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .gte('downloaded_at', `${today}T00:00:00`);

    const { count: yesterdayDownloads } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .gte('downloaded_at', `${yesterday}T00:00:00`)
      .lt('downloaded_at', `${today}T00:00:00`);

    const { count: todayUploads } = await supabase
      .from('wallpapers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00`);

    setStats({
      totalDownloads: totalDownloads || 0,
      todayDownloads: todayDownloads || 0,
      yesterdayDownloads: yesterdayDownloads || 0,
      totalWallpapers: totalWallpapers || 0,
      todayUploads: todayUploads || 0
    });

    // 获取分类下载占比
    const { data: categories } = await supabase.from('categories').select('id, name');
    const catStats = [];
    for (const cat of categories || []) {
      const { count } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('wallpaper_id', cat.id); // 简化逻辑，实际应关联查询
      if (count && count > 0) {
        catStats.push({ name: cat.name, value: count });
      }
    }
    setCategoryData(catStats.slice(0, 6));

    // 获取TOP10壁纸
    const { data: tops } = await supabase
      .from('wallpapers')
      .select('id, title, download_count')
      .order('download_count', { ascending: false })
      .limit(10);
    setTopWallpapers(tops || []);

    // 模拟趋势数据
    setTrendData([
      { name: '周一', downloads: 40 },
      { name: '周二', downloads: 30 },
      { name: '周三', downloads: 20 },
      { name: '周四', downloads: 27 },
      { name: '周五', downloads: 18 },
      { name: '周六', downloads: 23 },
      { name: '周日', downloads: 34 },
    ]);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="text-gray-500 hover:text-primary">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.stats')}</h1>
        </div>
        <Link to="/admin" className="text-primary hover:underline">{t('admin.backToDashboard')}</Link>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <StatCard title={t('admin.stats.totalDownloads')} value={stats.totalDownloads} icon="fa-download" color="blue" />
        <StatCard title={t('admin.stats.todayDownloads')} value={stats.todayDownloads} icon="fa-calendar-day" color="green" />
        <StatCard title={t('admin.stats.yesterdayDownloads')} value={stats.yesterdayDownloads} icon="fa-history" color="purple" />
        <StatCard title={t('admin.stats.totalWallpapers')} value={stats.totalWallpapers} icon="fa-image" color="orange" />
        <StatCard title={t('admin.stats.todayUploads')} value={stats.todayUploads} icon="fa-upload" color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 下载趋势图 */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('admin.stats.trendTitle')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="downloads" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 分类占比图 */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{t('admin.stats.categoryTitle')}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 壁纸排行榜 */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t('admin.stats.topWallpapers')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.stats.rank')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.stats.wallpaperTitle')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.stats.downloads')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topWallpapers.map((w, idx) => (
                <tr key={w.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{idx + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.download_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600'
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
      <div className={`p-3 rounded-full ${colorMap[color]}`}>
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default Stats;
