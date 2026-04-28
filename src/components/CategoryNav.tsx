import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function CategoryNav({ categories, activeId, onSelect }: CategoryNavProps) {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeId === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
