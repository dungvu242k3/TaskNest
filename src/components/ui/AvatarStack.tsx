import React from 'react';
import { NoteMember } from '../../types';

interface AvatarStackProps {
  members: NoteMember[];
  maxDisplay?: number;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ members, maxDisplay = 3 }) => {
  const displayedMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {displayedMembers.map((member) => (
        <img
          key={member.user.id}
          className="inline-block h-6 w-6 rounded-full ring-2 ring-background object-cover"
          src={member.user.avatarUrl}
          alt={member.user.fullName}
          title={`${member.user.fullName} (${member.permission})`}
        />
      ))}
      {remainingCount > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 ring-2 ring-background text-[10px] font-medium text-slate-300">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
