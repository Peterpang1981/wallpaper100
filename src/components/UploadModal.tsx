import React, { useState, useCallback } from 'react';
import { supabase } from '../supabase/client';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  onUploadSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, categories, onUploadSuccess }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file || !selectedCategory) return;
    setUploading(true);
    
    const fileName = `${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('wallpapers')
      .upload(fileName, file);
    
    if (uploadError) {
      setUploading(false);
      return;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('wallpapers')
      .getPublicUrl(fileName);
    
    await supabase.from('wallpapers').insert({
      title: file.name,
      image_url: publicUrl,
      category: selectedCategory,
      file_size: file.size
    });
    
    setUploading(false);
    setFile(null);
    setPreview(null);
    setSelectedCategory('');
    onUploadSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">上传图片</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded" />
          ) : (
            <>
              <ImageIcon className="mx-auto mb-2 text-gray-400" size={48} />
              <p className="text-gray-600">拖拽图片到此处</p>
              <p className="text-sm text-gray-400 mt-1">或点击选择文件</p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
          >
            选择文件
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">选择分类</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">请选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !selectedCategory || uploading}
          className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <Upload size={18} />
          {uploading ? '上传中...' : '上传'}
        </button>
      </div>
    </div>
  );
}
