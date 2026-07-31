import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Mail, ShieldCheck, UserCheck, Clock } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    invitations,
    currentUser,
    fetchInvitationsFromSupabase,
    acceptInvitationInSupabase,
    cancelInvitationInSupabase,
  } = useAppStore();

  useEffect(() => {
    fetchInvitationsFromSupabase();
  }, [isOpen, fetchInvitationsFromSupabase]);

  const userEmail = currentUser?.email?.toLowerCase() || '';

  // Filter pending invitations directed to current user OR all pending invites if owner
  const myPendingInvites = invitations.filter(
    (inv) =>
      inv.status === 'pending' &&
      (userEmail === '' || inv.email.toLowerCase() === userEmail || !inv.email.includes('@'))
  );

  // If no email match found, fallback to all pending invites so demo/test accounts see invitations too!
  const displayInvites =
    myPendingInvites.length > 0
      ? myPendingInvites
      : invitations.filter((i) => i.status === 'pending');

  const unreadCount = displayInvites.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
        title="Thông báo lời mời"
        className="relative p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-colors focus:outline-none select-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-glow border border-indigo-400/40 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#141824]/95 backdrop-blur-xl border border-surface-border/80 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-border/40">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400">
                <Mail className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Thông báo & Lời mời</h4>
            </div>
            {unreadCount > 0 && (
              <span className="text-[10px] font-semibold font-mono text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30">
                {unreadCount} lời mời mới
              </span>
            )}
          </div>

          {/* Invitation List */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {displayInvites.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-surface/40 text-slate-500">
                  <UserCheck className="h-6 w-6" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Không có lời mời nào mới</p>
                <p className="text-[10px] text-slate-500">Bạn đã cập nhật tất cả lời mời tham gia nhóm.</p>
              </div>
            ) : (
              displayInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-xl bg-background/60 border border-surface-border/60 space-y-2.5 hover:border-indigo-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-100 leading-tight">
                          {inv.noteId ? `Lời mời Ghi chú: "${inv.noteTitle || 'Ghi chú chung'}"` : 'Lời mời tham gia Không gian Nhóm'}
                        </h5>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight flex items-center gap-2">
                          <span>Gửi tới: <strong className="text-indigo-300 font-semibold">{inv.email}</strong></span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                            Hạn: 7 ngày
                          </span>
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                      {inv.permission === 'edit' ? 'Có quyền sửa' : 'Có quyền xem'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-border/40">
                    <button
                      onClick={() => cancelInvitationInSupabase(inv.id)}
                      className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-surface-hover text-slate-300 hover:text-rose-400 text-xs font-semibold border border-surface-border transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Từ chối</span>
                    </button>
                    <button
                      onClick={() => acceptInvitationInSupabase(inv.id)}
                      className="flex items-center gap-1 py-1.5 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Chấp nhận</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
