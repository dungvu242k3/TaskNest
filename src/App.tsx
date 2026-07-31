import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { CommandPalette } from './components/common/CommandPalette';
import { QuickPeekDrawer } from './components/common/QuickPeekDrawer';
import { ShareModal } from './components/common/ShareModal';
import { CreateNoteModal } from './components/common/CreateNoteModal';
import { DashboardPage } from './pages/DashboardPage';
import { NotesPage } from './pages/NotesPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isCreateNoteModalOpen, setCreateNoteModalOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-background text-slate-100 font-sans antialiased">
        {/* Fixed Left Sidebar */}
        <Sidebar onOpenCreateNoteModal={() => setCreateNoteModalOpen(true)} />

        {/* Main Application Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Sticky Header */}
          <Header onOpenShareModal={() => setShareModalOpen(true)} />

          {/* Main Page Body View */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/notes" element={<NotesPage onOpenCreateNoteModal={() => setCreateNoteModalOpen(true)} />} />
              <Route path="/notes/:id" element={<NoteDetailPage onOpenShareModal={() => setShareModalOpen(true)} />} />
              <Route path="/team" element={<TeamPage onOpenShareModal={() => setShareModalOpen(true)} />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>

        {/* Global Modals & Overlay Drawers */}
        <CommandPalette />
        <QuickPeekDrawer />
        <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} />
        <CreateNoteModal isOpen={isCreateNoteModalOpen} onClose={() => setCreateNoteModalOpen(false)} />
      </div>
    </Router>
  );
};

export default App;
