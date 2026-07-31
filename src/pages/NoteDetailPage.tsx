import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Lock,
  Share2,
  UserPlus,
  CheckCircle2,
  CheckSquare,
  Plus,
  Tag,
  Calendar,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Check,
  X,
  Circle,
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';
import { PriorityLevel } from '../types';

interface NoteDetailPageProps {
  onOpenShareModal?: () => void;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ onOpenShareModal }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    notes,
    toggleChecklistItem,
    updateNote,
    addChecklistItem,
    deleteChecklistItem,
    updateChecklistItem,
  } = useAppStore();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate ?? true);
  const [priority, setPriority] = useState<PriorityLevel>(note?.priority || 'P2');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [savedStatus, setSavedStatus] = useState('Đã tự động lưu');

  // Inline editing state for checklist items
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemText, setEditingItemText] = useState<string>('');

  if (!note) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
        <div className="p-10 rounded-3xl text-center text-slate-400 space-y-4 max-w-md w-full border border-surface-border/60 bg-surface/30 shadow-2xl backdrop-blur-xl">
          <h2 className="text-xl font-bold text-white">Không tìm thấy Ghi chú</h2>
          <p className="text-xs text-slate-400">Ghi chú này không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/notes')}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            Quay lại danh sách ghi chú
          </button>
        </div>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    updateNote(note.id, { title: val });
    setSavedStatus('Đang lưu thay đổi...');
    setTimeout(() => setSavedStatus('Đã tự động lưu'), 600);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    updateNote(note.id, { content: val });
    setSavedStatus('Đang lưu thay đổi...');
    setTimeout(() => setSavedStatus('Đã tự động lưu'), 600);
  };

  const handleTogglePrivate = () => {
    const nextPrivate = !isPrivate;
    setIsPrivate(nextPrivate);
    updateNote(note.id, { isPrivate: nextPrivate });
  };

  const handlePriorityChange = (newPriority: PriorityLevel) => {
    setPriority(newPriority);
    updateNote(note.id, { priority: newPriority });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    addChecklistItem(note.id, newChecklistText.trim());
    setNewChecklistText('');
  };

  const startEditingItem = (itemId: string, currentText: string) => {
    setEditingItemId(itemId);
    setEditingItemText(currentText);
  };

  const saveEditingItem = (itemId: string) => {
    if (editingItemText.trim()) {
      updateChecklistItem(note.id, itemId, editingItemText.trim());
    }
    setEditingItemId(null);
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
  };

  const handleDeleteItem = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    deleteChecklistItem(note.id, itemId);
  };

  const completedChecklistCount = note.checklist.filter((c) => c.completed).length;
  const totalChecklistCount = note.checklist.length;
  const progressPercent =
    totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  return (
    <div className="py-8 px-4 sm:px-8 max-w-6xl mx-auto space-y-8 min-h-[calc(100vh-4rem)] flex flex-col justify-start">
      {/* 2-Column Notion/Craft Editorial Split Layout with Balanced Dimension Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start flex-1">
        {/* LEFT COLUMN: Main Writing & Task Canvas Card (2/3 width) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-10 rounded-3xl border border-surface-border/70 space-y-6 shadow-2xl bg-surface/30 backdrop-blur-xl">
          {/* Main Title Input */}
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Nhập tiêu đề ghi chú..."
            className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight border-b border-surface-border/40 pb-3 focus:border-indigo-500/60 transition-colors"
          />

          {/* Main Content Textarea */}
          <textarea
            rows={7}
            value={content}
            onChange={handleContentChange}
            placeholder="Nhập nội dung chi tiết ghi chú tại đây..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-sm sm:text-base leading-relaxed resize-none min-h-[160px]"
          />

          {/* Divider */}
          <div className="h-px bg-surface-border/40 my-2" />

          {/* Checklist Section with Interactive Edit & Delete */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-400" />
                <span>
                  DANH SÁCH CÔNG VIỆC ({completedChecklistCount}/{totalChecklistCount})
                </span>
              </h4>
              <span className="text-xs font-mono font-bold text-indigo-400">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            {totalChecklistCount > 0 && (
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 shadow-glow"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}

            {/* Checklist item cards */}
            <div className="space-y-2.5 pt-1">
              {note.checklist.map((item) => {
                const isEditing = editingItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isEditing) {
                        toggleChecklistItem(note.id, item.id);
                      }
                    }}
                    className={`flex items-center justify-between gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 group select-none ${
                      isEditing
                        ? 'bg-background/80 border-indigo-500/60 shadow-glow'
                        : item.completed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 shadow-glow-emerald cursor-pointer'
                        : 'bg-surface/30 border-surface-border/50 hover:border-indigo-500/40 hover:bg-surface-hover/50 text-slate-200 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {!isEditing &&
                        (item.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 transition-all duration-200 scale-110" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 shrink-0 transition-colors duration-200" />
                        ))}

                      {isEditing ? (
                        <div
                          className="flex items-center gap-2 flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingItemText}
                            onChange={(e) => setEditingItemText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditingItem(item.id);
                              if (e.key === 'Escape') cancelEditingItem();
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1.5 rounded-xl bg-background border border-indigo-500/60 text-xs sm:text-sm text-white focus:outline-none"
                          />
                          <button
                            onClick={() => saveEditingItem(item.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                            title="Lưu công việc"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={cancelEditingItem}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Hủy"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-xs sm:text-sm flex-1 truncate transition-all duration-200 ${
                            item.completed
                              ? 'line-through text-slate-400/80 font-normal'
                              : 'text-slate-200 font-medium'
                          }`}
                        >
                          {item.text}
                        </span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {/* Edit item button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingItem(item.id, item.text);
                          }}
                          aria-label="Sửa công việc"
                          title="Sửa công việc"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors focus:outline-none"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete item button */}
                        <button
                          onClick={(e) => handleDeleteItem(e, item.id)}
                          aria-label="Xóa công việc"
                          title="Xóa công việc"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Checklist Item Form */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Thêm một công việc mới..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-background/60 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all shrink-0 focus:outline-none"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm công việc</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Metadata Inspector Panel Card (1/3 width, matching dimensions) */}
        <div className="lg:col-span-1 space-y-5 sticky top-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border/70 bg-surface/30 backdrop-blur-xl space-y-5 shadow-xl">
            {/* Privacy Setting */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Quyền truy cập</label>
              <button
                onClick={handleTogglePrivate}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                  isPrivate
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                  {isPrivate ? 'Ghi chú Riêng tư' : 'Ghi chú chung'}
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Đổi</span>
              </button>
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400 font-medium">Mức độ ưu tiên</label>
                <PriorityBadge priority={priority} />
              </div>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value as PriorityLevel)}
                className="w-full bg-background/60 text-xs text-slate-300 px-3.5 py-2.5 rounded-xl border border-surface-border/60 focus:outline-none focus:border-indigo-500/80 transition-colors"
              >
                <option value="P1">Cao</option>
                <option value="P2">Trung bình</option>
                <option value="P3">Thấp</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Hạn chót</label>
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-background/50 px-3.5 py-2.5 rounded-xl border border-surface-border/40 font-mono">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{note.dueDate || 'Chưa thiết lập'}</span>
              </div>
            </div>

            {/* Collaborators if shared */}
            {!isPrivate && (
              <div className="space-y-2 pt-1 border-t border-surface-border/40">
                <label className="text-xs text-slate-400 font-medium flex items-center justify-between">
                  <span>Thành viên cùng tham gia</span>
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold">
                    {note.members.length} người
                  </span>
                </label>
                <div className="pt-1">
                  <AvatarStack members={note.members} showNames={true} />
                </div>
              </div>
            )}

            {/* Share Action */}
            {!isPrivate && onOpenShareModal && (
              <div className="pt-2">
                <button
                  onClick={onOpenShareModal}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all focus:outline-none"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Chia sẻ ghi chú</span>
                </button>
              </div>
            )}

            {/* Hashtag Tags */}
            {note.tags.length > 0 && (
              <div className="pt-3 border-t border-surface-border/40">
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-xl bg-background/60 text-slate-300 border border-surface-border/60 font-mono font-medium hover:border-slate-500 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
