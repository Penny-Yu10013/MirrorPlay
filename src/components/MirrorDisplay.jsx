import React from 'react';

export default function MirrorDisplay({ words, onRemoveWord }) {
  if (!words || words.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-neutral-400 text-sm font-medium tracking-wide uppercase">
        鏡像文字
      </h2>
      <div className="flex flex-wrap gap-3">
        {words.map((word, index) => (
          <div
            key={index}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 inline-flex items-center gap-2 group relative"
          >
            <span className="text-neutral-500 text-xs font-mono select-none">
              {index + 1}
            </span>
            <span
              className="text-xl font-mono text-amber-300 inline-block select-none"
              style={{ transform: 'scaleX(-1)', display: 'inline-block' }}
            >
              {word}
            </span>
            {onRemoveWord && (
              <button
                onClick={() => onRemoveWord(word, index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-neutral-700 hover:bg-red-900 text-neutral-400 hover:text-red-300 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="移除此字"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
