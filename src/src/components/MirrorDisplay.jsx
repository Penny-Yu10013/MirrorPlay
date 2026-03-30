import React from 'react';

export default function MirrorDisplay({ words }) {
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
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 inline-block"
          >
            <span
              className="text-xl font-mono text-amber-300 inline-block select-none"
              style={{ transform: 'scaleX(-1)', display: 'inline-block' }}
            >
              {word}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
