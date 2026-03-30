import React, { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import ImageUploader from './components/ImageUploader';
import MirrorDisplay from './components/MirrorDisplay';
import WritingCanvas from './components/WritingCanvas';
import DoodlePad from './components/DoodlePad';
import './index.css';

function App() {
  const [words, setWords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  const processImage = useCallback(async (imageData) => {
    setIsProcessing(true);
    setUploadedImage(imageData);
    setWords([]);

    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(imageData);
      await worker.terminate();

      // Extract words, filter out non-English and very short
      const extracted = data.text
        .split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z'-]/g, ''))
        .filter(w => w.length >= 2);

      setWords(extracted);
    } catch (err) {
      console.error('OCR failed:', err);
      alert('OCR 辨識失敗，請嘗試其他圖片');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setWords([]);
    setUploadedImage(null);
    setShowOriginal(false);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              MirrorPlay
            </h1>
            <p className="text-neutral-500 text-sm">鏡像解密英文學習</p>
          </div>
          {words.length > 0 && (
            <div className="flex items-center gap-3">
              {uploadedImage && (
                <button
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="text-neutral-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors"
                >
                  {showOriginal ? '隱藏原圖' : '查看原圖'}
                </button>
              )}
              <button
                onClick={reset}
                className="text-neutral-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors"
              >
                重新上傳
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Original image preview */}
        {showOriginal && uploadedImage && (
          <div className="mb-6 p-4 bg-neutral-900 rounded-xl border border-neutral-800">
            <img
              src={uploadedImage}
              alt="上傳的原圖"
              className="max-h-64 mx-auto rounded-lg"
            />
          </div>
        )}

        {words.length === 0 ? (
          /* Upload state */
          <div className="max-w-lg mx-auto mt-20">
            <ImageUploader onImageLoad={processImage} isProcessing={isProcessing} />
            <p className="text-center text-neutral-600 text-sm mt-6">
              上傳含有英文文字的圖片，開始鏡像解密
            </p>
          </div>
        ) : (
          /* Working state: left mirror + right writing */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:border-r lg:border-neutral-800 lg:pr-8">
              <MirrorDisplay words={words} />
            </div>
            <div>
              <WritingCanvas words={words} />
            </div>
          </div>
        )}
      </main>

      {/* Info footer */}
      <footer className="fixed bottom-0 left-0 right-0 px-6 py-2 text-center text-neutral-700 text-xs border-t border-neutral-900 bg-neutral-950">
        解密遊戲，不是考試。慢慢來。
      </footer>

      {/* Doodle Pad */}
      <DoodlePad />
    </div>
  );
}

export default App;
