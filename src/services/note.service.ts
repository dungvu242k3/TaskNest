import { supabase } from '../lib/supabase/client';
import { Note, NoteStatus, PriorityLevel } from '../types';

export const NoteService = {
  /**
   * Fetch all notes accessible by the current authenticated user (Private + Shared)
   */
  async fetchUserNotes(): Promise<Note[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notes')
      .select(`
        *,
        owner:profiles!notes_owner_id_fkey(*),
        members:note_members(*, user:profiles(*))
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      content: row.content || '',
      isPrivate: row.is_private,
      status: row.status as NoteStatus,
      priority: (row.priority || 'P2') as PriorityLevel,
      dueDate: row.due_date,
      tags: row.tags || [],
      owner: {
        id: row.owner?.id || row.owner_id,
        fullName: row.owner?.full_name || 'Unknown User',
        email: row.owner?.email || '',
        avatarUrl: row.owner?.avatar_url || '',
      },
      members: (row.members || []).map((m: any) => ({
        user: {
          id: m.user?.id || m.user_id,
          fullName: m.user?.full_name || '',
          email: m.user?.email || '',
          avatarUrl: m.user?.avatar_url || '',
        },
        permission: m.permission,
        status: m.status,
      })),
      checklist: row.checklist || [],
      pinned: row.pinned || false,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  /**
   * Create a new Note in Supabase
   */
  async createNote(title: string, isPrivate: boolean, priority: PriorityLevel = 'P2'): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notes')
      .insert({
        owner_id: user.id,
        title,
        content: '',
        is_private: isPrivate,
        status: 'todo',
        priority,
        pinned: false,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  /**
   * Update an existing Note
   */
  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.isPrivate !== undefined) payload.is_private = updates.isPrivate;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.pinned !== undefined) payload.pinned = updates.pinned;
    if (updates.checklist !== undefined) payload.checklist = updates.checklist;

    const { error } = await supabase.from('notes').update(payload).eq('id', id);
    if (error) throw error;
  },

  /**
   * Delete a note by ID
   */
  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },
};
