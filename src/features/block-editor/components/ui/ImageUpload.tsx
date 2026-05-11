import { useState, useRef } from 'react';
import { Upload, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'profile',
  className = '',
  aspectRatio = 'square',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-video',
  }[aspectRatio];

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Yükleme başarısız oldu');
      }
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme başarısız oldu');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearImage = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        className="hidden"
        id="image-upload"
      />

      {value ? (
        <div className={`relative ${aspectRatioClass} rounded-xl overflow-hidden bg-slate-100`}>
          <img
            src={value}
            alt="Yüklenen resim"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 active:bg-black/50 transition-colors group">
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-3 bg-white rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Resmi değiştir"
              >
                <Camera className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={clearImage}
                className="p-3 bg-white rounded-full text-red-600 hover:bg-red-50 active:scale-95 transition-all shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Resmi kaldır"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            ${aspectRatioClass} rounded-xl border-2 border-dashed cursor-pointer
            flex flex-col items-center justify-center gap-4 transition-all active:scale-[0.98]
            min-h-[200px] px-4 py-6
            ${dragOver
              ? 'border-slate-900 bg-slate-100 scale-[1.02]'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
            }
            ${uploading ? 'pointer-events-none opacity-75' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
              <span className="text-sm font-medium text-slate-500">Yükleniyor...</span>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-center px-2">
                <p className="text-base font-semibold text-slate-700 mb-1">
                  Yüklemek için dokunun
                </p>
                <p className="text-xs text-slate-500">
                  JPEG, PNG, GIF, WebP (maks. 5MB)
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                <Upload className="w-4 h-4" />
                <span>veya sürükleyip bırakın</span>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
