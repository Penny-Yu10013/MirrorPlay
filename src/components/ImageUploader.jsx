import React, { useCallback } from 'react';

export default function ImageUploader({ onImageLoad, isProcessing }) {
  const handleFile = useCallback((file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('請上傳 jpg、png 或 webp 格式的圖片');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageLoad(e.target.result);
    };
    reader.readAsDataURL(file);
  }, [onImageLoad]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-neutral-600 rounded-2xl p-12 text-center cursor-pointer hover:border-neutral-400 transition-colors"
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
      {isProcessing ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
          <p className="text-neutral-300 text-lg">OCR 辨識中，請稍候⋯</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-neutral-300 text-lg">拖拽圖片到這裡，或點擊上傳</p>
          <p className="text-neutral-500 text-sm">支援 jpg / png / webp</p>
        </div>
      )}
    </div>
  );
}
