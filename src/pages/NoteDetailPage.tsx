import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Share2,
  UserPlus,
  Trash2,
  CheckCircle2,
  CheckSquare,
  Plus,
  Tag,
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
  const { notes, toggleChecklistItem, deleteNote, updateNote, addChecklistItem } = useAppStore();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate ?? true);
  const [priority, setPriority] = useState<PriorityLevel>(note?.priority || 'P2');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [savedStatus, setSavedStatus] = useState('Đã lưu vào Supabase');

  if (!note) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
        <div className="glass-panel p-10 rounded-3xl text-center text-slate-400 space-y-4 max-w-md w-full border border-surface-border">
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
    setTimeout(() => setSavedStatus('Đã lưu vào Supabase'), 800);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    updateNote(note.id, { content: val });
    setSavedStatus('Đang lưu thay đổi...');
    setTimeout(() => setSavedStatus('Đã lưu vào Supabase'), 800);
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

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
      deleteNote(note.id);
      navigate('/notes');
    }
  };

  const completedChecklistCount = note.checklist.filter((c) => c.completed).length;
  const totalChecklistCount = note.checklist.length;
  const progressPercent =
    totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  return (
    <div className="py-6 px-4 sm:px-8 max-w-5xl mx-auto space-y-6 min-h-[calc(100vh-4rem)] flex flex-col justify-start">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/notes')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface/50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại danh sách</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Privacy Badge / Switcher */}
          <button
            onClick={handleTogglePrivate}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPrivate
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{isPrivate ? 'Ghi chú Riêng tư' : 'Ghi chú chung'}</span>
          </button>

          {/* Share Button */}
          {!isPrivate && onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all focus:outline-none"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Chia sẻ</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            aria-label="Xóa ghi chú"
            title="Xóa ghi chú"
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-surface-border/60 transition-colors focus:outline-none"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Detail Canvas Card (Balanced centered middle space) */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl space-y-6 border border-surface-border/80 shadow-2xl backdrop-blur-xl bg-surface/50">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-border/60">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={priority} />
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as PriorityLevel)}
              className="bg-background text-xs text-slate-300 px-3 py-1.5 rounded-xl border border-surface-border focus:outline-none focus:border-indigo-500"
            >
              <option value="P1">Độ ưu tiên: P1 Cao</option>
              <option value="P2">Độ ưu tiên: P2 Trung bình</option>
              <option value="P3">Độ ưu tiên: P3 Thấp</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <CheckCircle2 className="h-3.5 w-3.5" /> {savedStatus}
            </span>
            {!isPrivate && <AvatarStack members={note.members} />}
          </div>
        </div>

        {/* Note Title Input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Nhập tiêu đề ghi chú..."
          className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight border-b border-transparent focus:border-indigo-500/30 pb-1 transition-colors"
        />

        {/* Note Content Textarea */}
        <textarea
          rows={4}
          value={content}
          onChange={handleContentChange}
          placeholder="Nhập nội dung chi tiết ghi chú tại đây..."
          className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-sm sm:text-base leading-relaxed resize-none"
        />

        {/* Divider */}
        <div className="h-px bg-surface-border/60" />

        {/* Checklist Section */}
        <div className="space-y-4">
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

          {/* Checklist items list */}
          <div className="space-y-2.5 pt-1">
            {note.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(note.id, item.id)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-background/60 border border-surface-border/60 hover:border-indigo-500/40 hover:bg-surface-hover/50 transition-all cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => {}}
                  className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:outline-none"
                />
                <span
                  className={`text-xs sm:text-sm ${
                    item.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Add Checklist Item Form */}
          <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Thêm một công việc mới..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-background border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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

        {/* Tags Section */}
        {note.tags.length > 0 && (
          <div className="pt-4 border-t border-surface-border/60 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-slate-500" />
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-xl bg-slate-800/80 text-slate-300 border border-slate-700/60 font-mono font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
