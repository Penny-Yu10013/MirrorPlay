import React, { useState } from 'react';

export default function ApiKeySetup({ onSave }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) {
      setError('請輸入 API Key');
      return;
    }
    if (!trimmed.startsWith('sk-ant-')) {
      setError('API Key 格式不正確，應以 sk-ant- 開頭');
      return;
    }
    localStorage.setItem('anthropic_api_key', trimmed);
    onSave(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave();
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-100">MirrorPlay</h1>
          <p className="text-neutral-500 text-sm mt-1">鏡像解密英文學習</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg text-neutral-200">設定 API Key</h2>
          <p className="text-neutral-400 text-sm leading-relaxed">
            請輸入你的 Anthropic API Key。
            Key 只會儲存在你的瀏覽器中，不會上傳到任何伺服器。
          </p>
          <p className="text-neutral-500 text-xs">
            沒有 Key？到{' '}
            <a
              href="https://console.anthropic.com/settings/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 underline"
            >
              Anthropic Console
            </a>
            {' '}建立一個。
          </p>

          <div className="space-y-2">
            <input
              type="password"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="sk-ant-api03-..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-neutral-200 text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
            />
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
              key.trim()
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            儲存並開始
          </button>
        </div>

        <p className="text-center text-neutral-700 text-xs">
          AI 功能需要 API Key。其他功能（OCR、鏡像、手寫）不需要。
        </p>

        <button
          onClick={() => onSave(null)}
          className="w-full text-center text-neutral-600 hover:text-neutral-400 text-xs transition-colors"
        >
          先不設定，跳過
        </button>
      </div>
    </div>
  );
}
