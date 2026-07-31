import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { ShareModal } from './components/common/ShareModal';
import { CreateNoteModal } from './components/common/CreateNoteModal';
import { DashboardPage } from './pages/DashboardPage';
import { NotesPage } from './pages/NotesPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RequireAuth } from './components/common/RequireAuth';
import { useAppStore } from './hooks/useAppStore';

export const App: React.FC = () => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalNoteId, setShareModalNoteId] = useState<string | undefined>(undefined);
  const [isCreateNoteModalOpen, setCreateNoteModalOpen] = useState(false);
  const { fetchNotesFromSupabase, fetchInvitationsFromSupabase, subscribeToRealtimeNotes, initAuthSession } = useAppStore();

  const handleOpenShareModal = (noteId?: string) => {
    setShareModalNoteId(noteId);
    setShareModalOpen(true);
  };

  // Global Supabase Realtime Subscription, Auth Check & Initial Fetch
  useEffect(() => {
    initAuthSession();
    fetchNotesFromSupabase();
    fetchInvitationsFromSupabase();
    const unsubscribe = subscribeToRealtimeNotes();
    return () => unsubscribe();
  }, [initAuthSession, fetchNotesFromSupabase, fetchInvitationsFromSupabase, subscribeToRealtimeNotes]);

  return (
    <Router>
      <Routes>
        {/* Standalone Auth Route (No Sidebar) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Main Application Workspace Layout Routes (Protected by RequireAuth) */}
        <Route
          path="*"
          element={
            <RequireAuth>
              <div className="flex min-h-screen bg-background text-slate-100 font-sans antialiased">
                {/* Fixed Left Sidebar */}
                <Sidebar onOpenCreateNoteModal={() => setCreateNoteModalOpen(true)} />

                {/* Main Application Container */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Top Sticky Header */}
                  <Header />

                  {/* Main Page Body View */}
                  <main className="flex-1 overflow-y-auto">
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <DashboardPage onOpenCreateNoteModal={() => setCreateNoteModalOpen(true)} />
                        }
                      />
                      <Route
                        path="/notes"
                        element={
                          <NotesPage
                            onOpenCreateNoteModal={() => setCreateNoteModalOpen(true)}
                            onOpenShareModal={(id) => handleOpenShareModal(id)}
                          />
                        }
                      />
                      <Route
                        path="/notes/:id"
                        element={<NoteDetailPage onOpenShareModal={(id) => handleOpenShareModal(id)} />}
                      />
                      <Route
                        path="/team"
                        element={<TeamPage onOpenShareModal={() => handleOpenShareModal()} />}
                      />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </main>
                </div>

                {/* Global Modals & Overlay Drawers */}
                <CommandPalette />
                <ShareModal
                  isOpen={isShareModalOpen}
                  onClose={() => setShareModalOpen(false)}
                  noteId={shareModalNoteId}
                />
                <CreateNoteModal isOpen={isCreateNoteModalOpen} onClose={() => setCreateNoteModalOpen(false)} />
              </div>
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
