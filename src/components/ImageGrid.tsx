import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageItem {
  id: string;
  title: string;
  thumbnail_url: string;
  image_url: string;
  category: string;
}

interface ImageGridProps {
  images: ImageItem[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [visibleImages, setVisibleImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-id');
          if (id && entry.isIntersecting) {
            setVisibleImages((prev) => new Set([...prev, id]));
          }
        });
      },
      { rootMargin: '50px' }
    );

    imageRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [images]);

  const setImageRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      imageRefs.current.set(id, el);
      observerRef.current?.observe(el);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {images.map((image) => (
          <motion.div
            key={image.id}
            ref={(el) => setImageRef(image.id, el)}
            data-id={image.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100"
            onClick={() => setSelectedImage(image)}
          >
            {visibleImages.has(image.id) ? (
              <img
                src={image.thumbnail_url}
                alt={image.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
              <p className="absolute bottom-2 left-2 text-white text-sm font-medium">
                {image.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <i className="fas fa-times" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
