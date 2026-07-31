import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Lock, Share2, Trash2, Filter, Pin, Plus, Search } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';

export const NotesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notes, setQuickPeekNoteId, togglePinNote, addNote } = useAppStore();

  const currentTab = searchParams.get('tab') || 'all';
  const [filterPriority, setFilterPriority] = React.useState<string>('all');
  const [searchFilter, setSearchFilter] = React.useState<string>('');

  // Filter notes based on active Tab
  let filteredNotes = notes;
  if (currentTab === 'private') {
    filteredNotes = notes.filter((n) => n.isPrivate);
  } else if (currentTab === 'shared') {
    filteredNotes = notes.filter((n) => !n.isPrivate);
  } else if (currentTab === 'trash') {
    filteredNotes = []; // Empty mock trash
  }

  // Filter notes based on Priority
  if (filterPriority !== 'all') {
    filteredNotes = filteredNotes.filter((n) => n.priority === filterPriority);
  }

  // Filter notes based on Search keyword
  if (searchFilter.trim()) {
    filteredNotes = filteredNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        n.content.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleCreateNote = () => {
    const isPrivate = currentTab === 'private';
    const newNote = addNote('Untitled Note', isPrivate);
    navigate(`/notes/${newNote.id}`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Work Notes Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal vault & shared team collaborations seamlessly.
          </p>
        </div>

        <button
          onClick={handleCreateNote}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Tabs Bar & Filters */}
      <div className="glass-panel p-2 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 4 Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'all'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>All Notes</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
              {notes.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('private')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'private'
                ? 'bg-amber-600 text-white shadow-glow-amber'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Lock className="h-4 w-4 text-amber-400" />
            <span>Private Vault</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
              {notes.filter((n) => n.isPrivate).length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('shared')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'shared'
                ? 'bg-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Share2 className="h-4 w-4 text-indigo-400" />
            <span>Shared Team</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
              {notes.filter((n) => !n.isPrivate).length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('trash')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'trash'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>Trash</span>
          </button>
        </div>

        {/* Priority Filter & Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter notes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-background border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-background px-2 py-1 rounded-xl border border-surface-border">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="P1">P1 • High</option>
              <option value="P2">P2 • Medium</option>
              <option value="P3">P3 • Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Notes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no notes matching your active tab or search filter. Create a new note to get started!
          </p>
          <button
            onClick={handleCreateNote}
            className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Create New Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => setQuickPeekNoteId(note.id)}
              className="glass-panel glass-panel-hover p-5 rounded-2xl cursor-pointer flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      note.isPrivate
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {note.isPrivate ? <Lock className="h-3 w-3" /> : <Share2 className="h-3 w-3" />}
                    {note.isPrivate ? 'Private' : 'Shared'}
                  </span>

                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={note.priority} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinNote(note.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        note.pinned ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                      }`}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{note.content}</p>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-surface-border/50 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">
                  {note.checklist.length > 0
                    ? `${note.checklist.filter((c) => c.completed).length}/${note.checklist.length} Tasks`
                    : new Date(note.updatedAt).toLocaleDateString()}
                </span>
                {!note.isPrivate && <AvatarStack members={note.members} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
