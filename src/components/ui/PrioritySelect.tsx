import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertCircle, Clock, ShieldAlert } from 'lucide-react';
import { PriorityLevel } from '../../types';

interface PrioritySelectProps {
  priority: PriorityLevel;
  onChange: (priority: PriorityLevel) => void;
  className?: string;
  size?: 'sm' | 'md';
  position?: 'top' | 'bottom' | 'auto';
}

const priorityOptions: { value: PriorityLevel; label: string; sublabel: string; color: string; badgeBg: string; border: string; icon: React.ReactNode }[] = [
  {
    value: 'P1',
    label: 'Cao (High)',
    sublabel: 'Ưu tiên khẩn cấp',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    border: 'border-rose-500/40',
    icon: <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />,
  },
  {
    value: 'P2',
    label: 'Trung bình (Medium)',
    sublabel: 'Tiến độ bình thường',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/40',
    icon: <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />,
  },
  {
    value: 'P3',
    label: 'Thấp (Low)',
    sublabel: 'Có thể làm sau',
    color: 'text-slate-400',
    badgeBg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    border: 'border-slate-500/40',
    icon: <Clock className="h-4 w-4 text-slate-400 shrink-0" />,
  },
];

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
  priority,
  onChange,
  className = '',
  size = 'md',
  position = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popDirection, setPopDirection] = useState<'top' | 'bottom'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = priorityOptions.find((opt) => opt.value === priority) || priorityOptions[1];

  // Auto detect position
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      if (position === 'top') {
        setPopDirection('top');
      } else if (position === 'bottom') {
        setPopDirection('bottom');
      } else {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 200 && rect.top > 200) {
          setPopDirection('top');
        } else {
          setPopDirection('bottom');
        }
      }
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl border bg-background/60 hover:bg-surface-hover/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 select-none ${
          selectedOption.border
        } ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2.5 text-xs sm:text-sm'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selectedOption.icon}
          <span className="font-semibold text-slate-100 truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div
          className={`absolute right-0 left-0 z-50 rounded-2xl bg-[#141824]/95 backdrop-blur-xl border border-surface-border/80 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
            popDirection === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {priorityOptions.map((opt) => {
            const isSelected = opt.value === priority;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? `${opt.badgeBg} font-bold shadow-xs`
                    : 'text-slate-300 hover:bg-surface-hover/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {opt.icon}
                  <div>
                    <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                    <div className="text-[10px] text-slate-400/80 font-normal leading-tight mt-0.5">
                      {opt.sublabel}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
