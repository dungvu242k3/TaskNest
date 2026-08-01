import React from 'react';
import { NoteMember, MemberPermission } from '../../types';

interface AvatarStackProps {
  members: NoteMember[];
  maxDisplay?: number;
  showNames?: boolean;
  canManagePermissions?: boolean;
  onPermissionChange?: (userId: string, permission: MemberPermission) => void;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({
  members,
  maxDisplay = 4,
  showNames = false,
  canManagePermissions = false,
  onPermissionChange,
}) => {
  if (showNames) {
    return (
      <div className="space-y-2">
        {members.map((member) => {
          const isOwner = member.permission === 'owner';

          return (
            <div
              key={member.user.id}
              className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-background/50 border border-surface-border/50 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0"
                  src={member.user.avatarUrl}
                  alt={member.user.fullName}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {member.user.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {member.user.email}
                  </p>
                </div>
              </div>

              {isOwner ? (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                  Chủ sở hữu
                </span>
              ) : canManagePermissions && onPermissionChange ? (
                <select
                  value={member.permission}
                  onChange={(e) =>
                    onPermissionChange(member.user.id, e.target.value as MemberPermission)
                  }
                  className="text-[10px] font-medium px-2 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 focus:outline-none focus:border-indigo-400 cursor-pointer transition-colors"
                >
                  <option value="edit" className="bg-slate-900 text-slate-200">
                    Quyền chỉnh sửa
                  </option>
                  <option value="view" className="bg-slate-900 text-slate-200">
                    Chỉ xem
                  </option>
                </select>
              ) : (
                <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {member.permission === 'edit' ? 'Quyền chỉnh sửa' : 'Chỉ xem'}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const displayedMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {displayedMembers.map((member) => (
        <div key={member.user.id} className="relative group">
          <img
            className="inline-block h-7 w-7 rounded-full ring-2 ring-background object-cover transition-transform group-hover:scale-110 group-hover:z-10"
            src={member.user.avatarUrl}
            alt={member.user.fullName}
            title={`${member.user.fullName} (${member.permission})`}
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 ring-2 ring-background text-[10px] font-bold text-slate-300">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
