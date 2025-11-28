'use client';

import { useRef, useState, useEffect } from 'react';

interface DrawingCanvasProps {
  onComplete: (text: string) => void;
  onCancel: () => void;
}

export default function DrawingCanvas({ onComplete, onCancel }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [brushSize, setBrushSize] = useState(3);
  const [color, setColor] = useState('#000000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    // Fill with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [brushSize, color]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setRecognizedText('');
  };

  const handleRecognizeText = () => {
    // For demo purposes, show a text input modal
    // In production, this would call a handwriting recognition API
    const text = prompt('Enter the text you drew (handwriting recognition coming soon!):');
    if (text) {
      setRecognizedText(text);
    }
  };

  const handleComplete = () => {
    if (recognizedText) {
      onComplete(recognizedText);
    } else {
      // If no text recognized yet, prompt for it
      handleRecognizeText();
      if (recognizedText) {
        onComplete(recognizedText);
      }
    }
  };

  const quickTexts = [
    "I'm looking for remote jobs",
    "Junior developer position",
    "Career change to tech"
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">✏️ Draw or Write Your Question</h3>
        <p className="text-gray-600">Use your finger, pen, or stylus to draw or write</p>
      </div>

      {/* Canvas */}
      <div className="relative mb-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[400px] bg-white rounded-xl border-4 border-gray-300 cursor-crosshair touch-none shadow-lg"
          style={{ touchAction: 'none' }}
        />
        
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-2">✍️</div>
              <p className="text-xl">Start drawing or writing here</p>
            </div>
          </div>
        )}
      </div>

      {/* Tools */}
      <div className="flex gap-4 mb-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Brush Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-700">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 rounded border-2 border-gray-300 cursor-pointer"
          />
        </div>

        <button
          onClick={clearCanvas}
          className="px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Recognized Text Display */}
      {recognizedText && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
          <p className="text-sm font-semibold text-gray-700 mb-1">Recognized Text:</p>
          <p className="text-lg text-gray-900">{recognizedText}</p>
        </div>
      )}

      {/* Quick Text Options */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Or choose a quick option:</p>
        <div className="flex flex-wrap gap-2">
          {quickTexts.map((text, idx) => (
            <button
              key={idx}
              onClick={() => onComplete(text)}
              className="px-4 py-2 bg-white text-gray-700 rounded-lg border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-sm font-medium shadow-sm hover:shadow-md"
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl text-lg font-bold hover:bg-gray-300 transition-all shadow-md"
        >
          ❌ Cancel
        </button>
        
        {hasDrawn && !recognizedText && (
          <button
            onClick={handleRecognizeText}
            className="flex-1 px-6 py-4 bg-purple-500 text-white rounded-xl text-lg font-bold hover:bg-purple-600 transition-all shadow-lg hover:shadow-xl"
          >
            🔍 Recognize Text
          </button>
        )}
        
        {recognizedText && (
          <button
            onClick={handleComplete}
            className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl text-lg font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✅ Send Message
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        💡 Tip: After drawing, click "Recognize Text" to convert your handwriting to text, or use quick options above
      </p>
    </div>
  );
}
