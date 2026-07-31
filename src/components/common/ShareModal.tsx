import React, { useState } from 'react';
import { X, UserPlus, Shield, Check, Copy } from 'lucide-react';
import { MOCK_USERS } from '../../constants/mockData';
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

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert(`Invitation sent to ${email} with ${permission} permission!`);
    setEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Share Work Note</h3>
              <p className="text-xs text-slate-400">{noteTitle || 'Invite collaborators to workspace'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form & Member List */}
        <div className="p-6 space-y-6">
          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300">Invite member by email</label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@tasknest.io"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as MemberPermission)}
                className="px-3 py-2.5 rounded-xl bg-background border border-surface-border text-slate-300 text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="edit">Can Edit</option>
                <option value="view">Can View</option>
              </select>
              <button
                type="submit"
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
              >
                Invite
              </button>
            </div>
          </form>

          {/* Members List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Team Members ({MOCK_USERS.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {MOCK_USERS.map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-surface-border/50">
                  <div className="flex items-center gap-3">
                    <img src={user.avatarUrl} alt={user.fullName} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">{user.fullName}</h5>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                    {idx === 0 ? 'Owner' : idx % 2 === 0 ? 'Can Edit' : 'Can View'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Invite Link */}
          <div className="pt-2 border-t border-surface-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Only invited team members can view this note</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-surface-hover text-slate-200 hover:text-white text-xs font-medium border border-surface-border transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
