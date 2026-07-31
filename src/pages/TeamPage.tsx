import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  Mail,
  Activity,
  UserPlus,
  CheckCircle2,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  RotateCw,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { MOCK_ACTIVITIES } from '../constants/mockData';

interface TeamPageProps {
  onOpenShareModal?: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onOpenShareModal }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'members';
  const [memberSearch, setMemberSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { teamMembers, removeTeamMember } = useAppStore();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const filteredMembers = teamMembers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 min-h-[calc(100vh-4rem)]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border/40 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Quản lý Không gian Nhóm</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Quản lý Nhóm & Hợp tác
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý các thành viên trong nhóm, phân quyền truy cập và xem nhật ký tương tác thời gian thực.
          </p>
        </div>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow hover:scale-[1.02] active:scale-95 transition-all duration-200 shrink-0 border border-indigo-400/30"
          >
            <UserPlus className="h-4 w-4" />
            <span>Mời thành viên mới</span>
          </button>
        )}
      </div>

      {/* KPI Metric Cards (3 Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Thành viên nhóm
            </span>
            <div className="text-3xl font-extrabold text-white mt-1.5 font-mono">
              {teamMembers.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Quản trị viên & Thành viên</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Lời mời đang chờ
            </span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1.5 font-mono">
              1
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Đang chờ phản hồi</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
            <Mail className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-surface-border/60 bg-surface/30 hover:bg-surface-hover/60 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nhật ký Hoạt động
            </span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1.5 font-mono">
              {MOCK_ACTIVITIES.length}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tương tác gần đây</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
            <Activity className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Navigation Toolbar Tabs */}
      <div className="glass-panel p-2.5 sm:p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-border/70 bg-surface/40 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          <button
            onClick={() => handleTabChange('members')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentTab === 'members'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Thành viên nhóm</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono">
              {teamMembers.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('invites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentTab === 'invites'
                ? 'bg-amber-600 text-white shadow-glow-amber'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Mail className="h-4 w-4 text-amber-400" />
            <span>Lời mời đang chờ</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono">
              1
            </span>
          </button>

          <button
            onClick={() => handleTabChange('activity')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
              currentTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Nhật ký hoạt động</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono">
              {MOCK_ACTIVITIES.length}
            </span>
          </button>
        </div>

        {/* Member Search Bar (Visible on members tab) */}
        {currentTab === 'members' && (
          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Tìm kiếm thành viên..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background/70 border border-surface-border/70 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Members Table */}
      {currentTab === 'members' && (
        <div className="glass-panel rounded-3xl border border-surface-border/60 bg-surface/30 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-hover/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-surface-border/50">
                <tr>
                  <th className="py-4 px-6">Họ và tên</th>
                  <th className="py-4 px-6">Địa chỉ Email</th>
                  <th className="py-4 px-6">Vai trò trong workspace</th>
                  <th className="py-4 px-6">Trạng thái</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40 text-slate-200">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Không tìm thấy thành viên nào phù hợp với từ khóa "{memberSearch}"
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((user, idx) => {
                    const isOwner = user.id === 'usr-1' || idx === 0;

                    return (
                      <tr key={user.id} className="hover:bg-surface-hover/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName}
                              className="h-9 w-9 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0"
                            />
                            <span className="font-bold text-slate-100 text-sm">{user.fullName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-mono">{user.email}</td>
                        <td className="py-4 px-6">
                          {isOwner ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Quản trị viên / Chủ nhóm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold">
                              Thành viên chính thức
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Đang hoạt động</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isOwner ? (
                            <span className="text-[11px] text-slate-500 font-mono italic">Chủ nhóm</span>
                          ) : confirmDeleteId === user.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  removeTeamMember(user.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shadow-glow transition-all"
                              >
                                Xác nhận xóa
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-[11px] font-medium transition-colors"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(user.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 text-xs font-semibold transition-all focus:outline-none"
                              title={`Xóa ${user.fullName} khỏi nhóm`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Xóa</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Pending Invitations */}
      {currentTab === 'invites' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border/60 bg-surface/30 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400" />
              <span>Danh sách lời mời đang chờ xử lý</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
              1 Lời mời
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-background/60 border border-surface-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100 font-mono">
                  trinh.nguyen@company.com
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Được mời bởi <span className="text-slate-200 font-medium">Dũng Vũ</span> với quyền{' '}
                  <span className="text-indigo-400 font-medium">Quyền chỉnh sửa</span> • Gửi 2 ngày trước
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all">
                <RotateCw className="h-3.5 w-3.5" />
                <span>Gửi lại</span>
              </button>
              <button className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold transition-all">
                <XCircle className="h-3.5 w-3.5" />
                <span>Thu hồi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Audit Log */}
      {currentTab === 'activity' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-border/60 bg-surface/30 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Nhật ký hoạt động nhóm</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
              {MOCK_ACTIVITIES.length} Tương tác
            </span>
          </div>

          <div className="space-y-3">
            {MOCK_ACTIVITIES.map((act) => (
              <div
                key={act.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-background/50 border border-surface-border/50 hover:border-indigo-500/40 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={act.user.avatarUrl}
                    alt={act.user.fullName}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0"
                  />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white">{act.user.fullName}</span>{' '}
                    <span className="text-slate-400">{act.action}</span>{' '}
                    <span className="font-semibold text-indigo-300">"{act.noteTitle}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono self-end sm:self-auto">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span>{act.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
