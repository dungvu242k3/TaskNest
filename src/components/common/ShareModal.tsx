import React, { useState } from 'react';
import { X, UserPlus, Shield, Check, Copy, Users, Clock, Trash2 } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { PermissionSelect } from '../ui/PermissionSelect';
import { MemberPermission } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteTitle?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, noteTitle }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<MemberPermission>('edit');
  const [copied, setCopied] = useState(false);
  const [invitedSuccessEmail, setInvitedSuccessEmail] = useState<string | null>(null);
  const { teamMembers, currentUser, invitations, sendInvitationInSupabase, cancelInvitationInSupabase } = useAppStore();

  if (!isOpen) return null;

  const pendingInvites = invitations.filter((i) => i.status === 'pending');
  const displayMembers = teamMembers.length > 0 ? teamMembers : currentUser ? [currentUser] : [];

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const targetEmail = email.trim();
    await sendInvitationInSupabase(targetEmail, permission);
    setInvitedSuccessEmail(targetEmail);
    setEmail('');
    setTimeout(() => setInvitedSuccessEmail(null), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        aria-label="Chia sẻ ghi chú công việc"
        className="w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Chia sẻ Ghi chú Công việc</h3>
              <p className="text-xs text-slate-400">{noteTitle || 'Mời thành viên vào không gian làm việc'}</p>
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

        {/* Form & Member List */}
        <div className="p-6 space-y-6">
          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Mời thành viên qua Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dongnghiep@tasknest.io"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-white text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <PermissionSelect
                permission={permission}
                onChange={(p) => setPermission(p)}
              />
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
              >
                Gửi lời mời
              </button>
            </div>
            {invitedSuccessEmail && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-in fade-in">
                <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Đã gửi thành công lời mời tham gia tới <strong>{invitedSuccessEmail}</strong>!</span>
              </div>
            )}
          </form>

          {/* Official Members List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Thành viên nhóm ({displayMembers.length})
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {displayMembers.map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-surface-border/50">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">{user.fullName}</h5>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-300 font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30">
                    {idx === 0 || user.id === currentUser?.id ? 'Chủ sở hữu' : 'Thành viên'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations List */}
          {pendingInvites.length > 0 && (
            <div className="pt-2 border-t border-surface-border/40">
              <h4 className="text-xs font-bold text-amber-400/90 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>Lời mời đang chờ ({pendingInvites.length})</span>
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                {pendingInvites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">{inv.email}</h5>
                      <p className="text-[10px] text-amber-400/80 font-mono">Đang chờ chấp nhận lời mời</p>
                    </div>
                    <button
                      onClick={() => cancelInvitationInSupabase(inv.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Hủy lời mời này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy Invite Link */}
          <div className="pt-2 border-t border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Chỉ thành viên được mời mới có thể xem ghi chú này</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-hover text-slate-200 hover:text-white text-xs font-medium border border-surface-border transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Đã chép link' : 'Sao chép link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
