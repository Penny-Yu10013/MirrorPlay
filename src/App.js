import React, { useState, useCallback, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import ApiKeySetup from './components/ApiKeySetup';
import SettingsModal from './components/SettingsModal';
import ImageUploader from './components/ImageUploader';
import TextInput from './components/TextInput';
import MirrorDisplay from './components/MirrorDisplay';
import WritingCanvas from './components/WritingCanvas';
import DoodlePad from './components/DoodlePad';
import './index.css';

function App() {
  // BYOK: check localStorage on first render
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_api_key'));
  const [setupDone, setSetupDone] = useState(() => {
    // If key exists or user previously skipped, don't show setup
    return !!localStorage.getItem('anthropic_api_key') || !!localStorage.getItem('setup_skipped');
  });
  const [showSettings, setShowSettings] = useState(false);

  const [allWords, setAllWords] = useState([]);
  const [words, setWords] = useState([]);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [removedIndices, setRemovedIndices] = useState(new Set());
  const [wordsVersion, setWordsVersion] = useState(0);
  const [inputMode, setInputMode] = useState('image');
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const syncing = useRef(false);

  const handleSetupSave = useCallback((key) => {
    if (key) {
      setApiKey(key);
    } else {
      // User skipped
      localStorage.setItem('setup_skipped', 'true');
    }
    setSetupDone(true);
  }, []);

  const handleScroll = useCallback((source) => {
    if (syncing.current) return;
    syncing.current = true;
    const from = source === 'left' ? leftRef.current : rightRef.current;
    const to = source === 'left' ? rightRef.current : leftRef.current;
    if (from && to) {
      const ratio = from.scrollTop / (from.scrollHeight - from.clientHeight || 1);
      to.scrollTop = ratio * (to.scrollHeight - to.clientHeight || 1);
    }
    requestAnimationFrame(() => { syncing.current = false; });
  }, []);

  const processImage = useCallback(async (imageData) => {
    setIsProcessing(true);
    setUploadedImage(imageData);
    setWords([]);
    setRawText('');

    try {
      const worker = await createWorker('eng');
      const { data } = await worker.recognize(imageData);
      await worker.terminate();

      setRawText(data.text);

      const extracted = data.text
        .split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z'-]/g, ''))
        .filter(w => w.length >= 2);

      setAllWords(extracted);
      setWords(extracted);
      setRemovedIndices(new Set());
      setReviewMode(false);
    } catch (err) {
      console.error('OCR failed:', err);
      alert('OCR 辨識失敗，請嘗試其他圖片');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processText = useCallback((extractedWords, originalText) => {
    setRawText(originalText);
    setAllWords(extractedWords);
    setWords(extractedWords);
    setRemovedIndices(new Set());
    setReviewMode(false);
    setUploadedImage(null);
  }, []);

  const reset = useCallback(() => {
    setAllWords([]);
    setWords([]);
    setRawText('');
    setUploadedImage(null);
    setShowOriginal(false);
    setReviewMode(false);
    setRemovedIndices(new Set());
  }, []);

  const pickRandom5 = useCallback(() => {
    const source = allWords.filter((_, i) => !removedIndices.has(i));
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    setWords(shuffled.slice(0, Math.min(5, shuffled.length)));
    setReviewMode(true);
    setWordsVersion(v => v + 1);
  }, [allWords, removedIndices]);

  const showAll = useCallback(() => {
    setWords(allWords.filter((_, i) => !removedIndices.has(i)));
    setReviewMode(false);
    setWordsVersion(v => v + 1);
  }, [allWords, removedIndices]);

  const removeWord = useCallback((wordToRemove, indexInDisplay) => {
    const originalIndex = allWords.indexOf(wordToRemove);
    if (originalIndex !== -1) {
      setRemovedIndices(prev => {
        const next = new Set(prev);
        next.add(originalIndex);
        return next;
      });
    }
    setWords(prev => prev.filter((_, i) => i !== indexInDisplay));
  }, [allWords]);

  // Show API key setup screen if first time
  if (!setupDone) {
    return <ApiKeySetup onSave={handleSetupSave} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={process.env.PUBLIC_URL + '/logo192.png'}
              alt="MirrorPlay"
              className="w-8 h-8 rounded-md"
            />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                MirrorPlay
              </h1>
              <p className="text-neutral-500 text-xs sm:text-sm hidden sm:block">鏡像解密英文學習</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {allWords.length > 0 && (
              <>
                {!reviewMode ? (
                  <button
                    onClick={pickRandom5}
                    className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg border border-amber-700 hover:border-amber-500 transition-colors"
                  >
                    抽 5 個
                  </button>
                ) : (
                  <button
                    onClick={showAll}
                    className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg border border-amber-700 hover:border-amber-500 transition-colors"
                  >
                    返回全部
                  </button>
                )}
                {uploadedImage && (
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="text-neutral-400 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors hidden sm:block"
                  >
                    {showOriginal ? '隱藏原圖' : '查看原圖'}
                  </button>
                )}
                <button
                  onClick={reset}
                  className="text-neutral-400 hover:text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded-lg border border-neutral-700 hover:border-neutral-500 transition-colors"
                >
                  重新開始
                </button>
              </>
            )}
            {/* Settings gear */}
            <button
              onClick={() => setShowSettings(true)}
              className="text-neutral-500 hover:text-neutral-300 transition-colors ml-1"
              title="設定"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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

        {words.length === 0 && !isProcessing ? (
          <div className="max-w-lg mx-auto mt-8 sm:mt-12">
            <div className="flex gap-1 mb-6 bg-neutral-900 rounded-lg p-1">
              <button
                onClick={() => setInputMode('image')}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
                  inputMode === 'image'
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                上傳圖片
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
                  inputMode === 'text'
                    ? 'bg-neutral-700 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                貼上文字
              </button>
            </div>

            {inputMode === 'image' ? (
              <>
                <ImageUploader onImageLoad={processImage} isProcessing={isProcessing} />
                <p className="text-center text-neutral-600 text-sm mt-6">
                  上傳含有英文文字的圖片，開始鏡像解密
                </p>
              </>
            ) : (
              <>
                <TextInput onTextSubmit={processText} />
                <p className="text-center text-neutral-600 text-sm mt-6">
                  直接貼上英文段落，跳過 OCR 直接解密
                </p>
              </>
            )}
          </div>
        ) : words.length === 0 && isProcessing ? (
          <div className="max-w-lg mx-auto mt-20">
            <ImageUploader onImageLoad={processImage} isProcessing={isProcessing} />
          </div>
        ) : (
          /* Working state: responsive layout */
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
            style={{ height: 'calc(100vh - 180px)' }}
          >
            <div
              ref={leftRef}
              onScroll={() => handleScroll('left')}
              className="overflow-y-auto md:border-r md:border-neutral-800 md:pr-8 scrollbar-thin"
            >
              <MirrorDisplay words={words} onRemoveWord={removeWord} />
            </div>
            <div
              ref={rightRef}
              onScroll={() => handleScroll('right')}
              className="overflow-y-auto scrollbar-thin"
            >
              <WritingCanvas key={wordsVersion} words={words} rawText={rawText} apiKey={apiKey} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-6 py-2 text-center text-neutral-700 text-xs border-t border-neutral-900 bg-neutral-950 select-none"
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
      >
        解密遊戲，不是考試。慢慢來。
      </footer>

      {/* Doodle Pad */}
      <DoodlePad />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onClose={() => setShowSettings(false)}
          onUpdateKey={(k) => setApiKey(k)}
          onClearKey={() => { setApiKey(null); setSetupDone(false); }}
        />
      )}
    </div>
  );
}

export default App;
