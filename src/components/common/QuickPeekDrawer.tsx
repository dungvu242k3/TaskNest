import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Share2, Calendar, CheckSquare, ExternalLink, Pin, Trash2 } from 'lucide-react';
import { useAppStore } from '../../hooks/useAppStore';
import { PriorityBadge } from '../ui/PriorityBadge';
import { AvatarStack } from '../ui/AvatarStack';

export const QuickPeekDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { notes, quickPeekNoteId, setQuickPeekNoteId, togglePinNote, toggleChecklistItem, deleteNote } = useAppStore();

  if (!quickPeekNoteId) return null;

  const note = notes.find((n) => n.id === quickPeekNoteId);
  if (!note) return null;

  const handleOpenFullEditor = () => {
    setQuickPeekNoteId(null);
    navigate(`/notes/${note.id}`);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-surface border-l border-surface-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-hover/30">
          <div className="flex items-center gap-2">
            {note.isPrivate ? (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Lock className="h-3 w-3" /> Private Note
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Share2 className="h-3 w-3" /> Shared Team Note
              </span>
            )}
            <PriorityBadge priority={note.priority} />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => togglePinNote(note.id)}
              title={note.pinned ? 'Unpin Note' : 'Pin Note'}
              className={`p-1.5 rounded-lg transition-colors ${
                note.pinned ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Pin className="h-4 w-4" />
            </button>
            <button
              onClick={handleOpenFullEditor}
              title="Open Full Editor"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteNote(note.id)}
              title="Delete Note"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setQuickPeekNoteId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drawer Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Note Title */}
          <div>
            <h2 className="text-xl font-bold text-white leading-snug">{note.title}</h2>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Due: {note.dueDate || 'No due date'}
              </span>
              <span>Updated {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Members Stack if Shared */}
          {!note.isPrivate && (
            <div className="p-3 rounded-xl bg-background/50 border border-surface-border flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Collaborators</span>
              <AvatarStack members={note.members} />
            </div>
          )}

          {/* Note Content Text */}
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed bg-surface-hover/20 p-4 rounded-xl border border-surface-border/50">
            {note.content || <p className="italic text-slate-500">No content provided yet.</p>}
          </div>

          {/* Checklist Section */}
          {note.checklist.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="h-4 w-4 text-indigo-400" /> Tasks Checklist (
                {note.checklist.filter((c) => c.completed).length}/{note.checklist.length})
              </h4>
              <div className="space-y-1.5">
                {note.checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(note.id, item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-background/60 border border-surface-border/60 hover:border-slate-600 transition-colors cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {note.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-surface-border bg-surface-hover/20 flex justify-end">
          <button
            onClick={handleOpenFullEditor}
            className="flex items-center gap-2 py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
          >
            <span>Open Full Editor Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
