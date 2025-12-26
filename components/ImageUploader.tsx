
import React, { useRef } from 'react';
import { ProductImage } from '../types';

interface ImageUploaderProps {
  images: ProductImage[];
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, setImages }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = event.target?.result as string;
        setImages(prev => [
          ...prev,
          { id: Math.random().toString(36).substr(2, 9), data, mimeType: file.type }
        ].slice(0, 5)); // Increased to 5 images
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {images.map(img => (
          <div key={img.id} className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden glass group ring-1 ring-white/10">
            <img src={img.data} alt="Product view" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-500/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 md:w-28 md:h-28 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center hover:border-white/30 hover:bg-white/5 transition-all text-gray-500 hover:text-white"
          >
            <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Add Images</span>
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
      <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Upload up to 5 images ( ex: Front, Side, Back, Top, Details )
      </div>
    </div>
  );
};

export default ImageUploader;
