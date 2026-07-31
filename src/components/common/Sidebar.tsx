import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Lock,
  Share2,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notes, addNote } = useAppStore();

  const [isNotesMenuOpen, setIsNotesMenuOpen] = useState(true);

  const privateCount = notes.filter((n) => n.isPrivate).length;
  const sharedCount = notes.filter((n) => !n.isPrivate).length;

  const handleCreateQuickNote = (isPrivate: boolean) => {
    const title = prompt(isPrivate ? 'Nhập tiêu đề Ghi chú Riêng tư mới:' : 'Nhập tiêu đề Ghi chú Nhóm mới:');
    if (title && title.trim()) {
      const newNote = addNote(title.trim(), isPrivate);
      navigate(`/notes/${newNote.id}`);
    }
  };

  const isNotesActive = location.pathname.startsWith('/notes');
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || (location.pathname === '/notes' ? 'all' : '');

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-surface-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-white leading-none">TaskNest</h1>
              <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Không gian làm việc</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCreateQuickNote(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold transition-all"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>+ Riêng tư</span>
            </button>
            <button
              onClick={() => handleCreateQuickNote(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all shadow-glow"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Dùng chung</span>
            </button>
          </div>
        </div>

        {/* Hierarchical Navigation Menu */}
        <nav className="px-3 space-y-1">
          {/* 1. Tổng quan Dashboard */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
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
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isNotesActive
                  ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
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
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isNotesActive && (currentTab === 'all' || !currentTab)
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
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
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isNotesActive && currentTab === 'private'
                        ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
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

                {/* Child 3: Ghi chú dùng chung */}
                <NavLink
                  to="/notes?tab=shared"
                  className={() =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isNotesActive && currentTab === 'shared'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
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
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isNotesActive && currentTab === 'trash'
                        ? 'bg-slate-800 text-slate-200 font-semibold border border-slate-700'
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
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
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
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
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

      {/* User Footer Profile */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Dũng Vũ"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/50"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-200 truncate leading-tight">Dũng Vũ</h4>
            <p className="text-[10px] text-slate-400 truncate">dung.vu@tasknest.io</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
