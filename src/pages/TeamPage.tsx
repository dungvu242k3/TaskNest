import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Mail, Activity, Shield, UserPlus, CheckCircle2 } from 'lucide-react';
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
          <h1 className="text-2xl font-bold text-white tracking-tight">Team & Collaboration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your team members (~10 users), pending invites, and active collaboration audit log.
          </p>
        </div>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Team Member</span>
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
          <span>Members ({MOCK_USERS.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('invites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'invites' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Pending Invitations (1)</span>
        </button>

        <button
          onClick={() => handleTabChange('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'activity' ? 'bg-indigo-600 text-white shadow-glow' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Activity Audit Log</span>
        </button>
      </div>

      {/* Tab 1: Members */}
      {currentTab === 'members' && (
        <div className="glass-panel rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-hover/50 text-slate-400 uppercase tracking-wider font-semibold border-b border-surface-border">
              <tr>
                <th className="p-4">Member Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
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
                      {idx === 0 ? 'Admin / Owner' : 'Member'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Active
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
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Pending Team Invitations</h3>
          <div className="p-4 rounded-2xl bg-background/50 border border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">jessica.m@company.com</h4>
                <p className="text-xs text-slate-400">Invited by Alex Vance as Editor • Sent 2 days ago</p>
              </div>
            </div>
            <button className="py-1.5 px-3 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold hover:bg-red-500/25">
              Revoke Invite
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Activity Audit Log */}
      {currentTab === 'activity' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Team Activity Audit Log</h3>
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
                <span className="text-[11px] text-slate-400 font-mono">{act.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
