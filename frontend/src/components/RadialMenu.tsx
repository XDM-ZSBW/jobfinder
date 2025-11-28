'use client';

import { useState, useRef, useEffect } from 'react';
import { useUnifiedInput } from '@/hooks/useUnifiedInput';

export interface RadialMenuItem {
  id: string;
  icon: string;
  label: string;
  action: () => void;
  color?: string;
}

interface RadialMenuProps {
  items: RadialMenuItem[];
  trigger?: React.ReactNode;
  autoShow?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}

export default function RadialMenu({
  items,
  trigger,
  autoShow = false,
  onOpen,
  onClose,
  className = '',
}: RadialMenuProps) {
  const [isOpen, setIsOpen] = useState(autoShow);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const radius = 120; // Distance from center to menu items
  const angleStep = (2 * Math.PI) / items.length;

  const handleOpen = (x: number, y: number) => {
    setPosition({ x, y });
    setIsOpen(true);
    if (onOpen) onOpen();
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedIndex(null);
    if (onClose) onClose();
  };

  const handleItemSelect = (item: RadialMenuItem, index: number) => {
    setSelectedIndex(index);
    setTimeout(() => {
      item.action();
      handleClose();
    }, 150); // Visual feedback before executing
  };

  const { inputMode } = useUnifiedInput(triggerRef, {
    onLongPress: (event) => {
      handleOpen(event.x, event.y);
    },
    onTap: () => {
      if (!isOpen && autoShow) {
        // Get element center for tap
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) {
          handleOpen(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    },
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside as any);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [isOpen]);

  // Calculate item positions in a circle
  const getItemPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2; // Start at top
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { x, y, angle };
  };

  return (
    <>
      {/* Trigger Element */}
      {trigger && (
        <div ref={triggerRef} className={className}>
          {trigger}
        </div>
      )}

      {/* Radial Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={handleClose}
        >
          <div
            ref={menuRef}
            className="absolute"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Center Circle */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-900 rounded-full shadow-2xl flex items-center justify-center text-white text-3xl z-20">
              <button
                onClick={handleClose}
                className="w-full h-full rounded-full hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Menu Items */}
            {items.map((item, index) => {
              const pos = getItemPosition(index);
              const isSelected = selectedIndex === index;
              const defaultColor = item.color || 'bg-blue-500';

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item, index)}
                  className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                  }}
                >
                  {/* Item Circle */}
                  <div
                    className={`w-20 h-20 ${defaultColor} rounded-full shadow-2xl flex flex-col items-center justify-center text-white group hover:shadow-3xl transition-all`}
                    style={{
                      minWidth: '80px',
                      minHeight: '80px', // Ensure touch target is large enough
                    }}
                  >
                    <span className="text-3xl mb-1">{item.icon}</span>
                  </div>

                  {/* Label */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap">
                    <span className="px-3 py-1 bg-gray-900 text-white text-sm font-semibold rounded-full shadow-lg">
                      {item.label}
                    </span>
                  </div>

                  {/* Connection Line to Center */}
                  <div
                    className="absolute left-1/2 top-1/2 bg-gray-400 opacity-30 pointer-events-none"
                    style={{
                      width: '2px',
                      height: `${radius}px`,
                      transformOrigin: 'top center',
                      transform: `translate(-50%, -50%) rotate(${pos.angle + Math.PI / 2}rad)`,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Instruction Text */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-white text-2xl font-semibold drop-shadow-lg">
              Tap an action or tap center to close
            </p>
          </div>
        </div>
      )}

      {/* Input Mode Indicator (only when trigger is shown) */}
      {trigger && !isOpen && (
        <div className="absolute -top-8 left-0 z-10">
          <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-semibold">
            {inputMode === 'touch' && '👆 Long press'}
            {inputMode === 'mouse' && '🖱️ Long click'}
            {inputMode === 'pen' && '✏️ Long press'}
          </span>
        </div>
      )}
    </>
  );
}
