import React, { useRef, useEffect, useCallback, useState } from 'react';

function SingleCanvas({ word, index }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const [hasContent, setHasContent] = useState(false);

  // Canvas size based on word length
  const width = Math.max(120, word.length * 28 + 40);
  const height = 64;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    // Set up for high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    // Drawing style
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    return { x, y };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    lastPoint.current = pos;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');

    // Pressure sensitivity
    const pressure = e.pressure || 0.5;
    ctx.lineWidth = 1 + pressure * 3;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPoint.current = pos;
    setHasContent(true);
  }, [getPos]);

  const endDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasContent(false);
  }, []);

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-neutral-500 text-xs w-6 text-right shrink-0">
        {index + 1}.
      </span>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="bg-neutral-800 border border-neutral-700 rounded-lg cursor-crosshair touch-none"
          style={{ width, height }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        {!hasContent && (
          <span className="absolute inset-0 flex items-center justify-center text-neutral-600 text-sm pointer-events-none">
            在這裡書寫⋯
          </span>
        )}
      </div>
      {hasContent && (
        <button
          onClick={clearCanvas}
          className="text-neutral-600 hover:text-neutral-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          title="清除"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function WritingCanvas({ words }) {
  if (!words || words.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-neutral-400 text-sm font-medium tracking-wide uppercase">
        手寫解密
      </h2>
      <div className="flex flex-col gap-3">
        {words.map((word, index) => (
          <SingleCanvas key={index} word={word} index={index} />
        ))}
      </div>
    </div>
  );
}
