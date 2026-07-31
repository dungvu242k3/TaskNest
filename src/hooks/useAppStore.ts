import { create } from 'zustand';
import { Note, NoteStatus, PriorityLevel, MemberPermission } from '../types';
import { MOCK_NOTES, CURRENT_USER } from '../constants/mockData';

interface AppState {
  notes: Note[];
  searchQuery: string;
  isCommandPaletteOpen: boolean;
  quickPeekNoteId: string | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setCommandPaletteOpen: (isOpen: boolean) => void;
  toggleCommandPalette: () => void;
  setQuickPeekNoteId: (id: string | null) => void;
  
  // Note Actions
  togglePinNote: (id: string) => void;
  updateNoteStatus: (id: string, status: NoteStatus) => void;
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'isPrivate' | 'priority'>>) => void;
  toggleChecklistItem: (noteId: string, checklistId: string) => void;
  addChecklistItem: (noteId: string, text: string) => void;
  deleteChecklistItem: (noteId: string, checklistId: string) => void;
  updateChecklistItem: (noteId: string, checklistId: string, text: string) => void;
  updateMemberPermission: (noteId: string, userId: string, permission: MemberPermission) => void;
  addNote: (title: string, isPrivate: boolean, priority?: PriorityLevel) => Note;
  deleteNote: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  notes: MOCK_NOTES,
  searchQuery: '',
  isCommandPaletteOpen: false,
  quickPeekNoteId: null,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  setQuickPeekNoteId: (id) => set({ quickPeekNoteId: id }),

  togglePinNote: (id) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note
      ),
    })),

  updateNoteStatus: (id, status) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, status, updatedAt: new Date().toISOString() } : note
      ),
    })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note
      ),
    })),

  toggleChecklistItem: (noteId, checklistId) =>
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: note.checklist.map((item) =>
            item.id === checklistId ? { ...item, completed: !item.completed } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  addChecklistItem: (noteId, text) =>
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        const newItem = {
          id: `c-${Date.now()}`,
          text,
          completed: false,
        };
        return {
          ...note,
          checklist: [...note.checklist, newItem],
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  deleteChecklistItem: (noteId, checklistId) =>
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: note.checklist.filter((item) => item.id !== checklistId),
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  updateChecklistItem: (noteId, checklistId, text) =>
    set((state) => ({
      notes: state.notes.map((note) => {
        if (note.id !== noteId) return note;
        return {
          ...note,
          checklist: note.checklist.map((item) =>
            item.id === checklistId ? { ...item, text } : item
          ),
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

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
    return newNote;
  },

  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      quickPeekNoteId: state.quickPeekNoteId === id ? null : state.quickPeekNoteId,
    })),

  updateMemberPermission: (noteId, userId, permission) =>
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
    })),
}));
