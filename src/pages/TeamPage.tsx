import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Mail, Activity, UserPlus, CheckCircle2 } from 'lucide-react';
import { MOCK_USERS, MOCK_ACTIVITIES } from '../constants/mockData';

interface TeamPageProps {
  onOpenShareModal?: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ onOpenShareModal }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'members';

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Quản lý Nhóm & Hợp tác</h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách các thành viên trong nhóm (~10 người), danh sách lời mời và nhật ký hợp tác.
          </p>
        </div>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Mời thành viên mới</span>
          </button>
        )}
      </div>

      {/* 3 Tabs */}
      <div className="glass-panel p-2 rounded-2xl flex items-center gap-2">
        <button
          onClick={() => handleTabChange('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'members' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Thành viên nhóm ({MOCK_USERS.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('invites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'invites' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Lời mời đang chờ (1)</span>
        </button>

        <button
          onClick={() => handleTabChange('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'activity' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Nhật ký hoạt động</span>
        </button>
      </div>

      {/* Tab 1: Members */}
      {currentTab === 'members' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-surface-border">
              <tr>
                <th className="p-4">Họ và tên</th>
                <th className="p-4">Địa chỉ Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 text-slate-200">
              {MOCK_USERS.map((user, idx) => (
                <tr key={user.id} className="hover:bg-surface-hover/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
                    <span className="font-semibold text-slate-100">{user.fullName}</span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                      {idx === 0 ? 'Quản trị viên / Chủ nhóm' : 'Thành viên'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đang hoạt động
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Pending Invitations */}
      {currentTab === 'invites' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Danh sách lời mời đang chờ xử lý</h3>
          <div className="p-4 rounded-2xl bg-background/50 border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-200">trinh.nguyen@company.com</h4>
                <p className="text-[11px] text-slate-400">Được mời bởi Dũng Vũ với quyền Chỉnh sửa • Gửi 2 ngày trước</p>
              </div>
            </div>
            <button className="py-1.5 px-3 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/25">
              Thu hồi lời mời
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Audit Log */}
      {currentTab === 'activity' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Nhật ký hoạt động nhóm</h3>
          <div className="space-y-3">
            {MOCK_ACTIVITIES.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-background/50 border border-surface-border/50 text-xs">
                <div className="flex items-center gap-3">
                  <img src={act.user.avatarUrl} alt={act.user.fullName} className="h-7 w-7 rounded-full object-cover" />
                  <div>
                    <span className="font-semibold text-slate-100">{act.user.fullName}</span>{' '}
                    <span className="text-slate-400">{act.action}</span>{' '}
                    <span className="font-medium text-indigo-300">"{act.noteTitle}"</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
