import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../../../i18n/translations';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => setLang(localStorage.getItem('app_lang') || 'en');
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = (key: string) => getTranslation(lang, key);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (username === 'admin' && password === 'admin123') {
      sessionStorage.setItem('admin_session', 'true');
      navigate('/admin');
    } else {
      setError('Invalid username or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <i className="fas fa-lock text-primary text-4xl mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.login')}</h1>
          <p className="text-gray-600 mt-2">AI Wallpaper Studio Management</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.username')}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Logging in...' : t('admin.loginBtn')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/#/" className="text-sm text-gray-500 hover:text-primary">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
