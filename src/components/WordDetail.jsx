import React, { useEffect, useState, useRef, useCallback } from 'react';

const UNSPLASH_KEY = 'IsDeh7Bqj_DAvDbUFkrX4Y9j-07jjQSzbF3KN9vxg8Q';

function ChineseCanvas() {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const [hasContent, setHasContent] = useState(false);

  const width = 200;
  const height = 60;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX ?? e.touches?.[0]?.clientX) - rect.left,
      y: (e.clientY ?? e.touches?.[0]?.clientY) - rect.top,
    };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
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
    e.stopPropagation();
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    const pressure = e.pressure || 0.5;
    ctx.lineWidth = 1 + pressure * 5;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setHasContent(true);
  }, [getPos]);

  const endDraw = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    isDrawing.current = false;
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasContent(false);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative"
        style={{
          padding: '12px',
          margin: '-12px',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          className="bg-neutral-800 border border-neutral-700 rounded-lg cursor-crosshair touch-none"
          style={{ width, height, WebkitTouchCallout: 'none' }}
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
        {!hasContent && (
          <span className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs pointer-events-none">
            寫下中文意思⋯
          </span>
        )}
      </div>
      {hasContent && (
        <button onClick={clear} className="text-neutral-600 hover:text-neutral-400 text-xs">
          ✕
        </button>
      )}
    </div>
  );
}

function SentenceActions({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [text, isSpeaking]);

  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // fallback
    }
  }, [text]);

  return (
    <span className="inline-flex items-center gap-1 ml-1">
      <button
        onClick={toggleSpeak}
        className={`transition-colors ${isSpeaking ? 'text-amber-400' : 'text-neutral-500 hover:text-amber-300'}`}
        title={isSpeaking ? '停止朗讀' : '朗讀例句'}
      >
        <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
        </svg>
      </button>
      <button
        onClick={copyText}
        className="text-neutral-500 hover:text-amber-300 transition-colors"
        title="複製例句"
      >
        {copied ? (
          <span className="text-xs text-green-400">✓ 已複製</span>
        ) : (
          <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </span>
  );
}

// Parse AI explanation text and add action buttons to English sentences
function AiExplanationRender({ text }) {
  // Split by lines and process each
  const lines = text.split('\n');

  return (
    <div className="text-sm text-neutral-300 bg-neutral-800 rounded-lg p-3 leading-relaxed space-y-1">
      {lines.map((line, i) => {
        // Detect lines that contain English sentences (3+ consecutive English words)
        const englishMatch = line.match(/[A-Z][a-z].*?[a-zA-Z\s]{10,}[.!?]/);
        if (englishMatch) {
          const engSentence = englishMatch[0];
          const before = line.slice(0, englishMatch.index);
          const after = line.slice(englishMatch.index + engSentence.length);
          return (
            <div key={i}>
              {before}
              <span className="text-amber-200">{engSentence}</span>
              <SentenceActions text={engSentence} />
              {after}
            </div>
          );
        }
        return <div key={i}>{line || '\u00A0'}</div>;
      })}
    </div>
  );
}

export default function WordDetail({ word, rawText, apiKey, onClose }) {
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [translation, setTranslation] = useState(null);
  const [transLoading, setTransLoading] = useState(true);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const fetchAiExplanation = useCallback(async () => {
    if (aiLoading || aiExplanation) return;
    if (!apiKey) {
      setAiError('nokey');
      return;
    }
    setAiLoading(true);
    setAiError(false);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `以下是一段英文原文：\n${rawText}\n\n使用者想了解「${word}」在這段文中的意思。\n請用繁體中文回答，包含：\n1. 這個詞在這段文中的具體意思（不是所有意思，只要這個語境的）\n2. 如果它是片語的一部分，說明完整片語和意思\n3. 一個簡單的例句\n\n回答簡短就好，不要超過100字。`,
          }],
        }),
      });

      if (res.status === 401) {
        setAiError('invalid');
        return;
      }
      if (res.status === 429) {
        setAiError('ratelimit');
        return;
      }
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const text = data.content?.[0]?.text;
      if (text) {
        setAiExplanation(text);
      } else {
        throw new Error('No text in response');
      }
    } catch (err) {
      console.error('AI explanation failed:', err);
      setAiError('unknown');
    } finally {
      setAiLoading(false);
    }
  }, [word, rawText, apiKey, aiLoading, aiExplanation]);

  useEffect(() => {
    let cancelled = false;

    // Fetch Unsplash image
    fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(word)}&per_page=1&client_id=${UNSPLASH_KEY}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.results && data.results.length > 0) {
          setImage(data.results[0].urls.small);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setImageLoading(false); });

    // Fetch translation (MyMemory API, free, no key needed)
    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-TW`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.responseData && data.responseData.translatedText) {
          setTranslation(data.responseData.translatedText);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTransLoading(false); });

    return () => { cancelled = true; };
  }, [word]);

  return (
    <div className="mt-2 ml-8 p-4 bg-neutral-900 border border-neutral-700 rounded-xl space-y-3 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-amber-300 font-mono text-lg">{word}</span>
          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(word);
              utterance.lang = 'en-US';
              utterance.rate = 0.85;
              window.speechSynthesis.speak(utterance);
            }}
            className="text-neutral-500 hover:text-amber-300 transition-colors"
            title="聽發音"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M11 5L6 9H2v6h4l5 4V5z" />
            </svg>
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-300 text-sm"
        >
          收合
        </button>
      </div>

      {/* Image */}
      {imageLoading ? (
        <div className="text-neutral-600 text-xs">搜尋圖片中⋯</div>
      ) : image ? (
        <img
          src={image}
          alt={word}
          className="w-full max-w-xs rounded-lg object-cover"
          style={{ maxHeight: 160 }}
        />
      ) : null}

      {/* Translation */}
      <div className="text-sm">
        <span className="text-neutral-500 mr-2">中文：</span>
        {transLoading ? (
          <span className="text-neutral-600">翻譯中⋯</span>
        ) : translation ? (
          <span className="text-neutral-200">{translation}</span>
        ) : (
          <span className="text-neutral-600">無翻譯結果</span>
        )}
      </div>

      {/* AI Explanation */}
      <div>
        {!aiExplanation && !aiLoading && !aiError && (
          <button
            onClick={fetchAiExplanation}
            className="text-xs px-3 py-1.5 rounded-lg border border-neutral-600 text-neutral-400 hover:text-amber-300 hover:border-amber-600 transition-colors"
          >
            AI 解釋
          </button>
        )}
        {aiLoading && (
          <div className="flex items-center gap-2 text-neutral-500 text-xs">
            <div className="w-3 h-3 border border-neutral-500 border-t-amber-400 rounded-full animate-spin" />
            AI 思考中⋯
          </div>
        )}
        {aiError && (
          <p className="text-neutral-500 text-xs">
            {aiError === 'nokey' && '請先在設定中輸入 API Key 才能使用 AI 解釋'}
            {aiError === 'invalid' && 'API Key 無效或已過期，請到設定中更換'}
            {aiError === 'ratelimit' && '請求太頻繁，請稍後再試'}
            {aiError === 'unknown' && '暫時無法取得解釋'}
          </p>
        )}
        {aiExplanation && (
          <AiExplanationRender text={aiExplanation} />
        )}
      </div>

      {/* Chinese handwriting */}
      <div>
        <p className="text-neutral-500 text-xs mb-1">手寫中文意思</p>
        <ChineseCanvas />
      </div>
    </div>
  );
}
