import React, { useState } from 'react';
import { X, Users, Sparkles, Loader2, PlusCircle } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ isOpen, onClose }) => {
  const { createTeamInSupabase } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createTeamInSupabase(name, description);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.warn('Error creating team:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tạo nhóm làm việc mới"
        className="w-full max-w-md bg-surface border border-surface-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-surface-border/60 flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white leading-tight">Tạo Nhóm Làm Việc Mới</h3>
              <p className="text-xs text-slate-400">Tạo không gian hợp tác và phân quyền cùng đồng đội</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 block">
              Tên Nhóm / Workspace <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              disabled={loading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Đội Thiết kế UI/UX hoặc Dự án Marketing..."
              className="w-full px-4 py-3 rounded-2xl bg-background/80 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 block">Mô tả ngắn (Tùy chọn)</label>
            <textarea
              rows={3}
              disabled={loading}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục tiêu làm việc hoặc vai trò của nhóm..."
              className="w-full px-4 py-3 rounded-2xl bg-background/80 border border-surface-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-none disabled:opacity-50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-surface-border/40">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-2 border border-indigo-400/30 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Đang khởi tạo nhóm...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  <span>Tạo nhóm ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
