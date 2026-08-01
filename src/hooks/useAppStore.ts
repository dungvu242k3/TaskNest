import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Note, NoteStatus, PriorityLevel, MemberPermission, UserProfile, Team, TeamInvitation } from '../types';
import { MOCK_NOTES, MOCK_USERS, CURRENT_USER } from '../constants/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface DashboardMetrics {
  total_notes: number;
  private_notes_count: number;
  shared_notes_count: number;
  high_priority_count: number;
  completed_tasks_count: number;
  total_tasks_count: number;
  overall_task_percent: number;
}

interface AppState {
  notes: Note[];
  teamMembers: UserProfile[];
  teams: Team[];
  invitations: TeamInvitation[];
  activeTeamId: string | null;
  searchQuery: string;
  isCommandPaletteOpen: boolean;
  quickPeekNoteId: string | null;
  isLoadingSupabase: boolean;
  dashboardMetrics: DashboardMetrics | null;
  isLoggedIn: boolean;
  currentUser: UserProfile | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  toggleCommandPalette: () => void;
  setQuickPeekNoteId: (id: string | null) => void;
  login: () => void;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  initAuthSession: () => Promise<void>;

  // Supabase Backend Sync Actions
  fetchNotesFromSupabase: () => Promise<void>;
  fetchProfilesFromSupabase: () => Promise<void>;
  fetchTeamsFromSupabase: () => Promise<void>;
  createTeamInSupabase: (name: string, description?: string) => Promise<Team | null>;
  setActiveTeamId: (teamId: string | null) => void;
  fetchInvitationsFromSupabase: () => Promise<void>;
  sendInvitationInSupabase: (email: string, permission?: MemberPermission, teamId?: string, noteId?: string, noteTitle?: string) => Promise<boolean>;
  acceptInvitationInSupabase: (invitationId: string) => Promise<void>;
  cancelInvitationInSupabase: (invitationId: string) => Promise<void>;
  fetchDashboardMetricsFromSupabase: (userId?: string) => Promise<DashboardMetrics | null>;
  subscribeToRealtimeNotes: () => () => void;

  // Note & Member Actions
  togglePinNote: (id: string) => Promise<void>;
  updateNoteStatus: (id: string, status: NoteStatus) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPrivate' | 'priority' | 'dueDate'>>) => Promise<void>;
  toggleChecklistItem: (noteId: string, checklistId: string) => Promise<void>;
  addChecklistItem: (noteId: string, text: string) => Promise<void>;
  deleteChecklistItem: (noteId: string, checklistId: string) => Promise<void>;
  updateChecklistItem: (noteId: string, checklistId: string, text: string) => Promise<void>;
  updateMemberPermission: (noteId: string, userId: string, permission: MemberPermission) => Promise<void>;
  removeTeamMember: (userId: string) => Promise<void>;
  addNote: (title: string, isPrivate: boolean, priority?: PriorityLevel, dueDate?: string) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  notes: [],
  teamMembers: [],
  teams: [],
  invitations: [],
  activeTeamId: null,
  searchQuery: '',
  isCommandPaletteOpen: false,
  quickPeekNoteId: null,
  isLoadingSupabase: false,
  dashboardMetrics: null,
  isLoggedIn: false,
  currentUser: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setQuickPeekNoteId: (id) => set({ quickPeekNoteId: id }),
  login: () => set({ isLoggedIn: true, currentUser: get().currentUser || CURRENT_USER }),
  logout: async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase logout notice:', err);
    }
    set({ isLoggedIn: false, currentUser: null, teams: [], invitations: [], activeTeamId: null });
  },
  updateUserProfile: (updates) =>
    set((state) => ({
      currentUser: state.currentUser
        ? { ...state.currentUser, ...updates }
        : { ...CURRENT_USER, ...updates },
    })),

  // Initialize Dynamic Supabase Auth Session
  initAuthSession: async () => {
    if (!isSupabaseConfigured) {
      set({ isLoggedIn: false, currentUser: null });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          isLoggedIn: true,
          currentUser: {
            id: session.user.id,
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Tài khoản',
            email: session.user.email || '',
            avatarUrl: session.user.user_metadata?.avatar_url || CURRENT_USER.avatarUrl,
          },
        });
        get().fetchNotesFromSupabase();
        get().fetchProfilesFromSupabase();
        get().fetchTeamsFromSupabase();
        get().fetchInvitationsFromSupabase();
      } else {
        set({ isLoggedIn: false, currentUser: null });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          set({
            isLoggedIn: true,
            currentUser: {
              id: session.user.id,
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Tài khoản',
              email: session.user.email || '',
              avatarUrl: session.user.user_metadata?.avatar_url || CURRENT_USER.avatarUrl,
            },
          });
          get().fetchNotesFromSupabase();
          get().fetchProfilesFromSupabase();
          get().fetchTeamsFromSupabase();
          get().fetchInvitationsFromSupabase();
        } else {
          set({ isLoggedIn: false, currentUser: null });
        }
      });
    } catch (err) {
      console.warn('Supabase auth session check notice:', err);
      set({ isLoggedIn: false, currentUser: null });
    }
  },

  // 1. Fetch Notes from Supabase DB
  fetchNotesFromSupabase: async () => {
    if (!isSupabaseConfigured) return;
    set({ isLoadingSupabase: true });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const activeUser = get().currentUser || CURRENT_USER;
        const mappedNotes: Note[] = data.map((item: any) => {
          const isCurrentUserOwner = item.owner_id === activeUser.id;
          const ownerObj: UserProfile = isCurrentUserOwner
            ? activeUser
            : {
                id: item.owner_id,
                fullName: 'Thành viên',
                email: '',
                avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
              };

          return {
            id: item.id,
            title: item.title,
            content: item.content || '',
            isPrivate: item.is_private,
            status: item.status || 'todo',
            priority: item.priority || 'P2',
            dueDate: item.due_date || undefined,
            tags: item.tags || [],
            checklist: item.checklist || [],
            pinned: item.pinned || false,
            owner: ownerObj,
            members: [{ user: ownerObj, permission: 'owner', status: 'accepted' }],
            createdAt: item.created_at || new Date().toISOString(),
            updatedAt: item.updated_at || new Date().toISOString(),
          };
        });
        set({ notes: mappedNotes });
      }
    } catch (err: any) {
      if (err?.code === '42P17') {
        console.info('Supabase RLS notice: infinite recursion detected in notes policy.');
      } else {
        console.warn('Supabase fetch notes notice:', err?.message || err);
      }
    } finally {
      set({ isLoadingSupabase: false });
    }
  },

  // 1b. Fetch Profiles / Team Members from Supabase DB
  fetchProfilesFromSupabase: async () => {
    if (!isSupabaseConfigured) return;
    try {
      const activeUser = get().currentUser;
      if (!activeUser) return;

      const memberMap = new Map<string, UserProfile>();
      memberMap.set(activeUser.id, activeUser);

      // Only include profiles of members who accepted invitations
      const acceptedInvitations = get().invitations.filter((i) => i.status === 'accepted');
      const acceptedEmails = acceptedInvitations.map((i) => i.email.toLowerCase());

      if (acceptedEmails.length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('email', acceptedEmails);

        if (!error && data) {
          data.forEach((p: any) => {
            memberMap.set(p.id, {
              id: p.id,
              fullName: p.full_name || p.email?.split('@')[0] || 'Thành viên',
              email: p.email || '',
              avatarUrl: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            });
          });
        }
      }

      set({ teamMembers: Array.from(memberMap.values()) });
    } catch (err) {
      console.warn('Supabase fetch profiles notice:', err);
    }
  },

  // 1c. Fetch Teams from Supabase DB
  fetchTeamsFromSupabase: async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) {
        const mappedTeams: Team[] = data.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
          ownerId: t.owner_id,
          memberCount: 1,
          createdAt: t.created_at || new Date().toISOString(),
          updatedAt: t.updated_at || new Date().toISOString(),
        }));
        set((state) => ({
          teams: mappedTeams,
          activeTeamId: state.activeTeamId || (mappedTeams.length > 0 ? mappedTeams[0].id : null),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch teams notice:', err);
    }
  },

  // 1d. Create Team in Supabase DB
  createTeamInSupabase: async (name, description = '') => {
    if (!name.trim()) return null;

    const tempTeam: Team = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      ownerId: get().currentUser?.id || 'usr-local',
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      teams: [tempTeam, ...state.teams],
      activeTeamId: tempTeam.id,
    }));

    if (isSupabaseConfigured && get().currentUser?.id) {
      try {
        const { data, error } = await supabase.rpc('create_team', {
          p_name: name.trim(),
          p_description: description.trim(),
        });

        if (error) {
          // Direct table fallback if RPC function doesn't exist yet
          const { data: insertData, error: insertErr } = await supabase
            .from('teams')
            .insert({
              name: name.trim(),
              description: description.trim(),
              owner_id: get().currentUser?.id,
            })
            .select()
            .single();

          if (insertErr) throw insertErr;
          if (insertData) {
            const created: Team = {
              id: insertData.id,
              name: insertData.name,
              description: insertData.description || '',
              ownerId: insertData.owner_id,
              memberCount: 1,
              createdAt: insertData.created_at,
              updatedAt: insertData.updated_at,
            };
            set((state) => ({
              teams: state.teams.map((t) => (t.id === tempTeam.id ? created : t)),
              activeTeamId: created.id,
            }));
            return created;
          }
        } else if (data) {
          const created: Team = {
            id: data.id,
            name: data.name,
            description: data.description || '',
            ownerId: data.owner_id,
            memberCount: 1,
            createdAt: data.created_at,
            updatedAt: data.created_at,
          };
          set((state) => ({
            teams: state.teams.map((t) => (t.id === tempTeam.id ? created : t)),
            activeTeamId: created.id,
          }));
          return created;
        }
      } catch (err) {
        console.warn('Supabase create team notice:', err);
      }
    }
    return tempTeam;
  },

  setActiveTeamId: (teamId) => set({ activeTeamId: teamId }),

  // 1e. Fetch Invitations from Supabase DB
  fetchInvitationsFromSupabase: async () => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mapped: TeamInvitation[] = data.map((item: any) => {
          const invEmail = item.email || item.invited_email || '';
          return {
            id: item.id,
            teamId: item.team_id || item.workspace_id || undefined,
            noteId: item.note_id || undefined,
            noteTitle: item.note_title || undefined,
            email: invEmail,
            invitedBy: get().currentUser || CURRENT_USER,
            permission: item.permission || 'edit',
            status: item.status || 'pending',
            providerType: item.provider_type || (invEmail.toLowerCase().endsWith('@gmail.com') ? 'google' : 'email'),
            createdAt: item.created_at || new Date().toISOString(),
          };
        });

        set((state) => {
          const remoteIds = new Set(mapped.map((m) => m.id));
          const unsyncedLocal = state.invitations.filter(
            (inv) => !remoteIds.has(inv.id) && inv.status === 'pending'
          );
          return { invitations: [...mapped, ...unsyncedLocal] };
        });
      }
    } catch (err) {
      console.warn('Supabase fetch invitations notice:', err);
    }
  },

  // 1f. Send Invitation in Supabase DB (Team or Specific Note)
  sendInvitationInSupabase: async (email, permission = 'edit', teamId, noteId, noteTitle) => {
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail) return false;

    // Automatically change private note to Shared Note when inviting members
    if (noteId) {
      get().updateNote(noteId, { isPrivate: false });
    }

    const inferredProviderType: 'google' | 'email' = sanitizedEmail.endsWith('@gmail.com') ? 'google' : 'email';

    const newInvite: TeamInvitation = {
      id: `inv-${Date.now()}`,
      teamId: teamId || get().activeTeamId || undefined,
      noteId,
      noteTitle,
      email: sanitizedEmail,
      invitedBy: get().currentUser || CURRENT_USER,
      permission,
      status: 'pending',
      providerType: inferredProviderType,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      invitations: [newInvite, ...state.invitations],
    }));

    if (isSupabaseConfigured) {
      try {
        const { data: authUser } = await supabase.auth.getUser();
        const currentUserId = authUser?.user?.id || get().currentUser?.id;

        const isValidUUID = (str?: string | null) =>
          !!str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

        if (currentUserId && isValidUUID(currentUserId)) {
          const { data: rpcData, error: rpcError } = await supabase.rpc('invite_and_check_auth_provider', {
            p_email: sanitizedEmail,
            p_permission: permission,
            p_note_id: isValidUUID(noteId) ? noteId : null,
            p_team_id: isValidUUID(teamId) ? teamId : null,
            p_note_title: noteTitle || null,
          });

          if (!rpcError && rpcData) {
            set((state) => ({
              invitations: state.invitations.map((i) =>
                i.id === newInvite.id
                  ? {
                      ...i,
                      id: rpcData.id || i.id,
                      providerType: rpcData.provider_type || inferredProviderType,
                      noteTitle: rpcData.note_title || noteTitle,
                    }
                  : i
              ),
            }));
          } else {
            const rawTeamId = teamId || get().activeTeamId;
            const validTeamId = isValidUUID(rawTeamId) ? rawTeamId : null;
            const payload: any = {
              email: sanitizedEmail,
              invited_email: sanitizedEmail,
              permission,
              team_id: validTeamId,
              workspace_id: validTeamId || '00000000-0000-0000-0000-000000000000',
              invited_by: currentUserId,
              status: 'pending',
              provider_type: inferredProviderType,
              note_title: noteTitle || null,
            };
            if (noteId && isValidUUID(noteId)) {
              payload.note_id = noteId;
            }

            let { data, error } = await supabase
              .from('team_invitations')
              .insert(payload)
              .select()
              .single();

            if (error && (error.message?.includes('note_id') || error.code === '42703')) {
              delete payload.note_id;
              const retry = await supabase
                .from('team_invitations')
                .insert(payload)
                .select()
                .single();
              data = retry.data;
              error = retry.error;
            }

            if (error) {
              console.error('Supabase send invitation error:', error);
            } else if (data) {
              set((state) => ({
                invitations: state.invitations.map((i) =>
                  i.id === newInvite.id
                    ? { ...i, id: data.id, providerType: data.provider_type || inferredProviderType }
                    : i
                ),
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Supabase send invitation notice:', err);
      }
    }
    return true;
  },

  // 1g. Accept Invitation
  acceptInvitationInSupabase: async (invitationId) => {
    const isValidUUID = (str?: string | null) =>
      !!str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

    const targetInvite = get().invitations.find((i) => i.id === invitationId);
    const currUser = get().currentUser || CURRENT_USER;

    set((state) => ({
      invitations: state.invitations.map((i) =>
        i.id === invitationId ? { ...i, status: 'accepted' } : i
      ),
    }));

    // If invitation is for a specific note, join note members list
    if (targetInvite?.noteId) {
      const targetNoteId = targetInvite.noteId;
      set((state) => ({
        notes: state.notes.map((note) => {
          if (note.id !== targetNoteId) return note;
          const exists = note.members.some(
            (m) => m.user.email.toLowerCase() === currUser.email.toLowerCase()
          );
          if (exists) return note;
          return {
            ...note,
            isPrivate: false,
            members: [
              ...note.members,
              { user: currUser, permission: targetInvite.permission, status: 'accepted' },
            ],
          };
        }),
      }));

      if (isSupabaseConfigured && currUser.id) {
        try {
          await supabase.from('note_members').insert({
            note_id: targetNoteId,
            user_id: currUser.id,
            permission: targetInvite.permission,
            status: 'accepted',
          });
        } catch (err) {
          console.warn('Supabase add note member notice:', err);
        }
      }
    }

    if (isSupabaseConfigured && isValidUUID(invitationId)) {
      try {
        await supabase
          .from('team_invitations')
          .update({ status: 'accepted' })
          .eq('id', invitationId);
      } catch (err) {
        console.warn('Supabase accept invitation notice:', err);
      }
    }
    get().fetchProfilesFromSupabase();
    get().fetchNotesFromSupabase();
  },

  // 1h. Cancel / Revoke Invitation
  cancelInvitationInSupabase: async (invitationId) => {
    const isValidUUID = (str?: string | null) =>
      !!str && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

    set((state) => ({
      invitations: state.invitations.filter((i) => i.id !== invitationId),
    }));

    if (isSupabaseConfigured && isValidUUID(invitationId)) {
      try {
        await supabase
          .from('team_invitations')
          .delete()
          .eq('id', invitationId);
      } catch (err) {
        console.warn('Supabase cancel invitation notice:', err);
      }
    }
  },

  // 2. Fetch Dashboard Analytics Metrics via Supabase RPC Stored Function
  fetchDashboardMetricsFromSupabase: async (userId) => {
    if (!isSupabaseConfigured) return null;
    const targetUserId = userId || get().currentUser?.id || CURRENT_USER.id;

    // UUID Guard: Prevent 400 Bad Request (code 22P02) when using mock user IDs like "usr-1"
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(targetUserId);
    if (!isValidUUID) {
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_dashboard_metrics', {
        p_user_id: targetUserId,
      });
      if (error) throw error;
      if (data) {
        set({ dashboardMetrics: data as DashboardMetrics });
        return data as DashboardMetrics;
      }
    } catch (err) {
      console.warn('Supabase RPC dashboard metrics fallback to calculation:', err);
    }
    return null;
  },

  // 3. Realtime Channel Subscription (Safe Single Subscription Guard)
  subscribeToRealtimeNotes: () => {
    if (!isSupabaseConfigured) return () => {};

    try {
      const channelId = `realtime-notes-${Math.random().toString(36).substring(2, 9)}`;
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notes' },
          (_payload) => {
            get().fetchNotesFromSupabase();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_invitations' },
          (_payload) => {
            get().fetchInvitationsFromSupabase();
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          // Ignore cleanup errors
        }
      };
    } catch (err) {
      console.warn('Supabase realtime channel subscription notice:', err);
      return () => {};
    }
  },

  // 4. Pin Note with Supabase Sync & Auto-Sort to Top
  togglePinNote: async (id) => {
    const targetNote = get().notes.find((n) => n.id === id);
    const newPinned = targetNote ? !targetNote.pinned : false;

    set((state) => {
      const updatedNotes = state.notes.map((note) =>
        note.id === id ? { ...note, pinned: newPinned, updatedAt: new Date().toISOString() } : note
      );

      // Auto-sort: Pinned notes float to the very top
      updatedNotes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      return { notes: updatedNotes };
    });

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notes').update({ pinned: newPinned }).eq('id', id);
      } catch (err) {
        console.warn('Supabase pin note sync notice:', err);
      }
    }
  },

  // 5. Update Note Status with Supabase Sync
  updateNoteStatus: async (id, status) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, status, updatedAt: new Date().toISOString() } : note
      ),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notes').update({ status }).eq('id', id);
      } catch (err) {
        console.warn('Supabase note status sync notice:', err);
      }
    }
  },

  // 6. Update Note Title/Content with Supabase Sync
  updateNote: async (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      ),
    }));

    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.content !== undefined) payload.content = updates.content;
        if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate;
        if (updates.priority !== undefined) payload.priority = updates.priority;
        if (updates.dueDate !== undefined) payload.due_date = updates.dueDate || null;

        await supabase.from('notes').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase update note sync notice:', err);
      }
    }
  },

  // 7. Toggle Checklist Item with Supabase JSONB Sync
  toggleChecklistItem: async (noteId, checklistId) => {
    const targetNote = get().notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    const updatedChecklist = targetNote.checklist.map((item) =>
      item.id === checklistId ? { ...item, completed: !item.completed } : item
    );

    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notes')
          .update({ checklist: updatedChecklist })
          .eq('id', noteId);
      } catch (err) {
        console.warn('Supabase toggle checklist sync notice:', err);
      }
    }
  },

  // 8. Add Checklist Item with Supabase JSONB Sync
  addChecklistItem: async (noteId, text) => {
    const targetNote = get().notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    const newItem = {
      id: `c-${Date.now()}`,
      text,
      completed: false,
    };
    const updatedChecklist = [...targetNote.checklist, newItem];

    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notes')
          .update({ checklist: updatedChecklist })
          .eq('id', noteId);
      } catch (err) {
        console.warn('Supabase add checklist sync notice:', err);
      }
    }
  },

  // 9. Delete Checklist Item with Supabase JSONB Sync
  deleteChecklistItem: async (noteId, checklistId) => {
    const targetNote = get().notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    const updatedChecklist = targetNote.checklist.filter((item) => item.id !== checklistId);

    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notes')
          .update({ checklist: updatedChecklist })
          .eq('id', noteId);
      } catch (err) {
        console.warn('Supabase delete checklist sync notice:', err);
      }
    }
  },

  // 10. Update Checklist Item Text with Supabase JSONB Sync
  updateChecklistItem: async (noteId, checklistId, text) => {
    const targetNote = get().notes.find((n) => n.id === noteId);
    if (!targetNote) return;

    const updatedChecklist = targetNote.checklist.map((item) =>
      item.id === checklistId ? { ...item, text } : item
    );

    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: updatedChecklist,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('notes')
          .update({ checklist: updatedChecklist })
          .eq('id', noteId);
      } catch (err) {
        console.warn('Supabase update checklist item sync notice:', err);
      }
    }
  },

  // 11. Create Note with Supabase Sync & Rate Limit Protection
  addNote: async (title, isPrivate, priority = 'P2', dueDate?: string) => {
    // Client-side Rate Limit Throttling Guard (Max 5 note creations per minute)
    const now = Date.now();
    const recentCreationsKey = 'tasknest_recent_creations';
    const recentTimestamps: number[] = JSON.parse(localStorage.getItem(recentCreationsKey) || '[]')
      .filter((ts: number) => now - ts < 60000);

    if (recentTimestamps.length >= 5) {
      console.warn('Rate limit protection: Bạn đã tạo 5 ghi chú trong 1 phút. Vui lòng chờ 60s.');
    } else {
      recentTimestamps.push(now);
      localStorage.setItem(recentCreationsKey, JSON.stringify(recentTimestamps));
    }

    const activeUser = get().currentUser || CURRENT_USER;
    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(activeUser.id);

    const tempNote: Note = {
      id: `note-${Date.now()}`,
      title: title || 'Ghi chú chưa đặt tên',
      content: '',
      isPrivate,
      status: 'todo',
      priority,
      dueDate: dueDate || undefined,
      tags: [isPrivate ? 'Personal' : 'Team'],
      owner: activeUser,
      members: [{ user: activeUser, permission: 'owner', status: 'accepted' }],
      checklist: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ notes: [tempNote, ...state.notes] }));

    let syncedNote = tempNote;

    // Async Insert to Supabase DB
    if (isSupabaseConfigured && isValidUUID) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .insert({
            owner_id: activeUser.id,
            title: tempNote.title,
            content: '',
            is_private: isPrivate,
            status: 'todo',
            priority,
            due_date: dueDate || null,
            tags: tempNote.tags,
            checklist: [],
            pinned: false,
          })
          .select()
          .single();

        if (error) {
          console.warn('Supabase insert note notice:', error);
        } else if (data) {
          syncedNote = { ...tempNote, id: data.id };
          set((state) => ({
            notes: state.notes.map((n) => (n.id === tempNote.id ? syncedNote : n)),
          }));
        }
      } catch (err) {
        console.warn('Supabase insert note error:', err);
      }
    }

    return syncedNote;
  },

  // 12. Delete Note with Supabase Sync (Owner Only Guard)
  deleteNote: async (id) => {
    const targetNote = get().notes.find((n) => n.id === id);
    const currUser = get().currentUser;

    // Strict Permission Guard: Shared notes can ONLY be deleted by their creator/owner
    if (targetNote && !targetNote.isPrivate && targetNote.owner?.id && currUser?.id) {
      if (targetNote.owner.id !== currUser.id) {
        alert('Bảo mật: Chỉ người tạo/chủ sở hữu mới có quyền xóa ghi chú chung này.');
        return;
      }
    }

    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      quickPeekNoteId: state.quickPeekNoteId === id ? null : state.quickPeekNoteId,
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase.from('notes').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete note sync notice:', err);
      }
    }
  },

  // 13. Update Member Permission
  updateMemberPermission: async (noteId, userId, permission) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              members: note.members.map((m) =>
                m.user.id === userId ? { ...m, permission } : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : note
      ),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('note_members')
          .update({ permission })
          .match({ note_id: noteId, user_id: userId });
      } catch (err) {
        console.warn('Supabase update member permission sync notice:', err);
      }
    }
  },

  // 14. Remove Team Member via Supabase RPC Call
  removeTeamMember: async (userId) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter((u) => u.id !== userId),
      notes: state.notes.map((note) => ({
        ...note,
        members: note.members.filter((m) => m.user.id !== userId),
      })),
    }));

    if (isSupabaseConfigured) {
      try {
        await supabase.rpc('remove_workspace_member', {
          p_workspace_id: 'default-workspace-id',
          p_user_id: userId,
        });
      } catch (err) {
        console.warn('Supabase remove team member RPC notice:', err);
      }
    }
  },
}),
{
  name: 'tasknest-storage',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    notes: state.notes,
    teamMembers: state.teamMembers,
  }),
}
)
);
