import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Lock,
  Share2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  AlertCircle,
  Sparkles,
  Activity,
  CheckSquare,
  Trash2,
  Pin,
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';

interface DashboardPageProps {
  onOpenCreateNoteModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateNoteModal,
}) => {
  const navigate = useNavigate();
  const { notes, currentUser, fetchDashboardMetricsFromSupabase, togglePinNote, deleteNote } = useAppStore();

  useEffect(() => {
    fetchDashboardMetricsFromSupabase();
  }, [fetchDashboardMetricsFromSupabase]);

  const privateNotes = notes.filter((n) => n.isPrivate);
  const sharedNotes = notes.filter((n) => !n.isPrivate);
  const highPriorityNotes = notes.filter((n) => n.priority === 'P1');

  const completedTasksCount = notes.reduce(
    (acc, note) => acc + note.checklist.filter((c) => c.completed).length,
    0
  );
  const totalTasksCount = notes.reduce(
    (acc, note) => acc + note.checklist.length,
    0
  );
  const overallTaskPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-4rem)]">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-surface-border/70 p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-indigo-950/40 via-surface/40 to-background backdrop-blur-xl shadow-2xl group">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
        <div className="absolute -left-10 -top-10 w-60 h-60 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Bảng Điều Khiển Tổng Quan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Xin chào trở lại, {currentUser?.fullName || 'bạn'} 👋
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-xl">
            Bạn đang quản lý{' '}
            <span className="text-indigo-400 font-semibold">{privateNotes.length} ghi chú riêng tư</span> và{' '}
            <span className="text-amber-400 font-semibold">{sharedNotes.length} ghi chú hợp tác</span>. Tiến độ hoàn thành công việc đạt{' '}
            <span className="text-emerald-400 font-semibold font-mono">{overallTaskPercent}%</span>.
          </p>
        </div>

        {onOpenCreateNoteModal && (
          <button
            onClick={onOpenCreateNoteModal}
            className="relative z-10 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 shrink-0 border border-indigo-400/30"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo Ghi chú mới</span>
          </button>
        )}
      </div>

      {/* KPI Stat Cards Grid (4 Pillars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Notes */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tổng số Ghi chú
            </span>
            <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">
              {notes.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Trong workspace</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 2: Completed Checklist Tasks */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Công việc đã xong
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1.5 font-mono">
              {completedTasksCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-mono">
              {completedTasksCount}/{totalTasksCount} mục ({overallTaskPercent}%)
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 3: Shared Notes */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ghi chú Hợp tác
            </span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1.5 font-mono">
              {sharedNotes.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Đang chia sẻ cùng nhóm</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
            <Share2 className="h-6 w-6" />
          </div>
        </div>

        {/* KPI 4: High Priority P1 */}
        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ưu tiên Cao (P1)
            </span>
            <div className="text-3xl font-extrabold text-rose-400 mt-1.5 font-mono">
              {highPriorityNotes.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Cần tập trung xử lý</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition-transform duration-300">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content Split: Bento Recent Notes Grid & Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes Section (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
              <span>Ghi chú công việc gần đây</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                {notes.length}
              </span>
            </h3>

            <button
              onClick={() => navigate('/notes')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors focus:outline-none"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bento Grid 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {notes.slice(0, 4).map((note) => {
              const completedCount = note.checklist.filter((c) => c.completed).length;
              const totalCount = note.checklist.length;
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

              return (
                <div
                  key={note.id}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:border-indigo-500/40 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span
                        className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
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

                    <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {note.title || 'Ghi chú chưa đặt tên'}
                    </h4>
                    <p className="text-xs text-slate-300/80 mt-2 line-clamp-2 leading-relaxed font-normal">
                      {note.content || 'Chưa có nội dung ghi chú.'}
                    </p>

                    {/* Mini Checklist Progress Bar */}
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

                  <div className="mt-5 pt-3.5 border-t border-surface-border/40 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {!note.isPrivate && <AvatarStack members={note.members} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Activity Feed (Right 1 Column) */}
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-400" />
            <span>Hoạt động nhóm gần đây</span>
          </h3>

          <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 space-y-2">
                <Activity className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs">Chưa có hoạt động nào trong không gian làm việc.</p>
              </div>
            ) : (
              notes.slice(0, 5).map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-3.5 pb-4 border-b border-surface-border/40 last:pb-0 last:border-0"
                >
                  <img
                    src={currentUser?.avatarUrl || note.owner.avatarUrl}
                    alt={currentUser?.fullName || note.owner.fullName}
                    className="h-9 w-9 rounded-full object-cover shrink-0 ring-1 ring-indigo-500/30 mt-0.5"
                  />
                  <div className="text-xs leading-relaxed flex-1 min-w-0">
                    <p className="text-slate-200">
                      <span className="font-semibold text-white">{currentUser?.fullName || 'Người dùng'}</span>{' '}
                      <span className="text-slate-400">vừa cập nhật ghi chú</span>{' '}
                      <span className="font-semibold text-indigo-300">"{note.title || 'Untitled'}"</span>
                    </p>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
