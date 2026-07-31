import React, { useState } from 'react';
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
  const { notes, togglePinNote } = useAppStore();

  const currentTab = searchParams.get('tab') || 'all';
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  let filteredNotes = notes;
  if (currentTab === 'private') {
    filteredNotes = notes.filter((n) => n.isPrivate);
  } else if (currentTab === 'shared') {
    filteredNotes = notes.filter((n) => !n.isPrivate);
  } else if (currentTab === 'trash') {
    filteredNotes = [];
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
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Quản lý Ghi chú Công việc
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tổ chức kho ghi chú cá nhân & hợp tác công việc cùng nhóm hiệu quả.
          </p>
        </div>

        <button
          onClick={onOpenCreateNoteModal}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Ghi chú mới</span>
        </button>
      </div>

      {/* Tabs Bar & Filters */}
      <div className="glass-panel p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-surface-border/60 bg-surface/30">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
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

          <button
            onClick={() => handleTabChange('trash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'trash'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>Thùng rác</span>
          </button>
        </div>

        {/* Priority Filter & Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Lọc danh sách ghi chú..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-background/60 border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-background/60 px-3 py-2 rounded-xl border border-surface-border shrink-0">
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

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3 border border-surface-border/60 bg-surface/30">
          <div className="h-12 w-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">Không tìm thấy Ghi chú</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Không có ghi chú nào phù hợp với bộ lọc tìm kiếm hiện tại. Hãy tạo ghi chú mới ngay!
          </p>
          <button
            onClick={onOpenCreateNoteModal}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            Tạo Ghi chú mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between group relative border border-surface-border/60 bg-surface/30 hover:border-indigo-500/40 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${
                      note.isPrivate
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {note.isPrivate ? <Lock className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                    {note.isPrivate ? 'Riêng tư' : 'Ghi chú chung'}
                  </span>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={note.priority} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinNote(note.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        note.pinned ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {note.title || 'Ghi chú chưa đặt tên'}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {note.content || 'Chưa có nội dung ghi chú.'}
                </p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-400 font-mono">
                  {note.checklist.length > 0
                    ? `${note.checklist.filter((c) => c.completed).length}/${note.checklist.length} Công việc`
                    : new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                </span>
                {!note.isPrivate && <AvatarStack members={note.members} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
