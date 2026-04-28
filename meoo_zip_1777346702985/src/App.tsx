import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Category from './pages/Category';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import About from './pages/About';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminWallpapers from './pages/admin/Wallpapers';
import AdminAds from './pages/admin/Ads';
import AdminStats from './pages/admin/Stats';

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 前端用户路由 */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category/:type" element={<Category />} />
          <Route path="detail/:id" element={<Detail />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="about" element={<About />} />
        </Route>

        {/* 后台管理路由 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/wallpapers" element={<AdminWallpapers />} />
        <Route path="/admin/ads" element={<AdminAds />} />
        <Route path="/admin/stats" element={<AdminStats />} />
      </Routes>
    </HashRouter>
  );
}

export default App;