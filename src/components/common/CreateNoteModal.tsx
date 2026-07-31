import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Lock, Share2, Sparkles } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { PriorityLevel } from '../../types';

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addNote } = useAppStore();

  const [title, setTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [priority, setPriority] = useState<PriorityLevel>('P2');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const noteTitle = title.trim() || 'Ghi chú chưa đặt tên';
    const newNote = addNote(noteTitle, isPrivate, priority);
    setTitle('');
    onClose();
    navigate(`/notes/${newNote.id}`);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tạo ghi chú mới"
        className="w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Tạo Ghi Chú Mới</h3>
              <p className="text-xs text-slate-400">Chọn loại ghi chú và thiết lập thông tin ban đầu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Note Title Input */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Tiêu đề Ghi chú
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề công việc..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Privacy Type Selector Options */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Loại Ghi chú
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: Private */}
              <div
                onClick={() => setIsPrivate(true)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isPrivate
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-glow-amber'
                    : 'bg-background/60 border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="radio"
                    name="noteType"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="h-4 w-4 text-amber-500 border-slate-700 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Ghi chú Riêng tư</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Chỉ một mình bạn có quyền truy cập và chỉnh sửa
                  </p>
                </div>
              </div>

              {/* Option 2: Shared */}
              <div
                onClick={() => setIsPrivate(false)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  !isPrivate
                    ? 'bg-indigo-500/15 border-indigo-500/50 shadow-glow'
                    : 'bg-background/60 border-surface-border hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <input
                    type="radio"
                    name="noteType"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="h-4 w-4 text-indigo-500 border-slate-700 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Ghi chú Chung</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                    Cho phép mời thành viên cùng hợp tác & chỉnh sửa
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Level Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Độ Ưu Tiên
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="P1">P1 • Cao (High Priority)</option>
              <option value="P2">P2 • Trung bình (Medium Priority)</option>
              <option value="P3">P3 • Thấp (Low Priority)</option>
            </select>
          </div>

          {/* Actions Buttons */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-surface-hover text-slate-300 hover:text-white text-xs font-semibold border border-surface-border transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Tạo Ghi chú</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
