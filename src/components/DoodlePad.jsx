import React, { useRef, useEffect, useCallback, useState } from 'react';

export default function DoodlePad() {
  const [isOpen, setIsOpen] = useState(false);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = '320px';
    canvas.style.height = '400px';
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 320, 400);
  }, [isOpen]);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX ?? e.touches?.[0]?.clientX) - rect.left,
      y: (e.clientY ?? e.touches?.[0]?.clientY) - rect.top,
    };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    const pressure = e.pressure || 0.5;

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 1 + pressure * 5;
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos, tool]);

  const endDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  const clearAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-xl hover:bg-neutral-700 transition-colors shadow-lg z-50 select-none"
        style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
        title="打開塗鴉板"
      >
        🎨
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
        <span className="text-neutral-400 text-sm">塗鴉板</span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-neutral-500 hover:text-neutral-300 text-lg"
        >
          ✕
        </button>
      </div>

      {/* Canvas */}
      <div style={{ touchAction: 'none', WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}>
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none block"
          style={{ width: 320, height: 400, WebkitTouchCallout: 'none' }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>

      {/* Tools */}
      <div className="flex items-center gap-2 px-4 py-2 border-t border-neutral-700">
        <button
          onClick={() => setTool('pen')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            tool === 'pen'
              ? 'bg-neutral-600 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          畫筆
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            tool === 'eraser'
              ? 'bg-neutral-600 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          橡皮擦
        </button>
        <div className="flex-1" />
        <button
          onClick={clearAll}
          className="text-neutral-500 hover:text-red-400 text-sm transition-colors"
        >
          清除全部
        </button>
      </div>
    </div>
  );
}
