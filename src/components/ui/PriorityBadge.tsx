import React from 'react';
import { PriorityLevel } from '../../types';

interface PriorityBadgeProps {
  priority: PriorityLevel;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const getBadgeStyle = () => {
    switch (priority) {
      case 'P1':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'P2':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'P3':
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const getLabel = () => {
    switch (priority) {
      case 'P1':
        return 'P1 • High';
      case 'P2':
        return 'P2 • Medium';
      case 'P3':
        return 'P3 • Low';
      default:
        return priority;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getBadgeStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
};
