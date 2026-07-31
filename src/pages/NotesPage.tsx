import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Lock,
  Share2,
  Trash2,
  Filter,
  Pin,
  Plus,
  Search,
  CheckCircle2,
  CheckSquare,
  Calendar,
  UserPlus,
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';
import { PriorityLevel } from '../types';

interface NotesPageProps {
  onOpenCreateNoteModal?: () => void;
  onOpenShareModal?: () => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  onOpenCreateNoteModal,
  onOpenShareModal,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const {
    notes,
    togglePinNote,
    updateNote,
    toggleChecklistItem,
    addChecklistItem,
    deleteNote,
  } = useAppStore();

  const currentTab = searchParams.get('tab') || 'all';
  const noteIdParam = routeId || searchParams.get('id');

  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(noteIdParam);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [savedStatus, setSavedStatus] = useState('Đã đồng bộ kết nối');

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

  // Synchronize active selected note
  useEffect(() => {
    if (noteIdParam && notes.some((n) => n.id === noteIdParam)) {
      setSelectedNoteId(noteIdParam);
    } else if (filteredNotes.length > 0) {
      if (!selectedNoteId || !filteredNotes.some((n) => n.id === selectedNoteId)) {
        setSelectedNoteId(filteredNotes[0].id);
      }
    } else {
      setSelectedNoteId(null);
    }
  }, [filteredNotes, noteIdParam, notes, selectedNoteId]);

  const handleTabChange = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    const tab = searchParams.get('tab');
    const tabQuery = tab ? `?tab=${tab}` : '';
    navigate(`/notes/${id}${tabQuery}`);
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleTitleChange = (val: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { title: val });
    setSavedStatus('Đang lưu thay đổi...');
    setTimeout(() => setSavedStatus('Đã đồng bộ 1 giây trước'), 600);
  };

  const handleContentChange = (val: string) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { content: val });
    setSavedStatus('Đang lưu thay đổi...');
    setTimeout(() => setSavedStatus('Đã đồng bộ 1 giây trước'), 600);
  };

  const handleTogglePrivate = () => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { isPrivate: !selectedNote.isPrivate });
  };

  const handlePriorityChange = (newPriority: PriorityLevel) => {
    if (!selectedNote) return;
    updateNote(selectedNote.id, { priority: newPriority });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNote || !newChecklistText.trim()) return;
    addChecklistItem(selectedNote.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  const handleDeleteCurrentNote = () => {
    if (!selectedNote) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
      deleteNote(selectedNote.id);
      setSelectedNoteId(null);
    }
  };

  const completedChecklistCount = selectedNote
    ? selectedNote.checklist.filter((c) => c.completed).length
    : 0;
  const totalChecklistCount = selectedNote ? selectedNote.checklist.length : 0;
  const progressPercent =
    totalChecklistCount > 0
      ? Math.round((completedChecklistCount / totalChecklistCount) * 100)
      : 0;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden bg-background">
      {/* LEFT COLUMN: Master List & Filters */}
      <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col border-r border-surface-border bg-surface/20">
        {/* Header & New Note Action */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Ghi chú Công việc</h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {filteredNotes.length} ghi chú sẵn sàng
            </p>
          </div>

          <button
            onClick={onOpenCreateNoteModal}
            className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo mới</span>
          </button>
        </div>

        {/* Search & Priority Filter Bar */}
        <div className="p-3.5 border-b border-surface-border space-y-2.5 bg-background/50">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Tìm kiếm danh sách ghi chú..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-background border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  currentTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }`}
              >
                Tất cả ({notes.length})
              </button>

              <button
                onClick={() => handleTabChange('private')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  currentTab === 'private'
                    ? 'bg-amber-600 text-white shadow-glow-amber'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }`}
              >
                <Lock className="h-3 w-3 text-amber-400" />
                <span>Riêng tư</span>
              </button>

              <button
                onClick={() => handleTabChange('shared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                  currentTab === 'shared'
                    ? 'bg-indigo-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }`}
              >
                <Share2 className="h-3 w-3 text-indigo-400" />
                <span>Chung</span>
              </button>
            </div>

            <div className="flex items-center gap-1 bg-background px-2 py-1 rounded-lg border border-surface-border shrink-0">
              <Filter className="h-3 w-3 text-slate-400" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent text-[11px] text-slate-300 focus:outline-none"
              >
                <option value="all">Tất cả độ ưu tiên</option>
                <option value="P1">P1 Cao</option>
                <option value="P2">P2 Trung bình</option>
                <option value="P3">P3 Thấp</option>
              </select>
            </div>
          </div>
        </div>

        {/* Note Items Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center space-y-2.5 text-slate-400">
              <FileText className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-xs font-medium">Không tìm thấy Ghi chú nào</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              return (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/60 shadow-glow'
                      : 'bg-surface/50 border-surface-border/60 hover:bg-surface-hover hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                          note.isPrivate
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
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
                          className={`p-1 rounded transition-colors ${
                            note.pinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                          }`}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3
                      className={`text-sm font-bold transition-colors line-clamp-1 ${
                        isSelected ? 'text-indigo-300' : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {note.title || 'Ghi chú chưa đặt tên'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {note.content || 'Chưa có nội dung ghi chú.'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-surface-border/40 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      {note.checklist.length > 0
                        ? `${note.checklist.filter((c) => c.completed).length}/${note.checklist.length} việc`
                        : new Date(note.updatedAt).toLocaleDateString('vi-VN')}
                    </span>
                    {!note.isPrivate && <AvatarStack members={note.members} />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Middle Workspace Container (Detail & Live Editor) */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-surface/30 p-6 sm:p-8">
        {selectedNote ? (
          <div className="max-w-4xl mx-auto w-full space-y-6 flex-1 flex flex-col">
            {/* Top Toolbar / Action Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-surface-border shrink-0">
              <div className="flex items-center gap-3">
                {/* Privacy Toggle */}
                <button
                  onClick={handleTogglePrivate}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    selectedNote.isPrivate
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {selectedNote.isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{selectedNote.isPrivate ? 'Ghi chú Riêng tư' : 'Ghi chú chung'}</span>
                </button>

                {/* Priority Selector */}
                <select
                  value={selectedNote.priority}
                  onChange={(e) => handlePriorityChange(e.target.value as PriorityLevel)}
                  className="bg-background text-xs text-slate-300 px-3 py-1.5 rounded-xl border border-surface-border focus:outline-none focus:border-indigo-500"
                >
                  <option value="P1">P1 • Cao</option>
                  <option value="P2">P2 • Trung bình</option>
                  <option value="P3">P3 • Thấp</option>
                </select>

                <button
                  onClick={() => togglePinNote(selectedNote.id)}
                  className={`p-2 rounded-xl border transition-colors ${
                    selectedNote.pinned
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 border-surface-border'
                  }`}
                  title={selectedNote.pinned ? 'Bỏ ghim' : 'Ghim bài'}
                >
                  <Pin className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden sm:flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {savedStatus}
                </span>

                {!selectedNote.isPrivate && onOpenShareModal && (
                  <button
                    onClick={onOpenShareModal}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Chia sẻ</span>
                  </button>
                )}

                <button
                  onClick={handleDeleteCurrentNote}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-surface-border"
                  title="Xóa ghi chú"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Note Editor Main Canvas */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 flex-1 flex flex-col border border-surface-border">
              {/* Meta information */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pb-3 border-b border-surface-border/60">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Hạn chót: {selectedNote.dueDate || 'Chưa thiết lập'}
                </span>
                <span>
                  Cập nhật lúc{' '}
                  {new Date(selectedNote.updatedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Title Input */}
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nhập tiêu đề ghi chú công việc..."
                className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight"
              />

              {/* Content Textarea */}
              <textarea
                rows={8}
                value={selectedNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Nhập chi tiết ghi chú tại đây..."
                className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-sm leading-relaxed resize-none flex-1 min-h-[160px]"
              />

              {/* Checklist Progress & Items */}
              <div className="pt-6 border-t border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4 text-indigo-400" /> Danh sách công việc (
                    {completedChecklistCount}/{totalChecklistCount})
                  </h4>
                  <span className="text-xs font-mono font-semibold text-indigo-400">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Checklist items */}
                <div className="space-y-2 pt-1">
                  {selectedNote.checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleChecklistItem(selectedNote.id, item.id)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-surface-border/60 hover:border-slate-600 transition-colors cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span
                        className={`text-xs ${
                          item.completed ? 'line-through text-slate-400' : 'text-slate-200'
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add new checklist form */}
                <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Thêm công việc mới vào checklist..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-surface-hover text-slate-200 hover:text-white border border-surface-border text-xs font-semibold transition-colors"
                  >
                    Thêm việc
                  </button>
                </form>
              </div>

              {/* Footer details: Members & Tags */}
              <div className="pt-4 border-t border-surface-border flex flex-wrap items-center justify-between gap-3 text-xs">
                {!selectedNote.isPrivate && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Thành viên:</span>
                    <AvatarStack members={selectedNote.members} />
                  </div>
                )}

                {selectedNote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State when no note is selected */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 glass-panel rounded-3xl border border-surface-border space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-800 text-indigo-400 flex items-center justify-center shadow-inner">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Chọn một ghi chú để bắt đầu</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Chọn bất kỳ ghi chú nào từ danh sách bên trái để xem chi tiết và chỉnh sửa trực tiếp tại không gian làm việc này.
            </p>
            <button
              onClick={onOpenCreateNoteModal}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              Tạo Ghi chú mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
