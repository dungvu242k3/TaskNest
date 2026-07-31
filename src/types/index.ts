export type NotePrivacy = 'private' | 'shared';

export type NoteStatus = 'todo' | 'in_progress' | 'completed';

export type PriorityLevel = 'P1' | 'P2' | 'P3'; // P1: High, P2: Medium, P3: Low

export type MemberPermission = 'owner' | 'edit' | 'view';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

export interface NoteMember {
  user: UserProfile;
  permission: MemberPermission;
  status: 'accepted' | 'pending';
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  status: NoteStatus;
  priority: PriorityLevel;
  dueDate?: string; // e.g. "2026-08-05"
  tags: string[];
  owner: UserProfile;
  members: NoteMember[];
  checklist: ChecklistItem[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TeamActivity {
  id: string;
  user: UserProfile;
  action: string;
  noteTitle: string;
  timestamp: string;
}

export type TeamRole = 'owner' | 'admin' | 'member';

export interface TeamMemberItem {
  id: string;
  user: UserProfile;
  role: TeamRole;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  members?: TeamMemberItem[];
  createdAt: string;
  updatedAt: string;
}

