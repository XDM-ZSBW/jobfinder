import { useState, useRef } from 'react'
import { useUnifiedInput } from '@/hooks/useUnifiedInput'

interface Skill {
  id: string;
  name: string;
  category?: string;
}

interface SkillBubblesProps {
  availableSkills: Skill[];
  selectedSkills?: Skill[];
  onSkillsChange?: (skills: Skill[]) => void;
  onContinue?: () => void;
  canvasMode?: boolean;
  className?: string;
}

export default function SkillBubbles({
  availableSkills,
  selectedSkills = [],
  onSkillsChange,
  onContinue,
  canvasMode = true,
  className = '',
}: SkillBubblesProps) {
  const [selected, setSelected] = useState<Skill[]>(selectedSkills);
  const [draggedSkill, setDraggedSkill] = useState<Skill | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleSkillToggle = (skill: Skill) => {
    const isSelected = selected.some(s => s.id === skill.id);
    let newSelected: Skill[];
    
    if (isSelected) {
      newSelected = selected.filter(s => s.id !== skill.id);
    } else {
      newSelected = [...selected, skill];
    }
    
    setSelected(newSelected);
    if (onSkillsChange) {
      onSkillsChange(newSelected);
    }
  };

  const { inputMode } = useUnifiedInput(canvasRef, {
    onTap: () => {
      // Handle canvas tap if needed
    },
    onLongPress: (event) => {
      // Could show skill categories or filters on long press
      console.log('Long press detected for context menu');
    },
  });

  // Group skills by category
  const skillsByCategory = availableSkills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className={`${className} space-y-8`} ref={canvasRef}>
      {/* Input Mode Indicator */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-bold text-gray-900">
          {canvasMode ? 'Drag skills you have' : 'Select your skills'}
        </h3>
        <span className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold">
          {inputMode === 'touch' && '👆 Touch'}
          {inputMode === 'mouse' && '🖱️ Mouse'}
          {inputMode === 'pen' && '✏️ Pen'}
        </span>
      </div>

      {/* Selected Skills Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={(e) => {
          e.preventDefault();
          setDropZoneActive(true);
        }}
        onDragLeave={() => {
          setDropZoneActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDropZoneActive(false);
          if (draggedSkill) {
            handleSkillToggle(draggedSkill);
            setDraggedSkill(null);
          }
        }}
        className={`min-h-[200px] p-8 rounded-3xl border-4 border-dashed transition-all ${
          dropZoneActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        <h4 className="text-2xl font-semibold text-gray-700 mb-4">
          Your Skills ({selected.length})
        </h4>
        
        {selected.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-xl text-gray-500">
              {canvasMode
                ? 'Drag skill bubbles here or tap them to add'
                : 'Select skills from below'}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {selected.map((skill) => (
              <div
                key={skill.id}
                onClick={() => handleSkillToggle(skill)}
                className="group relative px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-xl font-semibold cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {skill.name}
                <span className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  ✕
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Skills by Category */}
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, skills]) => (
          <div key={category}>
            <h4 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {category}
            </h4>
            
            <div className="flex flex-wrap gap-4">
              {skills.map((skill) => {
                const isSelected = selected.some(s => s.id === skill.id);
                
                return (
                  <div
                    key={skill.id}
                    draggable={canvasMode && !isSelected}
                    onDragStart={() => {
                      setDraggedSkill(skill);
                    }}
                    onDragEnd={() => {
                      setDraggedSkill(null);
                    }}
                    onClick={() => handleSkillToggle(skill)}
                    className={`
                      relative px-6 py-4 rounded-full text-xl font-semibold
                      transition-all transform cursor-pointer
                      ${isSelected
                        ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                        : canvasMode
                          ? 'bg-white text-gray-700 border-4 border-gray-300 hover:border-blue-400 hover:shadow-xl hover:scale-105 active:scale-95'
                          : 'bg-white text-gray-700 border-4 border-gray-300 hover:bg-blue-500 hover:text-white hover:border-blue-500 hover:shadow-xl active:scale-95'
                      }
                      ${draggedSkill?.id === skill.id ? 'opacity-50' : ''}
                      ${!isSelected && canvasMode ? 'cursor-grab active:cursor-grabbing' : ''}
                    `}
                    style={{
                      touchAction: 'none', // Prevent default touch actions
                      minWidth: '120px',
                      minHeight: '56px', // 44px is minimum touch target, adding padding
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && '✓ '}
                    {skill.name}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <p className="text-lg text-gray-700">
          <strong className="text-blue-600">💡 Tip:</strong>{' '}
          {canvasMode
            ? 'Drag skills to your skills area, or tap to toggle. Tap selected skills to remove them.'
            : 'Tap skills to add them to your profile. Tap again to remove.'}
        </p>
      </div>

      {/* Selected Count Summary */}
      {selected.length > 0 && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t-4 border-gray-200 p-6 rounded-t-3xl shadow-2xl">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {selected.length} skill{selected.length !== 1 ? 's' : ''} selected
              </p>
              <p className="text-lg text-gray-600">
                Great progress! {selected.length >= 5 ? "That's a solid skillset!" : 'Add more if you can.'}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Continue button clicked, selected skills:', selected);
                if (onContinue && selected.length > 0) {
                  onContinue()
                } else {
                  console.warn('Cannot continue: no onContinue handler or no skills selected')
                }
              }}
              disabled={selected.length === 0}
              className="px-12 py-6 bg-blue-600 text-white rounded-2xl text-2xl font-bold hover:bg-blue-700 shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
