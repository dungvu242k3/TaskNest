import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Lock,
  Share2,
  Trash2,
  Filter,
  Pin,
  Plus,
  Search,
  CheckSquare,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';

interface NotesPageProps {
  onOpenCreateNoteModal?: () => void;
  onOpenShareModal?: () => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  onOpenCreateNoteModal,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notes, togglePinNote, deleteNote } = useAppStore();

  const currentTab = searchParams.get('tab') || 'all';
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  let filteredNotes = notes;
  if (currentTab === 'private') {
    filteredNotes = notes.filter((n) => n.isPrivate);
  } else if (currentTab === 'shared') {
    filteredNotes = notes.filter((n) => !n.isPrivate);
  }

  if (filterPriority !== 'all') {
    filteredNotes = filteredNotes.filter((n) => n.priority === filterPriority);
  }

  if (searchFilter.trim()) {
    filteredNotes = filteredNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.content.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }

  // Auto-Sort: Pinned notes ALWAYS float to the very top
  filteredNotes.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'all') {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    });
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-4rem)]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Khung làm việc Ghi chú
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Quản lý Ghi chú Công việc
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổ chức kho ghi chú cá nhân & hợp tác công việc cùng nhóm hiệu quả ({filteredNotes.length} bài sẵn sàng).
          </p>
        </div>

        <button
          onClick={onOpenCreateNoteModal}
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 shrink-0 border border-indigo-400/30"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Ghi chú mới</span>
        </button>
      </div>

      {/* Control Toolbar */}
      <div className="glass-panel p-2.5 sm:p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-border/70 bg-surface/40 backdrop-blur-xl shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentTab === 'all'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Tất cả ghi chú</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono">
              {notes.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('private')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentTab === 'private'
                ? 'bg-amber-600 text-white shadow-glow-amber'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Lock className="h-4 w-4 text-amber-400" />
            <span>Ghi chú riêng tư</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono">
              {notes.filter((n) => n.isPrivate).length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('shared')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentTab === 'shared'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span>Ghi chú chung</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono">
              {notes.filter((n) => !n.isPrivate).length}
            </span>
          </button>
        </div>

        {/* Search & Priority Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Lọc danh sách ghi chú..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background/70 border border-surface-border/70 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-background/70 px-3 py-2 rounded-xl border border-surface-border/70 shrink-0">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">Tất cả độ ưu tiên</option>
              <option value="P1">Cao</option>
              <option value="P2">Trung bình</option>
              <option value="P3">Thấp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bento Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-4 border border-surface-border/60 bg-surface/30 backdrop-blur-xl">
          <div className="h-14 w-14 rounded-3xl bg-slate-800 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <FileText className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Không tìm thấy Ghi chú</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Không có ghi chú nào phù hợp với bộ lọc tìm kiếm hiện tại. Hãy tạo ghi chú mới ngay!
          </p>
          <button
            onClick={onOpenCreateNoteModal}
            className="py-2.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            Tạo Ghi chú mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const completedCount = note.checklist.filter((c) => c.completed).length;
            const totalCount = note.checklist.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={note.id}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:border-indigo-500/40 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out group cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span
                      className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-colors ${
                        note.isPrivate
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {note.isPrivate ? <Lock className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                      {note.isPrivate ? 'Riêng tư' : 'Ghi chú chung'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={note.priority} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinNote(note.id);
                        }}
                        className={`p-1.5 rounded-xl transition-all duration-200 ${
                          note.pinned
                            ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30'
                            : 'text-slate-500 hover:text-slate-300 border border-transparent'
                        }`}
                        title={note.pinned ? 'Bỏ ghim' : 'Ghim bài'}
                      >
                        <Pin className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ghi chú "${note.title || 'chưa đặt tên'}"? Dữ liệu sẽ bị xóa hoàn toàn ở cả hệ thống và cơ sở dữ liệu Supabase.`)) {
                            deleteNote(note.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30 border border-transparent transition-all duration-200"
                        title="Xóa vĩnh viễn ghi chú khỏi DB"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 tracking-tight">
                    {note.title || 'Ghi chú chưa đặt tên'}
                  </h3>
                  <p className="text-xs text-slate-300/80 mt-2 line-clamp-3 leading-relaxed font-normal">
                    {note.content || 'Chưa có nội dung ghi chú.'}
                  </p>

                  {/* Checklist Mini Progress Bar */}
                  {totalCount > 0 && (
                    <div className="mt-4 pt-3 border-t border-surface-border/40 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                          <span>Checklist ({completedCount}/{totalCount})</span>
                        </span>
                        <span className="font-mono font-semibold text-indigo-400">{percent}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3.5 border-t border-surface-border/40 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </span>
                  {!note.isPrivate && <AvatarStack members={note.members} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
