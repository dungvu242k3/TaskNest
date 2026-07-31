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
  const { notes, toggleChecklistItem, updateNote, addChecklistItem } = useAppStore();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate ?? true);
  const [priority, setPriority] = useState<PriorityLevel>(note?.priority || 'P2');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [savedStatus, setSavedStatus] = useState('Đã tự động lưu');

  if (!note) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-8">
        <div className="p-10 rounded-3xl text-center text-slate-400 space-y-4 max-w-md w-full border border-surface-border/60 bg-surface/30">
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

  const completedChecklistCount = note.checklist.filter((c) => c.completed).length;
  const totalChecklistCount = note.checklist.length;
  const progressPercent =
    totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  return (
    <div className="py-8 px-4 sm:px-8 max-w-4xl mx-auto space-y-6 min-h-[calc(100vh-4rem)] flex flex-col justify-start">
      {/* Top Header Controls (Seamlessly flat on main canvas) */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-surface-border/40">
        <div className="flex items-center gap-3">
          {/* Privacy Switcher Badge */}
          <button
            onClick={handleTogglePrivate}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPrivate
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
            }`}
          >
            {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{isPrivate ? 'Ghi chú Riêng tư' : 'Ghi chú chung'}</span>
          </button>
        </div>

        {/* Share Action */}
        {!isPrivate && onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all focus:outline-none"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Chia sẻ</span>
          </button>
        )}
      </div>

      {/* Editor Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <PriorityBadge priority={priority} />
          <select
            value={priority}
            onChange={(e) => handlePriorityChange(e.target.value as PriorityLevel)}
            className="bg-surface/60 text-xs text-slate-300 px-3 py-1.5 rounded-xl border border-surface-border/60 focus:outline-none focus:border-indigo-500/80 transition-colors"
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

      {/* Main Title Input (Flat Canvas) */}
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Nhập tiêu đề ghi chú..."
        className="w-full bg-transparent text-3xl sm:text-4xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight border-b border-surface-border/30 pb-2 focus:border-indigo-500/60 transition-colors"
      />

      {/* Main Content Textarea (Flat Canvas) */}
      <textarea
        rows={5}
        value={content}
        onChange={handleContentChange}
        placeholder="Nhập nội dung chi tiết ghi chú tại đây..."
        className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-base leading-relaxed resize-none min-h-[140px]"
      />

      {/* Subtle Section Separator */}
      <div className="h-px bg-surface-border/50" />

      {/* Checklist Section */}
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
          {note.checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleChecklistItem(note.id, item.id)}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-surface/40 border border-surface-border/60 hover:border-indigo-500/40 hover:bg-surface-hover/60 transition-all cursor-pointer select-none"
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
            className="flex-1 px-4 py-2.5 rounded-2xl bg-surface/50 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
        <div className="pt-4 border-t border-surface-border/50 flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-slate-500" />
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-xl bg-surface/60 text-slate-300 border border-surface-border/60 font-mono font-medium hover:border-slate-500 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
