import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Lock, Share2, CheckCircle2, TrendingUp, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';
import { MOCK_ACTIVITIES } from '../constants/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { notes, setQuickPeekNoteId } = useAppStore();

  const privateNotes = notes.filter((n) => n.isPrivate);
  const sharedNotes = notes.filter((n) => !n.isPrivate);
  const completedTasksCount = notes.reduce(
    (acc, note) => acc + note.checklist.filter((c) => c.completed).length,
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 via-surface to-surface border border-indigo-500/20 p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Bảng Điều Khiển Không Gian Làm Việc
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
            Xin chào trở lại, Dũng Vũ 👋
          </h1>
          <p className="text-slate-300 text-xs mt-2 leading-relaxed">
            Bạn đang có <span className="text-indigo-400 font-semibold">{privateNotes.length} ghi chú riêng tư</span> và{' '}
            <span className="text-amber-400 font-semibold">{sharedNotes.length} ghi chú dùng chung</span> đang hoạt động.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng số Ghi chú</span>
            <div className="text-2xl font-bold text-white mt-1">{notes.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Trong không gian làm việc nhóm</p>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Công việc hoàn thành</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{completedTasksCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">Checklist đã hoàn thành</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ghi chú Dùng chung</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{sharedNotes.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Đang hợp tác cùng nhóm</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content Split: Bento Recent Notes Grid & Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Notes (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Ghi chú công việc gần đây</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {notes.length}
              </span>
            </h3>
            <button
              onClick={() => navigate('/notes')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Bento Notes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.slice(0, 4).map((note) => (
              <div
                key={note.id}
                onClick={() => setQuickPeekNoteId(note.id)}
                className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        note.isPrivate
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                      }`}
                    >
                      {note.isPrivate ? <Lock className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                      {note.isPrivate ? 'Riêng tư' : 'Dùng chung'}
                    </span>
                    <PriorityBadge priority={note.priority} />
                  </div>

                  <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {note.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{note.content}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  {!note.isPrivate && <AvatarStack members={note.members} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Activity Feed (Right 1 Column) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Hoạt động nhóm gần đây</h3>
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            {MOCK_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-surface-border/50 last:pb-0 last:border-0">
                <img src={act.user.avatarUrl} alt={act.user.fullName} className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5" />
                <div className="text-xs leading-snug">
                  <span className="font-semibold text-slate-200">{act.user.fullName}</span>{' '}
                  <span className="text-slate-400">{act.action}</span>{' '}
                  <span className="font-medium text-indigo-300">"{act.noteTitle}"</span>
                  <div className="text-[10px] text-slate-400 mt-1">{act.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
