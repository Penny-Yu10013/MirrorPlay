import React, { useState } from 'react';

export default function SettingsModal({ apiKey, onClose, onUpdateKey, onClearKey }) {
  const [newKey, setNewKey] = useState('');
  const [showChange, setShowChange] = useState(false);
  const [error, setError] = useState('');

  const maskedKey = apiKey
    ? apiKey.slice(0, 10) + '••••••••'
    : '未設定';

  const handleSave = () => {
    const trimmed = newKey.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('API Key 格式不正確');
      return;
    }
    localStorage.setItem('anthropic_api_key', trimmed);
    onUpdateKey(trimmed);
    setShowChange(false);
    setNewKey('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-6" onClick={onClose}>
      <div
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-sm w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg text-neutral-200">設定</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300">✕</button>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <p className="text-neutral-400 text-sm">Anthropic API Key</p>
          <div className="bg-neutral-800 rounded-lg px-3 py-2 text-neutral-400 text-xs font-mono">
            {maskedKey}
          </div>

          {!showChange ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowChange(true)}
                className="text-xs px-3 py-1.5 rounded-lg border border-neutral-600 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
              >
                更換 Key
              </button>
              {apiKey && (
                <button
                  onClick={() => {
                    localStorage.removeItem('anthropic_api_key');
                    onClearKey();
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-neutral-600 text-neutral-400 hover:text-red-400 hover:border-red-600 transition-colors"
                >
                  清除 Key
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="password"
                value={newKey}
                onChange={(e) => { setNewKey(e.target.value); setError(''); }}
                placeholder="sk-ant-api03-..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-neutral-200 text-sm focus:outline-none focus:border-neutral-500 placeholder-neutral-600"
              />
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                >
                  儲存
                </button>
                <button
                  onClick={() => { setShowChange(false); setNewKey(''); }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-neutral-600 text-neutral-400 hover:text-white transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-800 pt-3">
          <p className="text-neutral-600 text-xs">
            Key 只儲存在你的瀏覽器 localStorage 中。
          </p>
        </div>
      </div>
    </div>
  );
}
