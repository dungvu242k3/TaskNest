import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Lock,
  Share2,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

interface SidebarProps {
  onOpenCreateNoteModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateNoteModal }) => {
  const location = useLocation();
  const { notes } = useAppStore();

  const [isNotesMenuOpen, setIsNotesMenuOpen] = useState(true);

  const privateCount = notes.filter((n) => n.isPrivate).length;
  const sharedCount = notes.filter((n) => !n.isPrivate).length;

  const isNotesActive = location.pathname.startsWith('/notes');
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || (location.pathname === '/notes' ? 'all' : '');

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-surface-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Layers className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">TaskNest</h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Không gian làm việc</span>
            </div>
          </div>
        </div>

        {/* Combined Single Primary Action Button */}
        <div className="p-4">
          <button
            onClick={onOpenCreateNoteModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-colors focus:outline-none"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo ghi chú mới</span>
          </button>
        </div>

        {/* Hierarchical Navigation Menu */}
        <nav className="px-3 space-y-1">
          {/* 1. Tổng quan Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-4 w-4" />
              <span>Tổng quan</span>
            </div>
          </NavLink>

          {/* 2. Parent Category: Ghi chú công việc (Hierarchical Collapsible Parent) */}
          <div>
            <button
              onClick={() => setIsNotesMenuOpen(!isNotesMenuOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold border border-transparent transition-colors focus:outline-none ${
                isNotesActive
                  ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="h-4 w-4 text-indigo-400" />
                <span>Ghi chú công việc</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {notes.length}
                </span>
                {isNotesMenuOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </div>
            </button>

            {/* Child Sub-Menu items (Indented) */}
            {isNotesMenuOpen && (
              <div className="ml-4 pl-3 border-l border-surface-border/60 my-1 space-y-1">
                {/* Child 1: Tất cả ghi chú */}
                <NavLink
                  to="/notes?tab=all"
                  className={() =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                      isNotesActive && (currentTab === 'all' || !currentTab)
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                    <span>Tất cả ghi chú</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{notes.length}</span>
                </NavLink>

                {/* Child 2: Ghi chú riêng tư */}
                <NavLink
                  to="/notes?tab=private"
                  className={() =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                      isNotesActive && currentTab === 'private'
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="h-3.5 w-3.5 text-amber-400" />
                    <span>Ghi chú riêng tư</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">{privateCount}</span>
                </NavLink>

                {/* Child 3: Ghi chú chung */}
                <NavLink
                  to="/notes?tab=shared"
                  className={() =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                      isNotesActive && currentTab === 'shared'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Ghi chú chung</span>
                  </div>
                  <span className="text-[10px] text-indigo-400/80 font-mono">{sharedCount}</span>
                </NavLink>

                {/* Child 4: Thùng rác */}
                <NavLink
                  to="/notes?tab=trash"
                  className={() =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                      isNotesActive && currentTab === 'trash'
                        ? 'bg-slate-800 text-slate-200 font-semibold border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>Thùng rác</span>
                  </div>
                </NavLink>
              </div>
            )}
          </div>

          {/* 3. Quản lý nhóm */}
          <NavLink
            to="/team"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4" />
              <span>Quản lý nhóm</span>
            </div>
          </NavLink>

          {/* 4. Cài đặt */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent transition-colors focus:outline-none ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-surface-hover'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              <span>Cài đặt</span>
            </div>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};
