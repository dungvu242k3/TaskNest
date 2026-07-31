import React from 'react';
import { Search, Command, Bell, UserPlus } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

interface HeaderProps {
  onOpenShareModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShareModal }) => {
  const { toggleCommandPalette } = useAppStore();

  return (
    <header className="h-16 bg-surface/50 backdrop-blur-md border-b border-surface-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar / Command Palette Trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={toggleCommandPalette}
          aria-label="Tìm kiếm hoặc gõ lệnh"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-background/80 border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span>Tìm kiếm ghi chú hoặc gõ lệnh...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-slate-300 rounded border border-slate-700">
            <Command className="h-3 w-3" /> K
          </kbd>
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Mời thành viên</span>
          </button>
        )}

        {/* Notifications */}
        <button
          aria-label="Thông báo"
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        </button>
      </div>
    </header>
  );
};
