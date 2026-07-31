import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Share2, UserPlus, Check, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { useAppStore } from '../hooks/useAppStore';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { AvatarStack } from '../components/ui/AvatarStack';
import { PriorityLevel } from '../types';

interface NoteDetailPageProps {
  onOpenShareModal?: () => void;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ onOpenShareModal }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, toggleChecklistItem, deleteNote } = useAppStore();

  const note = notes.find((n) => n.id === id);

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isPrivate, setIsPrivate] = useState(note?.isPrivate ?? true);
  const [priority, setPriority] = useState<PriorityLevel>(note?.priority || 'P2');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [savedStatus, setSavedStatus] = useState('Saved to Supabase');

  if (!note) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Note Not Found</h2>
        <button onClick={() => navigate('/notes')} className="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
          Return to Notes
        </button>
      </div>
    );
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSavedStatus('Saving changes...');
    setTimeout(() => setSavedStatus('Saved 1s ago'), 800);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSavedStatus('Saving changes...');
    setTimeout(() => setSavedStatus('Saved 1s ago'), 800);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    note.checklist.push({
      id: `c-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
    });
    setNewChecklistText('');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(note.id);
      navigate('/notes');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Notes</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Privacy Switcher */}
          <button
            onClick={() => setIsPrivate(!isPrivate)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPrivate
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {isPrivate ? <Lock className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{isPrivate ? 'Private Note' : 'Shared Note'}</span>
          </button>

          {/* Share Button */}
          {!isPrivate && onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow transition-all"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete Note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Editor Canvas Container */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={priority} />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="bg-background text-xs text-slate-300 px-2 py-1 rounded-lg border border-surface-border focus:outline-none"
            >
              <option value="P1">Priority: P1 High</option>
              <option value="P2">Priority: P2 Med</option>
              <option value="P3">Priority: P3 Low</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <Sparkles className="h-3 w-3" /> {savedStatus}
            </span>
            {!isPrivate && <AvatarStack members={note.members} />}
          </div>
        </div>

        {/* Note Title Input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note..."
          className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-white placeholder-slate-600 focus:outline-none tracking-tight"
        />

        {/* Note Content Textarea */}
        <textarea
          rows={10}
          value={content}
          onChange={handleContentChange}
          placeholder="Type your work note content here..."
          className="w-full bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none text-base leading-relaxed resize-none"
        />

        {/* Checklist Section */}
        <div className="pt-6 border-t border-surface-border space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Checklist Tasks ({note.checklist.filter((c) => c.completed).length}/{note.checklist.length})
          </h4>

          <div className="space-y-2">
            {note.checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleChecklistItem(note.id, item.id)}
                className="flex items-center gap-3 p-3 rounded-xl bg-background/60 border border-surface-border/60 hover:border-slate-600 transition-colors cursor-pointer select-none"
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

          {/* Add Checklist Item Input */}
          <form onSubmit={handleAddChecklist} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              placeholder="Add a new checklist task..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-background border border-surface-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="py-2 px-3.5 rounded-xl bg-surface-hover text-slate-200 hover:text-white border border-surface-border text-xs font-semibold"
            >
              Add Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
