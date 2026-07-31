import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Lock, Share2, Plus, Users, Settings, X } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const { isCommandPaletteOpen, setCommandPaletteOpen, notes, setQuickPeekNoteId, addNote } = useAppStore();
  const [query, setQuery] = useState('');

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.content.toLowerCase().includes(query.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelectNote = (id: string) => {
    setQuickPeekNoteId(id);
    setCommandPaletteOpen(false);
  };

  const handleCreateNewNote = (isPrivate: boolean) => {
    const newNote = addNote('Untitled Note', isPrivate);
    setCommandPaletteOpen(false);
    navigate(`/notes/${newNote.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-surface border border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-surface-border flex items-center gap-3 bg-surface-hover/30">
          <Search className="h-5 w-5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search notes..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 focus:outline-none text-base font-medium"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {!query && (
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <div className="space-y-1 mt-1">
                <button
                  onClick={() => handleCreateNewNote(true)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-amber-500/10 text-amber-300 transition-colors text-sm font-medium text-left"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4" />
                    <span>Create Private Work Note</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Shortcut</span>
                </button>
                <button
                  onClick={() => handleCreateNewNote(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-indigo-500/10 text-indigo-300 transition-colors text-sm font-medium text-left"
                >
                  <div className="flex items-center gap-3">
                    <Plus className="h-4 w-4" />
                    <span>Create Shared Team Note</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Shortcut</span>
                </button>
              </div>
            </div>
          )}

          {/* Search Notes Results */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {query ? `Search Results (${filteredNotes.length})` : 'Recent Notes'}
            </div>
            <div className="space-y-1 mt-1">
              {filteredNotes.length === 0 ? (
                <p className="px-3 py-4 text-sm text-slate-400 text-center">No notes found matching "{query}"</p>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectNote(note.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {note.isPrivate ? (
                        <Lock className="h-4 w-4 text-amber-400 shrink-0" />
                      ) : (
                        <Share2 className="h-4 w-4 text-indigo-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                          {note.title}
                        </div>
                        <div className="text-xs text-slate-400 truncate">{note.content}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 shrink-0 ml-2">
                      {note.isPrivate ? 'Private' : 'Shared'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-background/50 border-t border-surface-border text-xs text-slate-400 flex items-center justify-between">
          <span>
            Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↑</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↓</kbd> to navigate
          </span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
