import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, Bell, LogIn } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { CURRENT_USER } from '../../constants/mockData';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { toggleCommandPalette } = useAppStore();

  return (
    <header className="h-16 bg-surface/50 backdrop-blur-md border-b border-surface-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Placeholder Area */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-medium w-48">
        {/* Placeholder to keep search bar perfectly centered */}
      </div>

      {/* Centered Search Bar / Command Palette Trigger */}
      <div className="flex-1 max-w-md mx-auto flex justify-center">
        <button
          onClick={toggleCommandPalette}
          aria-label="Tìm kiếm hoặc gõ lệnh"
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-background/80 border border-surface-border text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-all text-xs group focus:outline-none"
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

      {/* Right Header Actions: Notification Bell + Login Link + User Profile Avatar */}
      <div className="flex items-center justify-end gap-3 w-48">
        {/* Notifications */}
        <button
          aria-label="Thông báo"
          title="Thông báo hệ thống"
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors focus:outline-none"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        </button>

        {/* Demo Login Page Link */}
        <button
          onClick={() => navigate('/login')}
          title="Trang Đăng nhập / Đăng ký"
          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors focus:outline-none flex items-center gap-1.5 text-xs font-semibold"
        >
          <LogIn className="h-4 w-4" />
          <span className="hidden sm:inline">Đăng nhập</span>
        </button>

        {/* User Profile Avatar Link */}
        <button
          onClick={() => navigate('/settings?tab=profile')}
          aria-label="Hồ sơ cá nhân"
          title="Xem hồ sơ cá nhân"
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-surface-hover transition-colors focus:outline-none group"
        >
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.fullName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition-all"
          />
        </button>
      </div>
    </header>
  );
};
