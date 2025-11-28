'use client';

import { useState, useRef, useEffect } from 'react';
import { useUnifiedInput } from '@/hooks/useUnifiedInput';

export interface JobCard {
  id: string;
  title: string;
  company?: string;
  description: string;
  skills: string[];
  matchScore?: number;
  salary?: string;
  location?: string;
  remote?: boolean;
}

interface SwipeCardsProps {
  cards: JobCard[];
  onSwipeLeft?: (card: JobCard) => void;
  onSwipeRight?: (card: JobCard) => void;
  onCardTap?: (card: JobCard) => void;
  className?: string;
}

export default function SwipeCards({
  cards,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
  className = '',
}: SwipeCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentCard = cards[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimating || !currentCard) return;
    
    setIsAnimating(true);
    
    // Animate card off screen
    const targetX = direction === 'left' ? -1000 : 1000;
    setDragOffset({ x: targetX, y: 0 });
    setRotation(direction === 'left' ? -30 : 30);

    setTimeout(() => {
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft(currentCard);
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight(currentCard);
      }

      // Move to next card
      setCurrentIndex(prev => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setRotation(0);
      setIsAnimating(false);
    }, 300);
  };

  const { inputMode } = useUnifiedInput(cardRef, {
    onTap: () => {
      if (currentCard && onCardTap) {
        onCardTap(currentCard);
      }
    },
    onSwipe: (event, direction) => {
      if (direction === 'left') {
        handleSwipe('left');
      } else if (direction === 'right') {
        handleSwipe('right');
      }
    },
    onDrag: (event) => {
      if (isAnimating) return;
      setDragOffset({ x: event.deltaX || 0, y: event.deltaY || 0 });
      
      // Calculate rotation based on drag
      const rot = ((event.deltaX || 0) / 20);
      setRotation(Math.max(-30, Math.min(30, rot)));
    },
    swipeThreshold: 100,
  });

  // Reset position when drag ends
  useEffect(() => {
    const handlePointerUp = () => {
      if (!isAnimating) {
        // If dragged far enough, complete the swipe
        if (Math.abs(dragOffset.x) > 150) {
          handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
        } else {
          // Snap back to center
          setDragOffset({ x: 0, y: 0 });
          setRotation(0);
        }
      }
    };

    window.addEventListener('pointerup', handlePointerUp);
    return () => window.removeEventListener('pointerup', handlePointerUp);
  }, [dragOffset, isAnimating]);

  if (!currentCard) {
    return (
      <div className={`${className} text-center py-20`}>
        <div className="text-6xl mb-6">🎉</div>
        <h3 className="text-4xl font-bold text-gray-900 mb-4">
          You've reviewed all opportunities!
        </h3>
        <p className="text-2xl text-gray-600">
          Check back soon for more matches.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      {/* Input Mode Indicator */}
      <div className="absolute top-4 right-4 z-20">
        <span className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold">
          {inputMode === 'touch' && '👆 Touch'}
          {inputMode === 'mouse' && '🖱️ Mouse'}
          {inputMode === 'pen' && '✏️ Pen'}
        </span>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mb-6">
        <p className="text-2xl text-gray-600">
          ← Swipe left to pass | Swipe right to save →
        </p>
        <p className="text-lg text-gray-500 mt-2">
          Tap card for details
        </p>
      </div>

      {/* Card Stack Container */}
      <div className="relative h-[600px] max-w-2xl mx-auto">
        {/* Next card preview (behind) */}
        {cards[currentIndex + 1] && (
          <div
            className="absolute inset-0 bg-white rounded-3xl shadow-xl transform scale-95 opacity-50"
            style={{ zIndex: 1 }}
          >
            <div className="p-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {cards[currentIndex + 1].title}
              </h3>
            </div>
          </div>
        )}

        {/* Current card */}
        <div
          ref={cardRef}
          className="absolute inset-0 bg-white rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing touch-none"
          style={{
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
            transition: isAnimating ? 'all 0.3s ease-out' : 'none',
            zIndex: 10,
          }}
        >
          {/* Swipe indicators */}
          <div
            className="absolute top-8 right-8 px-8 py-4 bg-red-500 text-white text-3xl font-bold rounded-2xl transform rotate-12 pointer-events-none"
            style={{
              opacity: Math.max(0, -dragOffset.x / 200),
            }}
          >
            PASS
          </div>
          <div
            className="absolute top-8 left-8 px-8 py-4 bg-green-500 text-white text-3xl font-bold rounded-2xl transform -rotate-12 pointer-events-none"
            style={{
              opacity: Math.max(0, dragOffset.x / 200),
            }}
          >
            SAVE
          </div>

          {/* Card Content */}
          <div className="p-12 h-full flex flex-col">
            {/* Match Score */}
            {currentCard.matchScore !== undefined && (
              <div className="mb-4">
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xl font-bold">
                  {currentCard.matchScore}% Match
                </div>
              </div>
            )}

            {/* Title */}
            <h3 className="text-4xl font-bold text-gray-900 mb-3">
              {currentCard.title}
            </h3>

            {/* Company */}
            {currentCard.company && (
              <p className="text-2xl text-gray-600 mb-6">{currentCard.company}</p>
            )}

            {/* Location & Remote */}
            <div className="flex gap-4 mb-6 flex-wrap">
              {currentCard.location && (
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-lg">
                  📍 {currentCard.location}
                </span>
              )}
              {currentCard.remote && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-lg">
                  🏠 Remote
                </span>
              )}
              {currentCard.salary && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-lg">
                  💰 {currentCard.salary}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xl text-gray-700 mb-6 flex-grow overflow-auto">
              {currentCard.description}
            </p>

            {/* Skills */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">Required Skills:</h4>
              <div className="flex flex-wrap gap-3">
                {currentCard.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Controls (Large touch targets) */}
      <div className="flex justify-center gap-8 mt-12">
        <button
          onClick={() => handleSwipe('left')}
          disabled={isAnimating}
          className="w-24 h-24 bg-red-500 text-white rounded-full text-5xl hover:bg-red-600 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Pass on this opportunity"
        >
          ✕
        </button>
        <button
          onClick={() => {
            if (currentCard && onCardTap) {
              onCardTap(currentCard);
            }
          }}
          disabled={isAnimating}
          className="w-24 h-24 bg-blue-500 text-white rounded-full text-5xl hover:bg-blue-600 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="View details"
        >
          ℹ️
        </button>
        <button
          onClick={() => handleSwipe('right')}
          disabled={isAnimating}
          className="w-24 h-24 bg-green-500 text-white rounded-full text-5xl hover:bg-green-600 active:scale-95 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Save this opportunity"
        >
          ✓
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 text-center">
        <p className="text-xl text-gray-600">
          {currentIndex + 1} of {cards.length} opportunities
        </p>
        <div className="w-full max-w-md mx-auto h-3 bg-gray-200 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
