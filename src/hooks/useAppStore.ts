import { create } from 'zustand';
import { Note, NoteStatus, PriorityLevel, MemberPermission, UserProfile } from '../types';
import { MOCK_NOTES, MOCK_USERS, CURRENT_USER } from '../constants/mockData';
import { supabase } from '../lib/supabaseClient';

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
  searchQuery: string;
  isCommandPaletteOpen: boolean;
  quickPeekNoteId: string | null;
  isLoadingSupabase: boolean;
  dashboardMetrics: DashboardMetrics | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  toggleCommandPalette: () => void;
  setQuickPeekNoteId: (id: string | null) => void;

  // Supabase Backend Sync Actions
  fetchNotesFromSupabase: () => Promise<void>;
  fetchDashboardMetricsFromSupabase: (userId?: string) => Promise<DashboardMetrics | null>;
  subscribeToRealtimeNotes: () => () => void;

  // Note & Member Actions
  togglePinNote: (id: string) => Promise<void>;
  updateNoteStatus: (id: string, status: NoteStatus) => Promise<void>;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPrivate' | 'priority'>>) => Promise<void>;
  toggleChecklistItem: (noteId: string, checklistId: string) => Promise<void>;
  addChecklistItem: (noteId: string, text: string) => Promise<void>;
  deleteChecklistItem: (noteId: string, checklistId: string) => Promise<void>;
  updateChecklistItem: (noteId: string, checklistId: string, text: string) => Promise<void>;
  updateMemberPermission: (noteId: string, userId: string, permission: MemberPermission) => Promise<void>;
  removeTeamMember: (userId: string) => Promise<void>;
  addNote: (title: string, isPrivate: boolean, priority?: PriorityLevel) => Note;
  deleteNote: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  notes: MOCK_NOTES,
  teamMembers: MOCK_USERS,
  searchQuery: '',
  isCommandPaletteOpen: false,
  quickPeekNoteId: null,
  isLoadingSupabase: false,
  dashboardMetrics: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setQuickPeekNoteId: (id) => set({ quickPeekNoteId: id }),

  // 1. Fetch Notes from Supabase DB
  fetchNotesFromSupabase: async () => {
    set({ isLoadingSupabase: true });
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        const mappedNotes: Note[] = data.map((item: any) => ({
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
          owner: CURRENT_USER,
          members: [{ user: CURRENT_USER, permission: 'owner', status: 'accepted' }],
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
        }));
        set({ notes: mappedNotes });
      }
    } catch (err) {
      console.warn('Supabase fetch notes fallback to local state:', err);
    } finally {
      set({ isLoadingSupabase: false });
    }
  },

  // 2. Fetch Dashboard Analytics Metrics via Supabase RPC Stored Function
  fetchDashboardMetricsFromSupabase: async (userId) => {
    try {
      const targetUserId = userId || CURRENT_USER.id;
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

  // 3. Realtime Channel Subscription
  subscribeToRealtimeNotes: () => {
    const channel = supabase
      .channel('public:notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes' },
        (_payload) => {
          get().fetchNotesFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // 4. Pin Note with Supabase Sync
  togglePinNote: async (id) => {
    const targetNote = get().notes.find((n) => n.id === id);
    const newPinned = targetNote ? !targetNote.pinned : false;

    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, pinned: newPinned } : note
      ),
    }));

    try {
      await supabase.from('notes').update({ pinned: newPinned }).eq('id', id);
    } catch (err) {
      console.warn('Supabase pin note sync notice:', err);
    }
  },

  // 5. Update Note Status with Supabase Sync
  updateNoteStatus: async (id, status) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, status, updatedAt: new Date().toISOString() } : note
      ),
    }));

    try {
      await supabase.from('notes').update({ status }).eq('id', id);
    } catch (err) {
      console.warn('Supabase note status sync notice:', err);
    }
  },

  // 6. Update Note Title/Content with Supabase Sync
  updateNote: async (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      ),
    }));

    try {
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.content !== undefined) payload.content = updates.content;
      if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate;
      if (updates.priority !== undefined) payload.priority = updates.priority;

      await supabase.from('notes').update(payload).eq('id', id);
    } catch (err) {
      console.warn('Supabase update note sync notice:', err);
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

    try {
      await supabase
        .from('notes')
        .update({ checklist: updatedChecklist })
        .eq('id', noteId);
    } catch (err) {
      console.warn('Supabase toggle checklist sync notice:', err);
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

    try {
      await supabase
        .from('notes')
        .update({ checklist: updatedChecklist })
        .eq('id', noteId);
    } catch (err) {
      console.warn('Supabase add checklist sync notice:', err);
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

    try {
      await supabase
        .from('notes')
        .update({ checklist: updatedChecklist })
        .eq('id', noteId);
    } catch (err) {
      console.warn('Supabase delete checklist sync notice:', err);
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

    try {
      await supabase
        .from('notes')
        .update({ checklist: updatedChecklist })
        .eq('id', noteId);
    } catch (err) {
      console.warn('Supabase update checklist item sync notice:', err);
    }
  },

  // 11. Create Note with Supabase Sync
  addNote: (title, isPrivate, priority = 'P2') => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: title || 'Untitled Note',
      content: '',
      isPrivate,
      status: 'todo',
      priority,
      tags: [isPrivate ? 'Personal' : 'Team'],
      owner: CURRENT_USER,
      members: [{ user: CURRENT_USER, permission: 'owner', status: 'accepted' }],
      checklist: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ notes: [newNote, ...state.notes] }));

    // Async Insert to Supabase DB
    supabase
      .from('notes')
      .insert({
        owner_id: CURRENT_USER.id,
        title: newNote.title,
        content: '',
        is_private: isPrivate,
        status: 'todo',
        priority,
        tags: newNote.tags,
        checklist: [],
        pinned: false,
      })
      .then(({ data, error }) => {
        if (error) console.warn('Supabase insert note notice:', error);
      });

    return newNote;
  },

  // 12. Delete Note with Supabase Sync
  deleteNote: async (id) => {
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      quickPeekNoteId: state.quickPeekNoteId === id ? null : state.quickPeekNoteId,
    }));

    try {
      await supabase.from('notes').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete note sync notice:', err);
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

    try {
      await supabase
        .from('note_members')
        .update({ permission })
        .match({ note_id: noteId, user_id: userId });
    } catch (err) {
      console.warn('Supabase update member permission sync notice:', err);
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

    try {
      await supabase.rpc('remove_workspace_member', {
        p_workspace_id: 'default-workspace-id',
        p_user_id: userId,
      });
    } catch (err) {
      console.warn('Supabase remove team member RPC notice:', err);
    }
  },
}));
