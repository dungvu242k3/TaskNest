import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Edit3, Eye } from 'lucide-react';
import { MemberPermission } from '../../types';

interface PermissionSelectProps {
  permission: MemberPermission;
  onChange: (permission: MemberPermission) => void;
  className?: string;
}

const permissionOptions: {
  value: MemberPermission;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'edit',
    label: 'Có quyền sửa',
    sublabel: 'Cho phép chỉnh sửa nội dung',
    icon: <Edit3 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />,
  },
  {
    value: 'view',
    label: 'Có quyền xem',
    sublabel: 'Chỉ xem nội dung ghi chú',
    icon: <Eye className="h-3.5 w-3.5 text-slate-400 shrink-0" />,
  },
];

export const PermissionSelect: React.FC<PermissionSelectProps> = ({
  permission,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    permissionOptions.find((opt) => opt.value === permission) || permissionOptions[0];

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
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-surface-border bg-background/80 hover:bg-surface-hover/80 text-xs font-semibold text-slate-200 transition-all duration-200 focus:outline-none focus:border-indigo-500/80 select-none min-w-[130px]"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {selectedOption.icon}
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Floating Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 z-50 w-52 rounded-2xl bg-[#141824]/95 backdrop-blur-xl border border-surface-border/80 shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          {permissionOptions.map((opt) => {
            const isSelected = opt.value === permission;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'bg-indigo-500/15 text-indigo-300 font-bold border border-indigo-500/30 shadow-xs'
                    : 'text-slate-300 hover:bg-surface-hover/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.icon}
                  <div>
                    <div className="text-xs font-semibold leading-tight">{opt.label}</div>
                    <div className="text-[10px] text-slate-400/80 font-normal leading-tight mt-0.5">
                      {opt.sublabel}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
