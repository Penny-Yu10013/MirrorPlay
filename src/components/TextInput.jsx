import React, { useState, useCallback } from 'react';

export default function TextInput({ onTextSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Extract English words
    const words = trimmed
      .split(/\s+/)
      .map(w => w.replace(/[^a-zA-Z'-]/g, ''))
      .filter(w => w.length >= 2);

    if (words.length === 0) {
      alert('沒有偵測到英文單字，請確認輸入內容');
      return;
    }

    onTextSubmit(words, trimmed);
  }, [text, onTextSubmit]);

  const handleKeyDown = useCallback((e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="貼上英文文字⋯"
        className="w-full h-40 bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-neutral-200 text-sm resize-none focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
      />
      <div className="flex items-center justify-between">
        <span className="text-neutral-600 text-xs">Ctrl + Enter 快速開始</span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            text.trim()
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
          }`}
        >
          開始解密
        </button>
      </div>
    </div>
  );
}
