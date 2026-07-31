import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Share2, Calendar, CheckSquare, ExternalLink, Pin, Trash2 } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { PriorityBadge } from '../ui/PriorityBadge';
import { AvatarStack } from '../ui/AvatarStack';

export const QuickPeekDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { notes, quickPeekNoteId, setQuickPeekNoteId, togglePinNote, toggleChecklistItem, deleteNote } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuickPeekNoteId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuickPeekNoteId]);

  if (!quickPeekNoteId) return null;

  const note = notes.find((n) => n.id === quickPeekNoteId);
  if (!note) return null;

  const handleOpenFullEditor = () => {
    setQuickPeekNoteId(null);
    navigate(`/notes/${note.id}`);
  };

  const completedCount = note.checklist.filter((c) => c.completed).length;
  const totalChecklist = note.checklist.length;
  const progressPercent = totalChecklist > 0 ? Math.round((completedCount / totalChecklist) * 100) : 0;

  return (
    <div
      onClick={() => setQuickPeekNoteId(null)}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Xem chi tiết kế hoạch"
        className="w-full max-w-2xl max-h-[85vh] bg-surface border border-surface-border rounded-3xl flex flex-col shadow-card overflow-hidden animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            {note.isPrivate ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Lock className="h-3.5 w-3.5" /> Ghi chú Riêng tư
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Share2 className="h-3.5 w-3.5" /> Ghi chú chung
              </span>
            )}
            <PriorityBadge priority={note.priority} />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePinNote(note.id)}
              aria-label={note.pinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú'}
              title={note.pinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú'}
              className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
                note.pinned ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenFullEditor}
              aria-label="Mở trang chỉnh sửa chi tiết"
              title="Mở trang chỉnh sửa chi tiết"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors focus:outline-none"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                deleteNote(note.id);
                setQuickPeekNoteId(null);
              }}
              aria-label="Xóa ghi chú"
              title="Xóa ghi chú"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setQuickPeekNoteId(null)}
              aria-label="Đóng"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Note Title */}
          <div>
            <h2 className="text-2xl font-extrabold text-white leading-tight">{note.title}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Hạn chót: {note.dueDate || 'Chưa thiết lập'}
              </span>
              <span>Cập nhật {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Members Stack if Shared */}
          {!note.isPrivate && (
            <div className="p-3.5 rounded-2xl bg-background/60 border border-surface-border flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Thành viên cùng tham gia</span>
              <AvatarStack members={note.members} />
            </div>
          )}

          {/* Note Content Text */}
          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed bg-background/50 p-5 rounded-2xl border border-surface-border/60">
            {note.content || <p className="italic text-slate-500">Chưa có nội dung ghi chú.</p>}
          </div>

          {/* Checklist Section with Progress Bar */}
          {totalChecklist > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-indigo-400" /> Danh sách công việc ({completedCount}/{totalChecklist})
                </h4>
                <span className="text-xs font-mono font-semibold text-indigo-400">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-2 pt-1">
                {note.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(note.id, item.id)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-surface-border/60 hover:border-slate-600 transition-colors cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 focus:outline-none"
                    />
                    <span className={`text-xs ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {note.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer Action */}
        <div className="p-4 border-t border-surface-border bg-surface-hover/20 flex items-center justify-between">
          <button
            onClick={() => setQuickPeekNoteId(null)}
            className="py-2 px-4 rounded-xl bg-surface-hover text-slate-300 hover:text-white text-xs font-semibold border border-surface-border transition-colors focus:outline-none"
          >
            Đóng
          </button>
          <button
            onClick={handleOpenFullEditor}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all focus:outline-none"
          >
            <span>Mở trang soạn thảo chi tiết</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
