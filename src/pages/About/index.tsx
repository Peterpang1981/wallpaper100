import React from 'react';
import { motion } from 'framer-motion';
import { getTranslation } from '../../i18n/translations';

const About: React.FC = () => {
  const lang = localStorage.getItem('app_lang') || 'en';
  const t = (key: string) => getTranslation(lang, key);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('about.title')}</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('about.intro')}</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            AI Wallpaper Gallery is a vertical download platform dedicated to providing high-quality original AI-generated wallpapers. We are committed to combining artificial intelligence technology with artistic design to bring users a unique visual experience.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Here you can find wallpapers in various styles such as healing, cyberpunk, minimalist, etc., adapted to different screen sizes including mobile phones, computers, and tablets. All wallpapers are exclusively original by the site owner, ensuring no copyright infringement risks, and providing watermark-free HD original downloads.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('about.originality')}</h2>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>All wallpaper works on this platform are generated through advanced AI models and undergo manual selection and post-optimization.</li>
            <li>We adhere to the principle of originality and do not include content uploaded by third-party users, eliminating copyright disputes from the source.</li>
            <li>Wallpaper styles cover natural landscapes, anime ACG, abstract art, etc., meeting the personalized needs of different users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('about.copyright')}</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <p className="text-gray-600 text-sm leading-relaxed">
              1. The copyright of all wallpaper works on this platform belongs to the platform. No unit or individual may use them for commercial purposes without written authorization.<br />
              2. Wallpapers downloaded by users are limited to personal non-commercial use (such as personal device desktop backgrounds).<br />
              3. It is strictly prohibited to resell, resale, or distribute the wallpapers on this site as part of a material library.<br />
              4. The platform reserves the right to pursue legal liability if any infringement is found.
            </p>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default About;